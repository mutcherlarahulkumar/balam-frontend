import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box, TextField, Button, Grid, Select, MenuItem, FormControl, InputLabel, FormHelperText,
} from '@mui/material';
import { activitySchema, ActivityFormData } from '@/validations/activity.validation';

interface Props {
  onSubmit: (data: ActivityFormData) => void;
  loading?: boolean;
  onCancel?: () => void;
}

export default function ActivityForm({ onSubmit, loading, onCancel }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<ActivityFormData>({
    resolver: yupResolver(activitySchema),
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField label="Client ID *" type="number" fullWidth {...register('clientId')} error={!!errors.clientId} helperText={errors.clientId?.message} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.activityType}>
            <InputLabel>Activity Type *</InputLabel>
            <Select label="Activity Type *" defaultValue="" {...register('activityType')}>
              {['CALL', 'MEETING', 'DEMO', 'EMAIL', 'PROPOSAL', 'MEDICAL', 'REMINDER'].map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </Select>
            {errors.activityType && <FormHelperText>{errors.activityType.message}</FormHelperText>}
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select label="Status" defaultValue="PENDING" {...register('status')}>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="DONE">Done</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Activity Date *" type="date" fullWidth InputLabelProps={{ shrink: true }} {...register('activityDate')} error={!!errors.activityDate} helperText={errors.activityDate?.message} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Activity Time" type="time" fullWidth InputLabelProps={{ shrink: true }} {...register('activityTime')} />
        </Grid>
        <Grid item xs={12}>
          <TextField label="Details" fullWidth multiline rows={3} {...register('details')} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Reminder Date" type="date" fullWidth InputLabelProps={{ shrink: true }} {...register('reminderDate')} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Reminder Time" type="time" fullWidth InputLabelProps={{ shrink: true }} {...register('reminderTime')} />
        </Grid>
      </Grid>
      <Box display="flex" gap={2} mt={3}>
        {onCancel && <Button variant="outlined" onClick={onCancel} fullWidth>Cancel</Button>}
        <Button type="submit" variant="contained" fullWidth disabled={loading}>
          {loading ? 'Saving...' : 'Log Activity'}
        </Button>
      </Box>
    </Box>
  );
}
