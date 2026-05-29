import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, TextField, Button, Grid } from '@mui/material';
import { loanSchema, LoanFormData } from '@/validations/loan.validation';

interface Props {
  onSubmit: (data: LoanFormData) => void;
  loading?: boolean;
  onCancel?: () => void;
}

export default function LoanForm({ onSubmit, loading, onCancel }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<LoanFormData>({
    resolver: yupResolver(loanSchema),
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField label="Policy Number *" type="number" fullWidth {...register('policyNo')} error={!!errors.policyNo} helperText={errors.policyNo?.message} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Loan Date *" type="date" fullWidth InputLabelProps={{ shrink: true }} {...register('loanDate')} error={!!errors.loanDate} helperText={errors.loanDate?.message} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Interest Due Date *" type="date" fullWidth InputLabelProps={{ shrink: true }} {...register('interestDueDate')} error={!!errors.interestDueDate} helperText={errors.interestDueDate?.message} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Loan Amount (₹) *" type="number" fullWidth {...register('loanAmount')} error={!!errors.loanAmount} helperText={errors.loanAmount?.message} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Loan Interest (₹)" type="number" fullWidth {...register('loanInterest')} />
        </Grid>
      </Grid>
      <Box display="flex" gap={2} mt={3}>
        {onCancel && <Button variant="outlined" onClick={onCancel} fullWidth>Cancel</Button>}
        <Button type="submit" variant="contained" fullWidth disabled={loading}>
          {loading ? 'Saving...' : 'Save Loan'}
        </Button>
      </Box>
    </Box>
  );
}
