import React from 'react';
import {
  Grid, Card, CardContent, Typography, Box, Chip, Divider,
  List, ListItem, ListItemText, Alert, Button,
} from '@mui/material';
import PolicyIcon from '@mui/icons-material/Policy';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
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

  const { data: policies, isLoading: policiesLoading } = usePolicies({ limit: 6 });
  const { data: families, isLoading: familiesLoading } = useFamilies({ limit: 1 });
  const { data: commissionSummary } = useCommissionSummary();
  const { data: duePolicies } = useFUPDue({});
  const { data: todayActivities } = useTodayActivities();

  if (policiesLoading || familiesLoading) return <LoadingState />;

  const lapsingCount = policies?.data?.filter(p => p.daysUntilLapse < 30 && p.daysUntilLapse >= 0 && p.status === 'IF').length ?? 0;
  const overdueCount = duePolicies?.data?.filter(d => d.daysOverdue > 0).length ?? 0;
  const dueCount = duePolicies?.data?.length ?? 0;

  return (
    <Box>
      {/* Greeting */}
      <Box mb={2.5}>
        <Typography variant="h5" fontWeight={800} color="primary.main">
          Namaste, {agent?.name?.split(' ')[0]}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {agent?.agentCode}{agent?.branch ? ` · ${agent.branch}` : ''}
          {agent?.club ? ` · ${agent.club}` : ''}
        </Typography>
      </Box>

      {/* Urgent alerts */}
      {lapsingCount > 0 && (
        <Alert
          severity="error"
          icon={<WarningAmberIcon />}
          sx={{ mb: 2, borderRadius: 2 }}
          action={<Button size="small" color="inherit" onClick={() => router.push('/fup')}>View FUP</Button>}
        >
          <strong>{lapsingCount} {lapsingCount === 1 ? 'policy' : 'policies'}</strong> will lapse within 30 days.
        </Alert>
      )}
      {overdueCount > 0 && (
        <Alert
          severity="warning"
          sx={{ mb: 2, borderRadius: 2 }}
          action={<Button size="small" color="inherit" onClick={() => router.push('/fup')}>Collect</Button>}
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
            icon={<PeopleIcon sx={{ fontSize: 28 }} />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            title="Policies"
            value={policies?.total ?? 0}
            icon={<PolicyIcon sx={{ fontSize: 28 }} />}
            color="secondary.main"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            title="Due"
            value={dueCount}
            subtitle="premiums pending"
            color={dueCount > 0 ? 'warning.main' : 'success.main'}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            title="Commission"
            value={formatCurrency(commissionSummary?.currentMonth?.totalCommission)}
            subtitle="this month"
            icon={<TrendingUpIcon sx={{ fontSize: 28 }} />}
            color="success.main"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {/* Premiums due */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent sx={{ pb: '12px !important' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Typography variant="h6" fontWeight={700}>Premiums Due</Typography>
                {dueCount > 0 && (
                  <Chip label={dueCount} color="warning" size="small" sx={{ fontWeight: 700 }} />
                )}
              </Box>
              {!duePolicies?.data?.length ? (
                <Box display="flex" alignItems="center" gap={1} py={2} color="success.main">
                  <CheckCircleIcon fontSize="small" />
                  <Typography variant="body2">All premiums up to date</Typography>
                </Box>
              ) : (
                <List disablePadding>
                  {duePolicies.data.slice(0, 5).map((d, i) => (
                    <React.Fragment key={d.policyNo}>
                      {i > 0 && <Divider />}
                      <ListItem
                        disablePadding
                        sx={{ py: 1.25, cursor: 'pointer' }}
                        onClick={() => router.push(`/policies/${d.policyNo}`)}
                      >
                        <ListItemText
                          primary={<Typography variant="body2" fontWeight={600} noWrap>{d.clientName}</Typography>}
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {d.planName} · Due {formatDate(d.nextPremium)}
                            </Typography>
                          }
                        />
                        <Box textAlign="right" ml={1} flexShrink={0}>
                          <Typography variant="body2" fontWeight={700} color="primary.main">
                            {formatCurrency(d.premium)}
                          </Typography>
                          {d.daysOverdue > 0 ? (
                            <Typography variant="caption" color="error.main" fontWeight={700}>
                              {d.daysOverdue}d overdue
                            </Typography>
                          ) : (
                            <Typography variant="caption" color="warning.dark">Due</Typography>
                          )}
                        </Box>
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              )}
              {(duePolicies?.data?.length ?? 0) > 5 && (
                <Box mt={1} textAlign="right">
                  <Button size="small" endIcon={<ChevronRightIcon />} onClick={() => router.push('/fup')}>
                    View all {dueCount}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent policies */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent sx={{ pb: '12px !important' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Typography variant="h6" fontWeight={700}>Recent Policies</Typography>
                <Button size="small" endIcon={<ChevronRightIcon />} onClick={() => router.push('/policies')}>
                  All
                </Button>
              </Box>
              {!policies?.data?.length ? (
                <Typography variant="body2" color="text.secondary" py={2}>No policies yet.</Typography>
              ) : (
                <List disablePadding>
                  {policies.data.slice(0, 5).map((p, i) => (
                    <React.Fragment key={p.id}>
                      {i > 0 && <Divider />}
                      <ListItem
                        disablePadding
                        sx={{ py: 1.25, cursor: 'pointer' }}
                        onClick={() => router.push(`/policies/${p.policyNo}`)}
                      >
                        <ListItemText
                          primary={<Typography variant="body2" fontWeight={600} noWrap>{p.clientName}</Typography>}
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {p.planName} · {formatCurrency(p.premium)}
                            </Typography>
                          }
                        />
                        <Box ml={1} flexShrink={0}>
                          <PolicyStatusChip status={p.status} />
                        </Box>
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Today's reminders */}
        {todayActivities && todayActivities.length > 0 && (
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                  <Typography variant="h6" fontWeight={700}>Today&apos;s Reminders</Typography>
                  <Chip label={todayActivities.length} color="info" size="small" sx={{ fontWeight: 700 }} />
                </Box>
                <List disablePadding>
                  {todayActivities.map((a, i) => (
                    <React.Fragment key={a.id}>
                      {i > 0 && <Divider />}
                      <ListItem disablePadding sx={{ py: 1 }}>
                        <Box display="flex" alignItems="center" gap={1} flex={1} minWidth={0}>
                          <Chip label={a.activityType} size="small" variant="outlined" sx={{ flexShrink: 0 }} />
                          <Typography variant="body2" noWrap>{a.details || '—'}</Typography>
                        </Box>
                        <Box ml={1} flexShrink={0}>
                          <Chip label={a.status} size="small" color={a.status === 'DONE' ? 'success' : 'warning'} />
                        </Box>
                      </ListItem>
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
