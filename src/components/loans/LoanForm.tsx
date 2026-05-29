import React from 'react';
import { useFormik } from 'formik';
import { Box, TextField, Button, Grid, InputAdornment } from '@mui/material';
import { loanSchema, LoanFormValues } from '@/validations/loan.validation';

interface Props {
  onSubmit: (values: LoanFormValues) => void;
  loading?: boolean;
  onCancel?: () => void;
}

const defaults: LoanFormValues = {
  policyNo: '' as unknown as number,
  loanDate: '',
  loanAmount: '' as unknown as number,
  interestDueDate: '',
  loanInterest: undefined,
};

export default function LoanForm({ onSubmit, loading, onCancel }: Props) {
  const formik = useFormik<LoanFormValues>({
    initialValues: defaults,
    validationSchema: loanSchema,
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
            id="loanDate" name="loanDate" label="Loan Date *" type="date"
            fullWidth size="medium" InputLabelProps={{ shrink: true }}
            inputProps={{ max: new Date().toISOString().split('T')[0] }}
            value={formik.values.loanDate} onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.loanDate && Boolean(formik.errors.loanDate)}
            helperText={formik.touched.loanDate && formik.errors.loanDate}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            id="interestDueDate" name="interestDueDate" label="Interest Due Date *" type="date"
            fullWidth size="medium" InputLabelProps={{ shrink: true }}
            value={formik.values.interestDueDate} onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.interestDueDate && Boolean(formik.errors.interestDueDate)}
            helperText={formik.touched.interestDueDate && formik.errors.interestDueDate}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            id="loanAmount" name="loanAmount" label="Loan Amount *"
            fullWidth size="medium"
            inputProps={{ inputMode: 'numeric' as const }}
            InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
            value={formik.values.loanAmount ?? ''} onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.loanAmount && Boolean(formik.errors.loanAmount)}
            helperText={(formik.touched.loanAmount && formik.errors.loanAmount) || 'Min ₹5,000 · Multiple of ₹1,000'}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            id="loanInterest" name="loanInterest" label="Loan Interest (₹)"
            fullWidth size="medium"
            inputProps={{ inputMode: 'numeric' as const }}
            InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
            value={formik.values.loanInterest ?? ''} onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.loanInterest && Boolean(formik.errors.loanInterest)}
            helperText={formik.touched.loanInterest && formik.errors.loanInterest}
          />
        </Grid>
      </Grid>
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mt={3}>
        {onCancel && (
          <Button variant="outlined" onClick={onCancel} fullWidth size="large" disabled={loading}>Cancel</Button>
        )}
        <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
          {loading ? 'Saving...' : 'Save Loan'}
        </Button>
      </Box>
    </Box>
  );
}
