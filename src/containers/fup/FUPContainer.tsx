import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Paper, TableContainer,
  Box, Chip, Typography, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Card, CardContent, Grid, Divider, useMediaQuery, useTheme,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useFUPDue, useUpdateFUP } from '@/hooks/useFUP';
import PageHeader from '@/components/common/PageHeader';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import { formatDate } from '@/utils/date';
import { formatCurrency } from '@/utils/currency';
import { FUPDueItem } from '@/types/fup.types';
import { fupUpdateSchema, FUPUpdateFormData } from '@/validations/fup.validation';

export default function FUPContainer() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
        subtitle="First Unpaid Premium — keep policies from lapsing"
      />

      {!items.length ? (
        <EmptyState title="All policies paid" message="No overdue or due premiums found." />
      ) : isMobile ? (
        /* Mobile: card-based layout */
        <Grid container spacing={2}>
          {items.map((item) => (
            <Grid item xs={12} key={item.policyNo}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>{item.clientName}</Typography>
                      <Typography variant="body2" color="text.secondary">{item.planName}</Typography>
                    </Box>
                    <Chip
                      label={item.daysOverdue > 0 ? `${item.daysOverdue}d overdue` : 'Due'}
                      size="small"
                      color={item.daysOverdue > 60 ? 'error' : item.daysOverdue > 0 ? 'warning' : 'default'}
                    />
                  </Box>
                  <Divider sx={{ mb: 1.5 }} />
                  <Grid container spacing={1.5}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" display="block">Premium</Typography>
                      <Typography variant="body1" fontWeight={700} color="primary.main">{formatCurrency(item.premium)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" display="block">Next Due</Typography>
                      <Typography variant="body1" fontWeight={600}>{formatDate(item.nextPremium)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" display="block">Lapse Date</Typography>
                      <Typography variant="body1">{formatDate(item.lapseDate)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" display="block">Days to Lapse</Typography>
                      <Typography
                        variant="body1"
                        fontWeight={700}
                        color={item.daysUntilLapse < 30 ? 'error.main' : item.daysUntilLapse < 90 ? 'warning.main' : 'text.primary'}
                      >
                        {item.daysUntilLapse} days
                      </Typography>
                    </Grid>
                  </Grid>
                  <Box display="flex" alignItems="center" gap={1} mt={1.5}>
                    <Typography variant="body2" color="text.secondary">📞 {item.mobile}</Typography>
                  </Box>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<EditIcon />}
                    onClick={() => openUpdate(item)}
                    sx={{ mt: 2 }}
                  >
                    Update FUP Date
                  </Button>
                </CardContent>
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
                <TableCell>Mobile</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell align="right">Premium</TableCell>
                <TableCell>Next Due</TableCell>
                <TableCell>Overdue</TableCell>
                <TableCell>Lapse Date</TableCell>
                <TableCell>Days Left</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.policyNo} hover>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{item.policyNo}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{item.clientName}</TableCell>
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
                    <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={() => openUpdate(item)}>
                      Update
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="xs" fullWidth fullScreen={isMobile}>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          Update FUP — Policy {selected?.policyNo}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selected && (
            <Box mb={2} p={2} bgcolor="warning.light" borderRadius={2}>
              <Typography variant="body1" fontWeight={600}>{selected.clientName}</Typography>
              <Typography variant="body2">Premium: {formatCurrency(selected.premium)}</Typography>
              <Typography variant="body2">Lapse Date: {formatDate(selected.lapseDate)}</Typography>
            </Box>
          )}
          <Box component="form" id="fup-form" onSubmit={handleSubmit(onSubmit)} display="flex" flexDirection="column" gap={2.5} pt={1}>
            <input type="hidden" {...register('policyNo')} />
            <TextField
              label="Current FUP Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              {...register('oldFup')}
              error={!!errors.oldFup}
              helperText={errors.oldFup?.message}
            />
            <TextField
              label="New FUP Date (after payment)"
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
              placeholder="e.g. Premium received on 15 Jan"
              {...register('reason')}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setSelected(null)} size="large" fullWidth variant="outlined">Cancel</Button>
          <Button type="submit" form="fup-form" variant="contained" size="large" fullWidth disabled={updateFUP.isPending}>
            {updateFUP.isPending ? 'Updating...' : 'Update FUP'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
