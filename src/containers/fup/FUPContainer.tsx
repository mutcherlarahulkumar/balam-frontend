import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Paper,
  TableContainer, Box, Chip, Typography, TextField, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useFUPDue, useUpdateFUP } from '@/hooks/useFUP';
import PageHeader from '@/components/common/PageHeader';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import { formatDate, formatCurrency as _fc } from '@/utils/date';
import { formatCurrency } from '@/utils/currency';
import { FUPDueItem } from '@/types/fup.types';
import { fupUpdateSchema, FUPUpdateFormData } from '@/validations/fup.validation';

export default function FUPContainer() {
  const [selected, setSelected] = useState<FUPDueItem | null>(null);
  const { data, isLoading, isError, refetch } = useFUPDue({});
  const updateFUP = useUpdateFUP();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FUPUpdateFormData>({
    resolver: yupResolver(fupUpdateSchema),
  });

  function openUpdate(item: FUPDueItem) {
    setSelected(item);
    reset({
      policyNo: item.policyNo,
      oldFup: item.nextPremium ? item.nextPremium.split('T')[0] : '',
      newFup: '',
    });
  }

  function onSubmit(data: FUPUpdateFormData) {
    updateFUP.mutate(data, { onSuccess: () => setSelected(null) });
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
                <TableCell>Mobile</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell align="right">Premium</TableCell>
                <TableCell>Next Due</TableCell>
                <TableCell>Overdue</TableCell>
                <TableCell>Lapse Date</TableCell>
                <TableCell>Days to Lapse</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.policyNo} hover>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{item.policyNo}</TableCell>
                  <TableCell>{item.clientName}</TableCell>
                  <TableCell>{item.mobile}</TableCell>
                  <TableCell>{item.planName}</TableCell>
                  <TableCell align="right">{formatCurrency(item.premium)}</TableCell>
                  <TableCell>{formatDate(item.nextPremium)}</TableCell>
                  <TableCell>
                    <Chip
                      label={item.daysOverdue > 0 ? `${item.daysOverdue}d` : 'Due'}
                      size="small"
                      color={item.daysOverdue > 60 ? 'error' : item.daysOverdue > 0 ? 'warning' : 'default'}
                    />
                  </TableCell>
                  <TableCell>{formatDate(item.lapseDate)}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color={item.daysUntilLapse < 30 ? 'error.main' : item.daysUntilLapse < 90 ? 'warning.main' : 'text.primary'}
                      fontWeight={item.daysUntilLapse < 30 ? 700 : 400}
                    >
                      {item.daysUntilLapse}d
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Button size="small" variant="outlined" onClick={() => openUpdate(item)}>
                      Update FUP
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Update FUP — Policy {selected?.policyNo}</DialogTitle>
        <DialogContent>
          <Box component="form" id="fup-form" onSubmit={handleSubmit(onSubmit)} display="flex" flexDirection="column" gap={2} pt={1}>
            <input type="hidden" {...register('policyNo')} />
            <TextField
              label="Current FUP (Old)"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              {...register('oldFup')}
              error={!!errors.oldFup}
              helperText={errors.oldFup?.message}
            />
            <TextField
              label="New FUP Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              {...register('newFup')}
              error={!!errors.newFup}
              helperText={errors.newFup?.message}
            />
            <TextField
              label="Reason (optional)"
              fullWidth
              multiline
              rows={2}
              {...register('reason')}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setSelected(null)}>Cancel</Button>
          <Button type="submit" form="fup-form" variant="contained" disabled={updateFUP.isPending}>
            {updateFUP.isPending ? 'Updating...' : 'Update FUP'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
