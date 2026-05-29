import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, TextField, Button, Grid } from '@mui/material';
import { leadSchema, LeadFormData } from '@/validations/lead.validation';

interface Props {
  onSubmit: (data: LeadFormData) => void;
  loading?: boolean;
  onCancel?: () => void;
}

export default function LeadForm({ onSubmit, loading, onCancel }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<LeadFormData>({
    resolver: yupResolver(leadSchema),
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField label="Name *" fullWidth {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
        </Grid>
        <Grid item xs={12}>
          <TextField label="Mobile *" fullWidth {...register('mobile')} error={!!errors.mobile} helperText={errors.mobile?.message} />
        </Grid>
        <Grid item xs={12}>
          <TextField label="Address" fullWidth multiline rows={2} {...register('address')} />
        </Grid>
        <Grid item xs={12}>
          <TextField label="Interest / Search Term" fullWidth {...register('searchTerm')} helperText="E.g. term insurance, child plan" />
        </Grid>
      </Grid>
      <Box display="flex" gap={2} mt={3}>
        {onCancel && <Button variant="outlined" onClick={onCancel} fullWidth>Cancel</Button>}
        <Button type="submit" variant="contained" fullWidth disabled={loading}>
          {loading ? 'Saving...' : 'Save Lead'}
        </Button>
      </Box>
    </Box>
  );
}
