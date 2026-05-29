import React from 'react';
import { useFormik } from 'formik';
import { Box, TextField, Button, Grid } from '@mui/material';
import { familySchema, FamilyFormValues } from '@/validations/family.validation';

interface Props {
  initialValues?: Partial<FamilyFormValues>;
  onSubmit: (values: FamilyFormValues) => void;
  loading?: boolean;
  onCancel?: () => void;
}

const defaults: FamilyFormValues = {
  familyCode: '',
  headName: '',
  address: '',
  mobile: '',
  email: '',
  pincode: '',
  religion: '',
  designation: '',
};

export default function FamilyForm({ initialValues, onSubmit, loading, onCancel }: Props) {
  const formik = useFormik<FamilyFormValues>({
    initialValues: { ...defaults, ...initialValues },
    validationSchema: familySchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit,
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} noValidate>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            id="familyCode" name="familyCode" label="Family Code"
            fullWidth size="medium"
            value={formik.values.familyCode} onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.familyCode && Boolean(formik.errors.familyCode)}
            helperText={(formik.touched.familyCode && formik.errors.familyCode) || 'Auto-generated if blank'}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            id="headName" name="headName" label="Head Name *"
            fullWidth size="medium"
            value={formik.values.headName} onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.headName && Boolean(formik.errors.headName)}
            helperText={formik.touched.headName && formik.errors.headName}
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
        <Grid item xs={12} sm={6}>
          <TextField
            id="mobile" name="mobile" label="Mobile"
            fullWidth size="medium"
            inputProps={{ inputMode: 'numeric' as const }}
            value={formik.values.mobile} onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.mobile && Boolean(formik.errors.mobile)}
            helperText={(formik.touched.mobile && formik.errors.mobile) || '10-digit Indian mobile'}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            id="email" name="email" label="Email" type="email"
            fullWidth size="medium"
            inputProps={{ inputMode: 'email' as const }}
            value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            id="pincode" name="pincode" label="Pincode"
            fullWidth size="medium"
            inputProps={{ inputMode: 'numeric' as const }}
            value={formik.values.pincode} onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.pincode && Boolean(formik.errors.pincode)}
            helperText={formik.touched.pincode && formik.errors.pincode}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            id="religion" name="religion" label="Religion"
            fullWidth size="medium"
            value={formik.values.religion} onChange={formik.handleChange} onBlur={formik.handleBlur}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            id="designation" name="designation" label="Designation"
            fullWidth size="medium"
            value={formik.values.designation} onChange={formik.handleChange} onBlur={formik.handleBlur}
          />
        </Grid>
      </Grid>
      <Box display="flex" gap={2} mt={3}>
        {onCancel && (
          <Button variant="outlined" onClick={onCancel} fullWidth size="large" disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
          {loading ? 'Saving...' : 'Save Family'}
        </Button>
      </Box>
    </Box>
  );
}
