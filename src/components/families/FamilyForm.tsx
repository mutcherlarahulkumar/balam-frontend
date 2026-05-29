import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, TextField, Button, Grid } from '@mui/material';
import { familySchema, FamilyFormData } from '@/validations/family.validation';

interface Props {
  defaultValues?: Partial<FamilyFormData>;
  onSubmit: (data: FamilyFormData) => void;
  loading?: boolean;
  onCancel?: () => void;
}

export default function FamilyForm({ defaultValues, onSubmit, loading, onCancel }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<FamilyFormData>({
    resolver: yupResolver(familySchema),
    defaultValues,
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField label="Family Code" fullWidth {...register('familyCode')} error={!!errors.familyCode} helperText={errors.familyCode?.message ?? 'Auto-generated if blank'} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Head Name *" fullWidth {...register('headName')} error={!!errors.headName} helperText={errors.headName?.message} />
        </Grid>
        <Grid item xs={12}>
          <TextField label="Address" fullWidth multiline rows={2} {...register('address')} error={!!errors.address} helperText={errors.address?.message} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Mobile" fullWidth {...register('mobile')} error={!!errors.mobile} helperText={errors.mobile?.message} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Email" fullWidth {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField label="Pincode" fullWidth {...register('pincode')} error={!!errors.pincode} helperText={errors.pincode?.message} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField label="Religion" fullWidth {...register('religion')} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField label="Designation" fullWidth {...register('designation')} />
        </Grid>
      </Grid>
      <Box display="flex" gap={2} mt={3}>
        {onCancel && <Button variant="outlined" onClick={onCancel} fullWidth>Cancel</Button>}
        <Button type="submit" variant="contained" fullWidth disabled={loading}>
          {loading ? 'Saving...' : 'Save Family'}
        </Button>
      </Box>
    </Box>
  );
}
