import React from 'react';
import { useFormik } from 'formik';
import {
  Box, TextField, Button, Grid, Select, MenuItem,
  FormControl, InputLabel, FormHelperText,
} from '@mui/material';
import { activitySchema, ActivityFormValues } from '@/validations/activity.validation';

interface Props {
  onSubmit: (values: ActivityFormValues) => void;
  loading?: boolean;
  onCancel?: () => void;
  defaultClientId?: number;
}

const defaults: ActivityFormValues = {
  clientId: '' as unknown as number,
  activityType: 'CALL',
  activityDate: new Date().toISOString().split('T')[0],
  activityTime: '',
  details: '',
  reminderDate: '',
  reminderTime: '',
  status: 'PENDING',
};

export default function ActivityForm({ onSubmit, loading, onCancel, defaultClientId }: Props) {
  const formik = useFormik<ActivityFormValues>({
    initialValues: { ...defaults, clientId: defaultClientId ?? ('' as unknown as number) },
    validationSchema: activitySchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit,
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} noValidate>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            id="clientId" name="clientId" label="Client ID *"
            fullWidth size="medium"
            inputProps={{ inputMode: 'numeric' as const }}
            value={formik.values.clientId ?? ''} onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.clientId && Boolean(formik.errors.clientId)}
            helperText={(formik.touched.clientId && formik.errors.clientId) || 'Enter the client ID number'}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={formik.touched.activityType && Boolean(formik.errors.activityType)}>
            <InputLabel id="activityType-label">Activity Type *</InputLabel>
            <Select
              labelId="activityType-label" id="activityType" name="activityType" label="Activity Type *"
              value={formik.values.activityType}
              onChange={formik.handleChange} onBlur={formik.handleBlur}
            >
              {['CALL', 'MEETING', 'DEMO', 'EMAIL', 'PROPOSAL', 'MEDICAL', 'REMINDER'].map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </Select>
            {formik.touched.activityType && formik.errors.activityType && (
              <FormHelperText>{formik.errors.activityType}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label" id="status" name="status" label="Status"
              value={formik.values.status ?? 'PENDING'}
              onChange={formik.handleChange} onBlur={formik.handleBlur}
            >
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="DONE">Done</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            id="activityDate" name="activityDate" label="Activity Date *" type="date"
            fullWidth size="medium" InputLabelProps={{ shrink: true }}
            value={formik.values.activityDate} onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.activityDate && Boolean(formik.errors.activityDate)}
            helperText={formik.touched.activityDate && formik.errors.activityDate}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            id="activityTime" name="activityTime" label="Activity Time" type="time"
            fullWidth size="medium" InputLabelProps={{ shrink: true }}
            value={formik.values.activityTime} onChange={formik.handleChange} onBlur={formik.handleBlur}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="details" name="details" label="Details"
            fullWidth size="medium" multiline rows={3}
            value={formik.values.details} onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.details && Boolean(formik.errors.details)}
            helperText={(formik.touched.details && formik.errors.details) || `${formik.values.details?.length ?? 0}/1000`}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            id="reminderDate" name="reminderDate" label="Reminder Date" type="date"
            fullWidth size="medium" InputLabelProps={{ shrink: true }}
            value={formik.values.reminderDate} onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.reminderDate && Boolean(formik.errors.reminderDate)}
            helperText={formik.touched.reminderDate && formik.errors.reminderDate}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            id="reminderTime" name="reminderTime" label="Reminder Time" type="time"
            fullWidth size="medium" InputLabelProps={{ shrink: true }}
            value={formik.values.reminderTime} onChange={formik.handleChange} onBlur={formik.handleBlur}
          />
        </Grid>
      </Grid>
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mt={3}>
        {onCancel && (
          <Button variant="outlined" onClick={onCancel} fullWidth size="large" disabled={loading}>Cancel</Button>
        )}
        <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
          {loading ? 'Saving...' : 'Log Activity'}
        </Button>
      </Box>
    </Box>
  );
}
