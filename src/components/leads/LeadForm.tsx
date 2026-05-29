import React from 'react';
import { useFormik } from 'formik';
import { Box, TextField, Button, Grid } from '@mui/material';
import { leadSchema, LeadFormValues } from '@/validations/lead.validation';

interface Props {
  onSubmit: (values: LeadFormValues) => void;
  loading?: boolean;
  onCancel?: () => void;
}

const defaults: LeadFormValues = {
  name: '',
  mobile: '',
  address: '',
  searchTerm: '',
};

export default function LeadForm({ onSubmit, loading, onCancel }: Props) {
  const formik = useFormik<LeadFormValues>({
    initialValues: defaults,
    validationSchema: leadSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit,
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} noValidate>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            id="name" name="name" label="Full Name *"
            fullWidth size="medium"
            value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="mobile" name="mobile" label="Mobile *"
            fullWidth size="medium"
            inputProps={{ inputMode: 'numeric' as const }}
            value={formik.values.mobile} onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.mobile && Boolean(formik.errors.mobile)}
            helperText={(formik.touched.mobile && formik.errors.mobile) || '10-digit Indian mobile'}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="address" name="address" label="Address"
            fullWidth size="medium" multiline rows={2}
            value={formik.values.address} onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.address && Boolean(formik.errors.address)}
            helperText={formik.touched.address && formik.errors.address}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="searchTerm" name="searchTerm" label="Interest / Search Term"
            fullWidth size="medium"
            value={formik.values.searchTerm} onChange={formik.handleChange} onBlur={formik.handleBlur}
            helperText="e.g. term insurance, child plan, money back"
          />
        </Grid>
      </Grid>
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mt={3}>
        {onCancel && (
          <Button variant="outlined" onClick={onCancel} fullWidth size="large" disabled={loading}>Cancel</Button>
        )}
        <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
          {loading ? 'Saving...' : 'Add Lead'}
        </Button>
      </Box>
    </Box>
  );
}
