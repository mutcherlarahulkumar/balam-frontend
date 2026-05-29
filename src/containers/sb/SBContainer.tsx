import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Paper, TableContainer,
  Box, Chip, Switch, FormControlLabel, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Typography, Card, CardContent,
  Grid, Divider, useMediaQuery, useTheme,
} from '@mui/material';
import { useFormik } from 'formik';
import { useSBList, useCreateSB, useMarkSBPaid } from '@/hooks/useSB';
import PageHeader from '@/components/common/PageHeader';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import FormDrawer from '@/components/common/FormDrawer';
import SBForm from '@/components/sb/SBForm';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { SBFormData, sbMarkPaidSchema, SBMarkPaidFormData } from '@/validations/sb.validation';
import { SB } from '@/types/sb.types';
import { useToast } from '@/hooks/useToast';

export default function SBContainer() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unpaidOnly, setUnpaidOnly] = useState(false);
  const [markingPaid, setMarkingPaid] = useState<SB | null>(null);
  const toast = useToast();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { data, isLoading, isError, refetch } = useSBList({ unpaidOnly });
  const createSB = useCreateSB();
  const markPaid = useMarkSBPaid();

  const markPaidFormik = useFormik<SBMarkPaidFormData>({
    initialValues: { paidDate: '', chequeNo: '' },
    validationSchema: sbMarkPaidSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: (values) => {
      if (!markingPaid) return;
      markPaid.mutate({ id: markingPaid.id, data: values }, {
        onSuccess: () => {
          toast.success('SB marked as received');
          setMarkingPaid(null);
          markPaidFormik.resetForm();
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message ?? 'Something went wrong. Please try again.');
        },
      });
    },
  });

  function handleCreateSubmit(formData: SBFormData) {
    createSB.mutate(formData, {
      onSuccess: () => {
        toast.success('SB record added');
        setDrawerOpen(false);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message ?? 'Something went wrong. Please try again.');
      },
    });
  }

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={refetch} />;

  const records = Array.isArray(data) ? data : [];

  return (
    <>
      <PageHeader
        title="Survival Benefits"
        subtitle="Track money-back and survival benefit payouts"
        action={{ label: 'Add SB', onClick: () => setDrawerOpen(true) }}
      />
      <Box mb={2}>
        <FormControlLabel
          control={<Switch checked={unpaidOnly} onChange={(e) => setUnpaidOnly(e.target.checked)} />}
          label="Show unpaid only"
        />
      </Box>
      {!records.length ? (
        <EmptyState title="No SB records" message="Add survival benefit records." action={{ label: 'Add SB', onClick: () => setDrawerOpen(true) }} />
      ) : isMobile ? (
        <Grid container spacing={1.5}>
          {records.map((sb) => (
            <Grid item xs={12} key={sb.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Box flex={1} minWidth={0}>
                      <Typography variant="subtitle1" fontWeight={700} sx={{ fontFamily: 'monospace' }} noWrap>
                        {sb.policyNo}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Instalment #{sb.instalmentNo}
                      </Typography>
                    </Box>
                    <Chip
                      label={sb.sbPayDate ? 'Received' : 'Pending'}
                      size="small"
                      color={sb.sbPayDate ? 'success' : 'warning'}
                    />
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">SB Due Date</Typography>
                      <Typography variant="body2" fontWeight={600}>{formatDate(sb.sbDueDate)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Amount</Typography>
                      <Typography variant="body2" fontWeight={700} color="primary">{formatCurrency(sb.sbAmount)}</Typography>
                    </Grid>
                    {sb.sbPayDate && (
                      <>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Pay Date</Typography>
                          <Typography variant="body2">{formatDate(sb.sbPayDate)}</Typography>
                        </Grid>
                        {sb.chequeNo && (
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">Cheque No.</Typography>
                            <Typography variant="body2">{sb.chequeNo}</Typography>
                          </Grid>
                        )}
                      </>
                    )}
                  </Grid>
                  {!sb.sbPayDate && (
                    <Box mt={1.5}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => { setMarkingPaid(sb); markPaidFormik.resetForm(); }}
                      >
                        Mark as Received
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Policy No.</TableCell>
                <TableCell>SB Due Date</TableCell>
                <TableCell align="right">SB Amount</TableCell>
                <TableCell>Instalment No.</TableCell>
                <TableCell>Pay Date</TableCell>
                <TableCell>Cheque No.</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((sb) => (
                <TableRow key={sb.id} hover>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{sb.policyNo}</TableCell>
                  <TableCell>{formatDate(sb.sbDueDate)}</TableCell>
                  <TableCell align="right">{formatCurrency(sb.sbAmount)}</TableCell>
                  <TableCell>{sb.instalmentNo}</TableCell>
                  <TableCell>{formatDate(sb.sbPayDate) || '—'}</TableCell>
                  <TableCell>{sb.chequeNo || '—'}</TableCell>
                  <TableCell>
                    <Chip
                      label={sb.sbPayDate ? 'Received' : 'Pending'}
                      size="small"
                      color={sb.sbPayDate ? 'success' : 'warning'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    {!sb.sbPayDate && (
                      <Button size="small" variant="outlined" color="success" onClick={() => { setMarkingPaid(sb); markPaidFormik.resetForm(); }}>
                        Mark Paid
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <FormDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Add Survival Benefit">
        <SBForm onSubmit={handleCreateSubmit} loading={createSB.isPending} onCancel={() => setDrawerOpen(false)} />
      </FormDrawer>

      <Dialog open={!!markingPaid} onClose={() => setMarkingPaid(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Mark SB as Received — Policy {markingPaid?.policyNo}</DialogTitle>
        <DialogContent>
          <Box component="form" id="sb-paid-form" onSubmit={markPaidFormik.handleSubmit} display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField
              label="Paid Date *" type="date" fullWidth InputLabelProps={{ shrink: true }}
              id="paidDate" name="paidDate"
              value={markPaidFormik.values.paidDate}
              onChange={markPaidFormik.handleChange} onBlur={markPaidFormik.handleBlur}
              error={markPaidFormik.touched.paidDate && Boolean(markPaidFormik.errors.paidDate)}
              helperText={markPaidFormik.touched.paidDate && markPaidFormik.errors.paidDate}
            />
            <TextField
              label="Cheque No. (optional)" fullWidth
              id="chequeNo" name="chequeNo"
              value={markPaidFormik.values.chequeNo ?? ''}
              onChange={markPaidFormik.handleChange} onBlur={markPaidFormik.handleBlur}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setMarkingPaid(null)}>Cancel</Button>
          <Button type="submit" form="sb-paid-form" variant="contained" color="success" disabled={markPaid.isPending}>
            {markPaid.isPending ? 'Saving...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
