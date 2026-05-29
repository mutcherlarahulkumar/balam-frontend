import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, TextField, Button, Grid, Select, MenuItem, FormControl, InputLabel, FormHelperText } from '@mui/material';
import { clientSchema, ClientFormData } from '@/validations/client.validation';

interface Props {
  defaultValues?: Partial<ClientFormData>;
  onSubmit: (data: ClientFormData) => void;
  loading?: boolean;
  onCancel?: () => void;
}

export default function ClientForm({ defaultValues, onSubmit, loading, onCancel }: Props) {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<ClientFormData>({
    resolver: yupResolver(clientSchema),
    defaultValues,
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField label="Family Code *" fullWidth {...register('familyCode')} error={!!errors.familyCode} helperText={errors.familyCode?.message} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Person Code *" fullWidth {...register('persCode')} error={!!errors.persCode} helperText={errors.persCode?.message ?? '01=Head, 02=Spouse, 03+=Other'} />
        </Grid>
        <Grid item xs={12}>
          <TextField label="Full Name *" fullWidth {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Date of Birth" type="date" fullWidth InputLabelProps={{ shrink: true }} {...register('dob')} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.sex}>
            <InputLabel>Sex</InputLabel>
            <Select label="Sex" defaultValue={defaultValues?.sex ?? ''} {...register('sex')}>
              <MenuItem value="M">Male</MenuItem>
              <MenuItem value="F">Female</MenuItem>
              <MenuItem value="O">Other</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Mobile" fullWidth {...register('mobile')} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Email" fullWidth {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Occupation" fullWidth {...register('occupation')} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Client Type</InputLabel>
            <Select label="Client Type" defaultValue={defaultValues?.clientType ?? 'C'} {...register('clientType')}>
              <MenuItem value="C">Customer</MenuItem>
              <MenuItem value="P">Prospect</MenuItem>
              <MenuItem value="N">New</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField label="Address" fullWidth multiline rows={2} {...register('address')} />
        </Grid>
      </Grid>
      <Box display="flex" gap={2} mt={3}>
        {onCancel && <Button variant="outlined" onClick={onCancel} fullWidth>Cancel</Button>}
        <Button type="submit" variant="contained" fullWidth disabled={loading}>
          {loading ? 'Saving...' : 'Save Client'}
        </Button>
      </Box>
    </Box>
  );
}
