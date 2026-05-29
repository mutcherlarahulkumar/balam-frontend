import React from 'react';
import { useFormik } from 'formik';
import { Box, TextField, Button, Grid, InputAdornment } from '@mui/material';
import { sbSchema, SBFormValues } from '@/validations/sb.validation';

interface Props {
  onSubmit: (values: SBFormValues) => void;
  loading?: boolean;
  onCancel?: () => void;
}

const defaults: SBFormValues = {
  policyNo: '' as unknown as number,
  sbDueDate: '',
  sbAmount: '' as unknown as number,
  instalmentNo: '' as unknown as number,
};

export default function SBForm({ onSubmit, loading, onCancel }: Props) {
  const formik = useFormik<SBFormValues>({
    initialValues: defaults,
    validationSchema: sbSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit,
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} noValidate>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            id="policyNo" name="policyNo" label="Policy Number *"
            fullWidth size="medium"
            inputProps={{ inputMode: 'numeric' as const }}
            value={formik.values.policyNo ?? ''} onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.policyNo && Boolean(formik.errors.policyNo)}
            helperText={(formik.touched.policyNo && formik.errors.policyNo) || '9-digit LIC policy number'}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            id="sbDueDate" name="sbDueDate" label="SB Due Date *" type="date"
            fullWidth size="medium" InputLabelProps={{ shrink: true }}
            value={formik.values.sbDueDate} onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.sbDueDate && Boolean(formik.errors.sbDueDate)}
            helperText={formik.touched.sbDueDate && formik.errors.sbDueDate}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            id="instalmentNo" name="instalmentNo" label="Instalment No. *"
            fullWidth size="medium"
            inputProps={{ inputMode: 'numeric' as const }}
            value={formik.values.instalmentNo ?? ''} onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.instalmentNo && Boolean(formik.errors.instalmentNo)}
            helperText={(formik.touched.instalmentNo && formik.errors.instalmentNo) || '1–10'}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="sbAmount" name="sbAmount" label="SB Amount *"
            fullWidth size="medium"
            inputProps={{ inputMode: 'numeric' as const }}
            InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
            value={formik.values.sbAmount ?? ''} onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.sbAmount && Boolean(formik.errors.sbAmount)}
            helperText={(formik.touched.sbAmount && formik.errors.sbAmount) || 'Min ₹1,000 · Multiple of ₹500'}
          />
        </Grid>
      </Grid>
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mt={3}>
        {onCancel && (
          <Button variant="outlined" onClick={onCancel} fullWidth size="large" disabled={loading}>Cancel</Button>
        )}
        <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
          {loading ? 'Saving...' : 'Save SB Record'}
        </Button>
      </Box>
    </Box>
  );
}
