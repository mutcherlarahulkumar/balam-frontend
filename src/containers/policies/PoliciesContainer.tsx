import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Paper, TableContainer,
  Box, Select, MenuItem, FormControl, InputLabel, Tooltip, Typography,
  Card, CardContent, CardActionArea, Grid, Chip, Divider,
  useMediaQuery, useTheme,
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useRouter } from 'next/router';
import { usePolicies, useCreatePolicy } from '@/hooks/usePolicies';
import PageHeader from '@/components/common/PageHeader';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import SearchBar from '@/components/common/SearchBar';
import FormDrawer from '@/components/common/FormDrawer';
import PolicyForm from '@/components/policies/PolicyForm';
import { PolicyStatusChip, FUPStatusChip } from '@/components/common/StatusChip';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { PolicyStatus } from '@/types/common.types';
import { PolicyFormData } from '@/validations/policy.validation';
import { useToast } from '@/hooks/useToast';

const MODE_LABELS: Record<string, string> = {
  Y: 'Yearly', H: 'Half-Yearly', Q: 'Quarterly', M: 'Monthly', S: 'Single',
};

export default function PoliciesContainer() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PolicyStatus | ''>('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const toast = useToast();

  const { data, isLoading, isError, refetch } = usePolicies({
    status: statusFilter || undefined,
    limit: 25,
  });
  const createPolicy = useCreatePolicy();

  function handleSubmit(formData: PolicyFormData) {
    createPolicy.mutate(formData, {
      onSuccess: () => { toast.success('Policy added successfully'); setDrawerOpen(false); },
      onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Failed to save policy'),
    });
  }

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <>
      <PageHeader
        title="Policies"
        subtitle={`${data?.total ?? 0} policies in portfolio`}
        action={{ label: 'Add Policy', onClick: () => setDrawerOpen(true) }}
      />
      <Box display="flex" gap={1.5} mb={2} flexWrap="wrap" alignItems="center">
        <SearchBar value={search} onChange={setSearch} placeholder="Search policy..." />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value as PolicyStatus | '')}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="IF">In Force</MenuItem>
            <MenuItem value="LA">Lapsed</MenuItem>
            <MenuItem value="PU">Paid Up</MenuItem>
            <MenuItem value="SU">Surrendered</MenuItem>
            <MenuItem value="MA">Matured</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {!data?.data?.length ? (
        <EmptyState
          title="No policies"
          message="Add your first policy to get started."
          action={{ label: 'Add Policy', onClick: () => setDrawerOpen(true) }}
        />
      ) : isMobile ? (
        /* Mobile: card list */
        <Grid container spacing={1.5}>
          {data.data.map((p) => (
            <Grid item xs={12} key={p.id}>
              <Card>
                <CardActionArea onClick={() => router.push(`/policies/${p.policyNo}`)}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Box flex={1} minWidth={0}>
                        <Typography variant="subtitle1" fontWeight={700} noWrap>{p.clientName}</Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>{p.planName}</Typography>
                      </Box>
                      <Box display="flex" gap={0.5} ml={1} flexShrink={0}>
                        <PolicyStatusChip status={p.status} />
                      </Box>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Policy No.</Typography>
                        <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'monospace' }}>
                          {p.policyNo}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Premium</Typography>
                        <Typography variant="body2" fontWeight={700} color="primary.main">
                          {formatCurrency(p.premium)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Sum Assured</Typography>
                        <Typography variant="body2" fontWeight={600}>{formatCurrency(p.sumAssured)}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Next Due</Typography>
                        <Typography variant="body2">{formatDate(p.nextPremium)}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Mode</Typography>
                        <Typography variant="body2">{MODE_LABELS[p.paymentMode] ?? p.paymentMode}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">FUP Status</Typography>
                        <Box mt={0.5}><FUPStatusChip status={p.fupStatus} /></Box>
                      </Grid>
                    </Grid>
                    {p.daysUntilLapse < 90 && (
                      <Box mt={1.5}>
                        <Chip
                          label={`⚠ Lapses in ${p.daysUntilLapse} days`}
                          size="small"
                          color={p.daysUntilLapse < 30 ? 'error' : 'warning'}
                          sx={{ width: '100%' }}
                        />
                      </Box>
                    )}
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        /* Desktop: table */
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Policy No.</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell>Mode</TableCell>
                <TableCell align="right">Sum Assured</TableCell>
                <TableCell align="right">Premium</TableCell>
                <TableCell>Next Due</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>FUP</TableCell>
                <TableCell>Lapse In</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {data.data.map((p) => (
                <TableRow
                  key={p.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => router.push(`/policies/${p.policyNo}`)}
                >
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>{p.policyNo}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{p.clientName}</TableCell>
                  <TableCell>
                    <Tooltip title={p.planName}>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 140 }}>{p.planName}</Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{MODE_LABELS[p.paymentMode] ?? p.paymentMode}</TableCell>
                  <TableCell align="right">{formatCurrency(p.sumAssured)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {formatCurrency(p.premium)}
                  </TableCell>
                  <TableCell>{formatDate(p.nextPremium)}</TableCell>
                  <TableCell><PolicyStatusChip status={p.status} /></TableCell>
                  <TableCell><FUPStatusChip status={p.fupStatus} /></TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight={p.daysUntilLapse < 30 ? 700 : 400}
                      color={p.daysUntilLapse < 30 ? 'error.main' : p.daysUntilLapse < 90 ? 'warning.main' : 'text.secondary'}
                    >
                      {p.daysUntilLapse}d
                    </Typography>
                  </TableCell>
                  <TableCell><ChevronRightIcon color="action" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <FormDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Add Policy" width={600}>
        <PolicyForm
          onSubmit={handleSubmit}
          loading={createPolicy.isPending}
          onCancel={() => setDrawerOpen(false)}
        />
      </FormDrawer>
    </>
  );
}
