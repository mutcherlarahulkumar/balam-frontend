import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Paper,
  TableContainer, Box, Chip, Typography, TextField, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { useFormik } from 'formik';
import { useFUPDue, useUpdateFUP } from '@/hooks/useFUP';
import { useToast } from '@/hooks/useToast';
import PageHeader from '@/components/common/PageHeader';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import { formatDate } from '@/utils/date';
import { formatCurrency } from '@/utils/currency';
import { FUPDueItem } from '@/types/fup.types';
import { fupUpdateSchema, FUPUpdateFormData } from '@/validations/fup.validation';

export default function FUPContainer() {
  const [selected, setSelected] = useState<FUPDueItem | null>(null);
  const toast = useToast();
  const { data, isLoading, isError, refetch } = useFUPDue({});
  const updateFUP = useUpdateFUP();

  const formik = useFormik<FUPUpdateFormData>({
    initialValues: { policyNo: 0, oldFup: '', newFup: '', reason: '' },
    validationSchema: fupUpdateSchema,
    validateOnBlur: true,
    validateOnChange: false,
    enableReinitialize: true,
    onSubmit: (values) => {
      updateFUP.mutate(values, {
        onSuccess: () => {
          toast.success(`FUP updated for policy ${values.policyNo}`);
          setSelected(null);
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message ?? 'Failed to update FUP');
        },
      });
    },
  });

  function openUpdate(item: FUPDueItem) {
    setSelected(item);
    formik.resetForm({
      values: {
        policyNo: item.policyNo,
        oldFup: item.nextPremium ? item.nextPremium.split('T')[0] : '',
        newFup: '',
        reason: '',
      },
    });
  }

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={refetch} />;

  const items = data?.data ?? [];

  return (
    <>
      <PageHeader
        title="FUP Tracking"
        subtitle="First Unpaid Premium — monitor and update premium due dates"
      />

      {!items.length ? (
        <EmptyState title="No due policies" message="All policies are up to date." />
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Policy No.</TableCell>
                <TableCell>Client</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Mobile</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Plan</TableCell>
                <TableCell align="right">Premium</TableCell>
                <TableCell>Next Due</TableCell>
                <TableCell>Overdue</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Days to Lapse</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.policyNo} hover>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    {item.policyNo}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: { xs: 80, sm: 150 } }}>
                      {item.clientName}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{item.mobile}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 120 }}>{item.planName}</Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(item.premium)}</TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{formatDate(item.nextPremium)}</TableCell>
                  <TableCell>
                    <Chip
                      label={item.daysOverdue > 0 ? `${item.daysOverdue}d` : 'Due'}
                      size="small"
                      color={item.daysOverdue > 60 ? 'error' : item.daysOverdue > 0 ? 'warning' : 'default'}
                    />
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    <Typography
                      variant="body2"
                      color={item.daysUntilLapse < 30 ? 'error.main' : item.daysUntilLapse < 90 ? 'warning.main' : 'text.primary'}
                      fontWeight={item.daysUntilLapse < 30 ? 700 : 400}
                    >
                      {item.daysUntilLapse}d
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Button size="small" variant="outlined" onClick={() => openUpdate(item)} sx={{ whiteSpace: 'nowrap', fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                      Update
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Update FUP — Policy {selected?.policyNo}
        </DialogTitle>
        <DialogContent>
          <Box component="form" id="fup-form" onSubmit={formik.handleSubmit} noValidate display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField
              id="oldFup" name="oldFup" label="Current FUP (Old)" type="date"
              fullWidth size="medium" InputLabelProps={{ shrink: true }}
              value={formik.values.oldFup}
              onChange={formik.handleChange} onBlur={formik.handleBlur}
              error={formik.touched.oldFup && Boolean(formik.errors.oldFup)}
              helperText={formik.touched.oldFup && formik.errors.oldFup}
            />
            <TextField
              id="newFup" name="newFup" label="New FUP Date" type="date"
              fullWidth size="medium" InputLabelProps={{ shrink: true }}
              value={formik.values.newFup}
              onChange={formik.handleChange} onBlur={formik.handleBlur}
              error={formik.touched.newFup && Boolean(formik.errors.newFup)}
              helperText={formik.touched.newFup && formik.errors.newFup}
            />
            <TextField
              id="reason" name="reason" label="Reason (optional)"
              fullWidth size="medium" multiline rows={2}
              value={formik.values.reason}
              onChange={formik.handleChange} onBlur={formik.handleBlur}
              error={formik.touched.reason && Boolean(formik.errors.reason)}
              helperText={formik.touched.reason && formik.errors.reason}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setSelected(null)} size="large">Cancel</Button>
          <Button type="submit" form="fup-form" variant="contained" size="large" disabled={updateFUP.isPending}>
            {updateFUP.isPending ? 'Updating...' : 'Update FUP'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
