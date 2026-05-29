import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box, TextField, Button, Grid, Select, MenuItem,
  FormControl, InputLabel, FormHelperText, Typography,
} from '@mui/material';
import { policySchema, PolicyFormData } from '@/validations/policy.validation';
import { usePlans } from '@/hooks/usePlans';

interface Props {
  defaultValues?: Partial<PolicyFormData>;
  onSubmit: (data: PolicyFormData) => void;
  loading?: boolean;
  onCancel?: () => void;
}

export default function PolicyForm({ defaultValues, onSubmit, loading, onCancel }: Props) {
  const { data: plansData } = usePlans({});
  const { register, handleSubmit, formState: { errors } } = useForm<PolicyFormData>({
    resolver: yupResolver(policySchema),
    defaultValues,
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="subtitle2" color="text.secondary" mb={2}>Policy Details</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField label="Policy Number *" type="number" fullWidth {...register('policyNo')} error={!!errors.policyNo} helperText={errors.policyNo?.message} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Family Code *" fullWidth {...register('familyCode')} error={!!errors.familyCode} helperText={errors.familyCode?.message} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Person Code *" fullWidth {...register('persCode')} error={!!errors.persCode} helperText={errors.persCode?.message} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.planNo}>
            <InputLabel>Plan *</InputLabel>
            <Select label="Plan *" defaultValue={defaultValues?.planNo ?? ''} {...register('planNo')}>
              {plansData?.data?.map((plan) => (
                <MenuItem key={plan.planNo} value={plan.planNo}>
                  {plan.planNo} — {plan.planName}
                </MenuItem>
              ))}
            </Select>
            {errors.planNo && <FormHelperText>{errors.planNo.message}</FormHelperText>}
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Issue Date *" type="date" fullWidth InputLabelProps={{ shrink: true }} {...register('issueDate')} error={!!errors.issueDate} helperText={errors.issueDate?.message} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Maturity Date *" type="date" fullWidth InputLabelProps={{ shrink: true }} {...register('matDate')} error={!!errors.matDate} helperText={errors.matDate?.message} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField label="Term (years) *" type="number" fullWidth {...register('term')} error={!!errors.term} helperText={errors.term?.message} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField label="PPT (years) *" type="number" fullWidth {...register('ppt')} error={!!errors.ppt} helperText={errors.ppt?.message} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth error={!!errors.paymentMode}>
            <InputLabel>Payment Mode *</InputLabel>
            <Select label="Payment Mode *" defaultValue={defaultValues?.paymentMode ?? ''} {...register('paymentMode')}>
              <MenuItem value="Y">Yearly</MenuItem>
              <MenuItem value="H">Half-Yearly</MenuItem>
              <MenuItem value="Q">Quarterly</MenuItem>
              <MenuItem value="M">Monthly</MenuItem>
              <MenuItem value="S">Single</MenuItem>
            </Select>
            {errors.paymentMode && <FormHelperText>{errors.paymentMode.message}</FormHelperText>}
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Sum Assured (₹) *" type="number" fullWidth {...register('sumAssured')} error={!!errors.sumAssured} helperText={errors.sumAssured?.message} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Premium (₹) *" type="number" fullWidth {...register('premium')} error={!!errors.premium} helperText={errors.premium?.message} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Next Premium Date *" type="date" fullWidth InputLabelProps={{ shrink: true }} {...register('nextPremium')} error={!!errors.nextPremium} helperText={errors.nextPremium?.message} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>NEFT</InputLabel>
            <Select label="NEFT" defaultValue={defaultValues?.neft ?? 'YES'} {...register('neft')}>
              <MenuItem value="YES">Yes</MenuItem>
              <MenuItem value="NO">No</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Nominee *" fullWidth {...register('nominee')} error={!!errors.nominee} helperText={errors.nominee?.message} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Relation *" fullWidth {...register('relation')} error={!!errors.relation} helperText={errors.relation?.message} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField label="Branch" fullWidth {...register('branch')} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField label="DAB Rider (₹)" type="number" fullWidth {...register('dab')} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField label="Term Rider (₹)" type="number" fullWidth {...register('termRider')} />
        </Grid>
      </Grid>
      <Box display="flex" gap={2} mt={3}>
        {onCancel && <Button variant="outlined" onClick={onCancel} fullWidth>Cancel</Button>}
        <Button type="submit" variant="contained" fullWidth disabled={loading}>
          {loading ? 'Saving...' : 'Save Policy'}
        </Button>
      </Box>
    </Box>
  );
}
