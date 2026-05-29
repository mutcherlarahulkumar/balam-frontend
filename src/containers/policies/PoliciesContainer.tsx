import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow,
  Paper, TableContainer, IconButton, Box, Select,
  MenuItem, FormControl, InputLabel, Tooltip, Typography,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
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

export default function PoliciesContainer() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PolicyStatus | ''>('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data, isLoading, isError, refetch } = usePolicies({
    status: statusFilter || undefined,
    limit: 25,
  });
  const createPolicy = useCreatePolicy();

  function handleSubmit(formData: PolicyFormData) {
    createPolicy.mutate(formData, { onSuccess: () => setDrawerOpen(false) });
  }

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <>
      <PageHeader
        title="Policies"
        subtitle={`${data?.total ?? 0} policies`}
        action={{ label: 'Add Policy', onClick: () => setDrawerOpen(true) }}
      />
      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by policy no..." />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value as PolicyStatus | '')}>
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
        <EmptyState title="No policies" message="Add your first policy." action={{ label: 'Add Policy', onClick: () => setDrawerOpen(true) }} />
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Policy No.</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell>Mode</TableCell>
                <TableCell align="right">S.A.</TableCell>
                <TableCell align="right">Premium</TableCell>
                <TableCell>Next Due</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>FUP</TableCell>
                <TableCell>Lapse In</TableCell>
                <TableCell align="center">View</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.data.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.policyNo}</TableCell>
                  <TableCell>{p.clientName}</TableCell>
                  <TableCell>
                    <Tooltip title={p.planName}>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 120 }}>{p.planName}</Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{p.paymentMode}</TableCell>
                  <TableCell align="right">{formatCurrency(p.sumAssured)}</TableCell>
                  <TableCell align="right">{formatCurrency(p.premium)}</TableCell>
                  <TableCell>{formatDate(p.nextPremium)}</TableCell>
                  <TableCell><PolicyStatusChip status={p.status} /></TableCell>
                  <TableCell><FUPStatusChip status={p.fupStatus} /></TableCell>
                  <TableCell>
                    <Typography
                      variant="caption"
                      color={p.daysUntilLapse < 30 ? 'error.main' : p.daysUntilLapse < 90 ? 'warning.main' : 'text.secondary'}
                      fontWeight={p.daysUntilLapse < 30 ? 700 : 400}
                    >
                      {p.daysUntilLapse}d
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => router.push(`/policies/${p.policyNo}`)}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <FormDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Add Policy" width={600}>
        <PolicyForm onSubmit={handleSubmit} loading={createPolicy.isPending} onCancel={() => setDrawerOpen(false)} />
      </FormDrawer>
    </>
  );
}
