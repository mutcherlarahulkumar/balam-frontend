import React from 'react';
import {
  Grid, Card, CardContent, Typography, Box, Chip, Divider,
  List, ListItem, ListItemText, ListItemSecondaryAction, Alert,
} from '@mui/material';
import PolicyIcon from '@mui/icons-material/Policy';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useRouter } from 'next/router';
import StatCard from '@/components/common/StatCard';
import LoadingState from '@/components/common/LoadingState';
import { usePolicies } from '@/hooks/usePolicies';
import { useFamilies } from '@/hooks/useFamilies';
import { useCommissionSummary } from '@/hooks/useCommission';
import { useFUPDue } from '@/hooks/useFUP';
import { useTodayActivities } from '@/hooks/useActivities';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { PolicyStatusChip } from '@/components/common/StatusChip';
import { useAuth } from '@/context/AuthContext';

export default function DashboardContainer() {
  const { agent } = useAuth();
  const router = useRouter();
  const { data: policies, isLoading } = usePolicies({ limit: 6 });
  const { data: families } = useFamilies({ limit: 1 });
  const { data: commissionSummary } = useCommissionSummary();
  const { data: duePolicies } = useFUPDue({});
  const { data: todayActivities } = useTodayActivities();

  if (isLoading) return <LoadingState />;

  const lapsingCount = policies?.data?.filter((p) => p.daysUntilLapse < 30 && p.status === 'IF').length ?? 0;
  const inForceCount = policies?.data?.filter((p) => p.status === 'IF').length ?? 0;
  const overdueCount = duePolicies?.data?.filter((d) => d.daysOverdue > 0).length ?? 0;

  return (
    <Box>
      {/* Greeting */}
      <Box mb={2.5}>
        <Typography variant="h5" fontWeight={800} color="primary.main">
          Namaste, {agent?.name?.split(' ')[0]} 🙏
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {agent?.agentCode} · {agent?.branch}
          {agent?.club ? ` · ${agent.club}` : ''}
        </Typography>
      </Box>

      {/* Urgent alerts */}
      {lapsingCount > 0 && (
        <Alert
          severity="error"
          icon={<WarningAmberIcon />}
          sx={{ mb: 2, borderRadius: 3, fontSize: '1rem' }}
        >
          <strong>{lapsingCount} {lapsingCount === 1 ? 'policy' : 'policies'}</strong> will lapse within 30 days. Review FUP tracking now.
        </Alert>
      )}
      {overdueCount > 0 && (
        <Alert
          severity="warning"
          sx={{ mb: 2, borderRadius: 3 }}
        >
          <strong>{overdueCount} overdue</strong> premium{overdueCount > 1 ? 's' : ''} need collection.
        </Alert>
      )}

      {/* Key stats */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} md={3}>
          <StatCard
            title="Families"
            value={families?.total ?? 0}
            icon={<PeopleIcon sx={{ fontSize: 32 }} />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            title="Policies"
            value={policies?.total ?? 0}
            icon={<PolicyIcon sx={{ fontSize: 32 }} />}
            color="secondary.main"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            title="In Force"
            value={inForceCount}
            subtitle="active policies"
            color="success.main"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            title="Commission"
            value={formatCurrency(commissionSummary?.currentMonth?.totalCommission)}
            subtitle="this month"
            icon={<TrendingUpIcon sx={{ fontSize: 32 }} />}
            color="secondary.main"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {/* Due this month */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Typography variant="h6">Premiums Due</Typography>
                <Chip
                  label={duePolicies?.data?.length ?? 0}
                  color="warning"
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              </Box>
              {!duePolicies?.data?.length ? (
                <Box display="flex" alignItems="center" gap={1} color="success.main" py={2}>
                  <CheckCircleIcon />
                  <Typography variant="body1">All premiums up to date</Typography>
                </Box>
              ) : (
                <List disablePadding>
                  {duePolicies.data.slice(0, 5).map((d) => (
                    <React.Fragment key={d.policyNo}>
                      <ListItem
                        disablePadding
                        sx={{ py: 1.5, cursor: 'pointer' }}
                        onClick={() => router.push(`/policies/${d.policyNo}`)}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="body1" fontWeight={600}>{d.clientName}</Typography>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              {d.planName} · {formatDate(d.nextPremium)}
                            </Typography>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Box textAlign="right">
                            <Typography variant="body1" fontWeight={700} color="primary.main">
                              {formatCurrency(d.premium)}
                            </Typography>
                            {d.daysOverdue > 0 ? (
                              <Typography variant="caption" color="error.main" fontWeight={700}>
                                {d.daysOverdue}d overdue
                              </Typography>
                            ) : (
                              <Typography variant="caption" color="warning.main">Due</Typography>
                            )}
                          </Box>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent policies */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={1.5}>Recent Policies</Typography>
              {!policies?.data?.length ? (
                <Typography variant="body2" color="text.secondary">No policies yet.</Typography>
              ) : (
                <List disablePadding>
                  {policies.data.slice(0, 5).map((p) => (
                    <React.Fragment key={p.id}>
                      <ListItem
                        disablePadding
                        sx={{ py: 1.5, cursor: 'pointer' }}
                        onClick={() => router.push(`/policies/${p.policyNo}`)}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="body1" fontWeight={600}>{p.clientName}</Typography>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              {p.planName}
                            </Typography>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Box textAlign="right">
                            <PolicyStatusChip status={p.status} />
                            <Typography variant="body2" color="primary.main" fontWeight={600} mt={0.5}>
                              {formatCurrency(p.premium)}
                            </Typography>
                          </Box>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Today's activities */}
        {todayActivities && todayActivities.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                  <Typography variant="h6">Today&apos;s Reminders</Typography>
                  <Chip label={todayActivities.length} color="info" size="small" />
                </Box>
                <List disablePadding>
                  {todayActivities.map((a) => (
                    <React.Fragment key={a.id}>
                      <ListItem disablePadding sx={{ py: 1.25 }}>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Chip label={a.activityType} size="small" variant="outlined" />
                              <Typography variant="body1">{a.details || 'No details'}</Typography>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Chip
                            label={a.status}
                            size="small"
                            color={a.status === 'DONE' ? 'success' : 'warning'}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
