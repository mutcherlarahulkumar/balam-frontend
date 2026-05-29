import React, { useState } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, Table, TableBody,
  TableCell, TableHead, TableRow, Paper, TableContainer, Button,
  TextField,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useCommissions, useCommissionSummary, useCreateCommission } from '@/hooks/useCommission';
import PageHeader from '@/components/common/PageHeader';
import LoadingState from '@/components/common/LoadingState';
import FormDrawer from '@/components/common/FormDrawer';
import StatCard from '@/components/common/StatCard';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { commissionSchema, CommissionFormData } from '@/validations/commission.validation';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';

export default function CommissionContainer() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: records, isLoading } = useCommissions({});
  const { data: summary } = useCommissionSummary();
  const createCommission = useCreateCommission();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CommissionFormData>({
    resolver: yupResolver(commissionSchema),
  });

  function onSubmit(data: CommissionFormData) {
    createCommission.mutate(data, { onSuccess: () => { setDrawerOpen(false); reset(); } });
  }

  if (isLoading) return <LoadingState />;

  const currentYear = summary?.yearly?.[0];

  return (
    <>
      <PageHeader
        title="Commission"
        subtitle="Track and manage your LIC commission"
        action={{ label: 'Add Record', onClick: () => setDrawerOpen(true) }}
      />

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="This Month"
            value={formatCurrency(summary?.currentMonth?.totalCommission)}
            subtitle={`${summary?.currentMonth?.policiesBilled ?? 0} policies`}
            icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
            color="secondary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="First Year (YTD)" value={formatCurrency(currentYear?.firstYear)} color="primary.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Renewal (YTD)" value={formatCurrency(currentYear?.renewal)} color="success.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Gross (YTD)" value={formatCurrency(currentYear?.gross)} color="secondary.dark" />
        </Grid>
      </Grid>

      {summary?.yearly && summary.yearly.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={2}>Yearly Summary</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Year</TableCell>
                    <TableCell align="right">First Year</TableCell>
                    <TableCell align="right">Renewal</TableCell>
                    <TableCell align="right">Bonus</TableCell>
                    <TableCell align="right">Gross</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {summary.yearly.map((y) => (
                    <TableRow key={y.year}>
                      <TableCell sx={{ fontWeight: 600 }}>{y.year}</TableCell>
                      <TableCell align="right">{formatCurrency(y.firstYear)}</TableCell>
                      <TableCell align="right">{formatCurrency(y.renewal)}</TableCell>
                      <TableCell align="right">{formatCurrency(y.bonus)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>{formatCurrency(y.gross)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>Commission Records</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Policy No.</TableCell>
                  <TableCell>Bill Date</TableCell>
                  <TableCell align="right">First Year</TableCell>
                  <TableCell align="right">Bonus</TableCell>
                  <TableCell align="right">Single</TableCell>
                  <TableCell>Pay Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(records as any[])?.map?.((r: any) => (
                  <TableRow key={r.id} hover>
                    <TableCell sx={{ fontFamily: 'monospace' }}>{r.policyNo}</TableCell>
                    <TableCell>{formatDate(r.billDate)}</TableCell>
                    <TableCell align="right">{formatCurrency(r.firstComm)}</TableCell>
                    <TableCell align="right">{formatCurrency(r.bonusComm)}</TableCell>
                    <TableCell align="right">{formatCurrency(r.singleComm)}</TableCell>
                    <TableCell>{formatDate(r.payDate)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <FormDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Add Commission Record">
        <Box component="form" onSubmit={handleSubmit(onSubmit)} display="flex" flexDirection="column" gap={2.5}>
          <TextField label="Policy Number *" type="number" fullWidth {...register('policyNo')} error={!!errors.policyNo} helperText={errors.policyNo?.message} />
          <TextField label="Bill Date *" type="date" fullWidth InputLabelProps={{ shrink: true }} {...register('billDate')} error={!!errors.billDate} helperText={errors.billDate?.message} />
          <TextField label="First Year Commission (₹)" type="number" fullWidth {...register('firstComm')} />
          <TextField label="Second Year Commission (₹)" type="number" fullWidth {...register('secondComm')} />
          <TextField label="Third Year Commission (₹)" type="number" fullWidth {...register('thirdComm')} />
          <TextField label="Bonus Commission (₹)" type="number" fullWidth {...register('bonusComm')} />
          <TextField label="Single Premium Commission (₹)" type="number" fullWidth {...register('singleComm')} />
          <TextField label="Pay Date" type="date" fullWidth InputLabelProps={{ shrink: true }} {...register('payDate')} />
          <Box display="flex" gap={2}>
            <Button variant="outlined" fullWidth onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" fullWidth disabled={createCommission.isPending}>
              {createCommission.isPending ? 'Saving...' : 'Save'}
            </Button>
          </Box>
        </Box>
      </FormDrawer>
    </>
  );
}
