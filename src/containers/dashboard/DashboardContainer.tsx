import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Chip, Table, TableBody, TableCell, TableHead, TableRow, Paper, Alert } from '@mui/material';
import PolicyIcon from '@mui/icons-material/Policy';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
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
  const { data: policies, isLoading: loadingPolicies } = usePolicies({ limit: 5 });
  const { data: families } = useFamilies({});
  const { data: commissionSummary } = useCommissionSummary();
  const { data: duePolicies } = useFUPDue({});
  const { data: todayActivities } = useTodayActivities();

  if (loadingPolicies) return <LoadingState />;

  const inForcePolicies = policies?.data?.filter((p) => p.status === 'IF').length ?? 0;
  const lapsedCount = policies?.data?.filter((p) => p.status === 'LA').length ?? 0;

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700} color="primary.main">
          Welcome back, {agent?.name?.split(' ')[0]}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {agent?.agentCode} · {agent?.branch}
        </Typography>
      </Box>

      {lapsedCount > 0 && (
        <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 3 }}>
          {lapsedCount} {lapsedCount === 1 ? 'policy has' : 'policies have'} lapsed. Review FUP tracking.
        </Alert>
      )}

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Families"
            value={families?.total ?? 0}
            icon={<PeopleIcon sx={{ fontSize: 40 }} />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Policies"
            value={policies?.total ?? 0}
            icon={<PolicyIcon sx={{ fontSize: 40 }} />}
            color="secondary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="In Force"
            value={inForcePolicies}
            subtitle={`of ${policies?.data?.length ?? 0} shown`}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Commission (This Month)"
            value={formatCurrency(commissionSummary?.currentMonth?.totalCommission)}
            subtitle={`${commissionSummary?.currentMonth?.policiesBilled ?? 0} policies billed`}
            icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
            color="secondary.dark"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Recent Policies</Typography>
              {policies?.data && policies.data.length > 0 ? (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Policy No.</TableCell>
                      <TableCell>Client</TableCell>
                      <TableCell>Plan</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Premium</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {policies.data.slice(0, 5).map((p) => (
                      <TableRow key={p.id} hover>
                        <TableCell sx={{ fontFamily: 'monospace' }}>{p.policyNo}</TableCell>
                        <TableCell>{p.clientName}</TableCell>
                        <TableCell>{p.planName}</TableCell>
                        <TableCell><PolicyStatusChip status={p.status} /></TableCell>
                        <TableCell align="right">{formatCurrency(p.premium)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography variant="body2" color="text.secondary">No policies found.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Due This Month
                {duePolicies?.data && <Chip label={duePolicies.data.length} size="small" color="warning" sx={{ ml: 1 }} />}
              </Typography>
              {duePolicies?.data?.slice(0, 4).map((d) => (
                <Box key={d.policyNo} display="flex" justifyContent="space-between" py={0.75} borderBottom="1px solid" borderColor="divider">
                  <Box>
                    <Typography variant="body2" fontWeight={600}>{d.clientName}</Typography>
                    <Typography variant="caption" color="text.secondary">{d.planName}</Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="body2">{formatCurrency(d.premium)}</Typography>
                    <Typography variant="caption" color={d.daysOverdue > 0 ? 'error.main' : 'text.secondary'}>
                      {d.daysOverdue > 0 ? `${d.daysOverdue}d overdue` : 'Due'}
                    </Typography>
                  </Box>
                </Box>
              ))}
              {!duePolicies?.data?.length && (
                <Typography variant="body2" color="text.secondary">No policies due.</Typography>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Today&apos;s Activities</Typography>
              {todayActivities?.slice(0, 3).map((a) => (
                <Box key={a.id} display="flex" justifyContent="space-between" py={0.75} borderBottom="1px solid" borderColor="divider">
                  <Box>
                    <Chip label={a.activityType} size="small" variant="outlined" sx={{ mr: 1 }} />
                    <Typography variant="caption" color="text.secondary">{a.details?.slice(0, 40)}</Typography>
                  </Box>
                  <Chip
                    label={a.status}
                    size="small"
                    color={a.status === 'DONE' ? 'success' : a.status === 'CANCELLED' ? 'default' : 'warning'}
                  />
                </Box>
              ))}
              {!todayActivities?.length && (
                <Typography variant="body2" color="text.secondary">No activities today.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
