import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, TextField, Button, Grid } from '@mui/material';
import { sbSchema, SBFormData } from '@/validations/sb.validation';

interface Props {
  onSubmit: (data: SBFormData) => void;
  loading?: boolean;
  onCancel?: () => void;
}

export default function SBForm({ onSubmit, loading, onCancel }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<SBFormData>({
    resolver: yupResolver(sbSchema),
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField label="Policy Number *" type="number" fullWidth {...register('policyNo')} error={!!errors.policyNo} helperText={errors.policyNo?.message} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="SB Due Date *" type="date" fullWidth InputLabelProps={{ shrink: true }} {...register('sbDueDate')} error={!!errors.sbDueDate} helperText={errors.sbDueDate?.message} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Instalment No. *" type="number" fullWidth {...register('instalmentNo')} error={!!errors.instalmentNo} helperText={errors.instalmentNo?.message} />
        </Grid>
        <Grid item xs={12}>
          <TextField label="SB Amount (₹) *" type="number" fullWidth {...register('sbAmount')} error={!!errors.sbAmount} helperText={errors.sbAmount?.message} />
        </Grid>
      </Grid>
      <Box display="flex" gap={2} mt={3}>
        {onCancel && <Button variant="outlined" onClick={onCancel} fullWidth>Cancel</Button>}
        <Button type="submit" variant="contained" fullWidth disabled={loading}>
          {loading ? 'Saving...' : 'Save SB'}
        </Button>
      </Box>
    </Box>
  );
}
