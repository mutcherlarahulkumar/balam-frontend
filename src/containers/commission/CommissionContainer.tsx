import React, { useState } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, Table, TableBody,
  TableCell, TableHead, TableRow, TableContainer, Button, TextField,
  useMediaQuery, useTheme, Divider,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useFormik } from 'formik';
import { useCommissions, useCommissionSummary, useCreateCommission } from '@/hooks/useCommission';
import PageHeader from '@/components/common/PageHeader';
import LoadingState from '@/components/common/LoadingState';
import FormDrawer from '@/components/common/FormDrawer';
import StatCard from '@/components/common/StatCard';
import { commissionSchema, CommissionFormData } from '@/validations/commission.validation';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { useToast } from '@/hooks/useToast';

export default function CommissionContainer() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const toast = useToast();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { data: records, isLoading } = useCommissions({});
  const { data: summary } = useCommissionSummary();
  const createCommission = useCreateCommission();

  const formik = useFormik<CommissionFormData>({
    initialValues: {
      policyNo: 0,
      billDate: '',
      firstComm: undefined,
      secondComm: undefined,
      thirdComm: undefined,
      bonusComm: undefined,
      singleComm: undefined,
      payDate: undefined,
    },
    validationSchema: commissionSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: (values) => {
      createCommission.mutate(values, {
        onSuccess: () => {
          toast.success('Commission record added');
          setDrawerOpen(false);
          formik.resetForm();
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message ?? 'Something went wrong. Please try again.');
        },
      });
    },
  });

  if (isLoading) return <LoadingState />;

  const currentYear = summary?.yearly?.[0];
  const recordList = (records as any[]) ?? [];

  return (
    <>
      <PageHeader
        title="Commission"
        subtitle="Track and manage your LIC commission"
        action={{ label: 'Add Record', onClick: () => setDrawerOpen(true) }}
      />

      <Grid container spacing={2} mb={4}>
        <Grid item xs={6} md={3}>
          <StatCard
            title="This Month"
            value={formatCurrency(summary?.currentMonth?.totalCommission)}
            subtitle={`${summary?.currentMonth?.policiesBilled ?? 0} policies`}
            icon={<TrendingUpIcon sx={{ fontSize: 36 }} />}
            color="secondary.main"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="First Year (YTD)" value={formatCurrency(currentYear?.firstYear)} color="primary.main" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="Renewal (YTD)" value={formatCurrency(currentYear?.renewal)} color="success.main" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="Gross (YTD)" value={formatCurrency(currentYear?.gross)} color="secondary.dark" />
        </Grid>
      </Grid>

      {summary?.yearly && summary.yearly.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ px: { xs: 1.5, sm: 3 } }}>
            <Typography variant="h6" fontWeight={600} mb={2}>Yearly Summary</Typography>
            <Box sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <Table size="small" sx={{ minWidth: 400 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Year</TableCell>
                    <TableCell align="right">First Year</TableCell>
                    <TableCell align="right">Renewal</TableCell>
                    <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Bonus</TableCell>
                    <TableCell align="right">Gross</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {summary.yearly.map((y) => (
                    <TableRow key={y.year}>
                      <TableCell sx={{ fontWeight: 600 }}>{y.year}</TableCell>
                      <TableCell align="right">{formatCurrency(y.firstYear)}</TableCell>
                      <TableCell align="right">{formatCurrency(y.renewal)}</TableCell>
                      <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                        {formatCurrency(y.bonus)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>{formatCurrency(y.gross)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent sx={{ px: { xs: 1.5, sm: 3 } }}>
          <Typography variant="h6" fontWeight={600} mb={2}>Commission Records</Typography>
          {isMobile ? (
            <Grid container spacing={1.5}>
              {recordList.map((r: any) => (
                <Grid item xs={12} key={r.id}>
                  <Card variant="outlined">
                    <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ fontFamily: 'monospace' }}>
                          Policy {r.policyNo}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(r.billDate)}
                        </Typography>
                      </Box>
                      <Divider sx={{ mb: 1 }} />
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">First Year</Typography>
                          <Typography variant="body2" fontWeight={600}>{formatCurrency(r.firstComm)}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Bonus</Typography>
                          <Typography variant="body2" fontWeight={600}>{formatCurrency(r.bonusComm)}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Single</Typography>
                          <Typography variant="body2" fontWeight={600}>{formatCurrency(r.singleComm)}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Pay Date</Typography>
                          <Typography variant="body2">{formatDate(r.payDate) || '—'}</Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <Table size="small">
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
                  {recordList.map((r: any) => (
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
            </Box>
          )}
        </CardContent>
      </Card>

      <FormDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); formik.resetForm(); }}
        title="Add Commission Record"
      >
        <Box component="form" onSubmit={formik.handleSubmit} display="flex" flexDirection="column" gap={2.5}>
          <TextField
            label="Policy Number *"
            type="number"
            fullWidth
            id="policyNo"
            name="policyNo"
            value={formik.values.policyNo || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.policyNo && Boolean(formik.errors.policyNo)}
            helperText={formik.touched.policyNo && formik.errors.policyNo}
          />
          <TextField
            label="Bill Date *"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            id="billDate"
            name="billDate"
            value={formik.values.billDate}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.billDate && Boolean(formik.errors.billDate)}
            helperText={formik.touched.billDate && formik.errors.billDate}
          />
          <TextField
            label="First Year Commission (Rs.)"
            type="number"
            fullWidth
            id="firstComm"
            name="firstComm"
            value={formik.values.firstComm ?? ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <TextField
            label="Second Year Commission (Rs.)"
            type="number"
            fullWidth
            id="secondComm"
            name="secondComm"
            value={formik.values.secondComm ?? ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <TextField
            label="Third Year Commission (Rs.)"
            type="number"
            fullWidth
            id="thirdComm"
            name="thirdComm"
            value={formik.values.thirdComm ?? ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <TextField
            label="Bonus Commission (Rs.)"
            type="number"
            fullWidth
            id="bonusComm"
            name="bonusComm"
            value={formik.values.bonusComm ?? ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <TextField
            label="Single Premium Commission (Rs.)"
            type="number"
            fullWidth
            id="singleComm"
            name="singleComm"
            value={formik.values.singleComm ?? ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <TextField
            label="Pay Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            id="payDate"
            name="payDate"
            value={formik.values.payDate ?? ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              sx={{ minHeight: 44 }}
              onClick={() => { setDrawerOpen(false); formik.resetForm(); }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              sx={{ minHeight: 44 }}
              disabled={createCommission.isPending}
            >
              {createCommission.isPending ? 'Saving...' : 'Save'}
            </Button>
          </Box>
        </Box>
      </FormDrawer>
    </>
  );
}
