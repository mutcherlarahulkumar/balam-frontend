import React from 'react';
import { useFormik } from 'formik';
import {
  Box, TextField, Button, Grid, Select, MenuItem,
  FormControl, InputLabel, FormHelperText,
} from '@mui/material';
import { clientSchema, ClientFormValues } from '@/validations/client.validation';

interface Props {
  initialValues?: Partial<ClientFormValues>;
  onSubmit: (values: ClientFormValues) => void;
  loading?: boolean;
  onCancel?: () => void;
}

const defaults: ClientFormValues = {
  familyCode: '',
  persCode: '',
  name: '',
  dob: undefined,
  sex: undefined,
  mobile: undefined,
  email: undefined,
  occupation: undefined,
  clientType: 'C',
  address: undefined,
};

export default function ClientForm({ initialValues, onSubmit, loading, onCancel }: Props) {
  const formik = useFormik<ClientFormValues>({
    initialValues: { ...defaults, ...initialValues },
    validationSchema: clientSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit,
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} noValidate>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            id="familyCode" name="familyCode" label="Family Code *"
            fullWidth size="medium"
            value={formik.values.familyCode} onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.familyCode && Boolean(formik.errors.familyCode)}
            helperText={formik.touched.familyCode && formik.errors.familyCode}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            id="persCode" name="persCode" label="Person Code *"
            fullWidth size="medium"
            inputProps={{ inputMode: 'numeric' as const }}
            value={formik.values.persCode} onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.persCode && Boolean(formik.errors.persCode)}
            helperText={(formik.touched.persCode && formik.errors.persCode) || '01=Head, 02=Spouse, 03+=Others'}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="name" name="name" label="Full Name *"
            fullWidth size="medium"
            value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            id="dob" name="dob" label="Date of Birth" type="date"
            fullWidth size="medium" InputLabelProps={{ shrink: true }}
            inputProps={{ max: new Date().toISOString().split('T')[0] }}
            value={formik.values.dob ?? ''} onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.dob && Boolean(formik.errors.dob)}
            helperText={formik.touched.dob && formik.errors.dob}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={formik.touched.sex && Boolean(formik.errors.sex)}>
            <InputLabel id="sex-label">Sex</InputLabel>
            <Select
              labelId="sex-label" id="sex" name="sex" label="Sex"
              value={formik.values.sex ?? ''}
              onChange={formik.handleChange} onBlur={formik.handleBlur}
            >
              <MenuItem value="M">Male</MenuItem>
              <MenuItem value="F">Female</MenuItem>
              <MenuItem value="O">Other</MenuItem>
            </Select>
            {formik.touched.sex && formik.errors.sex && (
              <FormHelperText>{formik.errors.sex}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            id="mobile" name="mobile" label="Mobile"
            fullWidth size="medium"
            inputProps={{ inputMode: 'numeric' as const }}
            value={formik.values.mobile ?? ''} onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.mobile && Boolean(formik.errors.mobile)}
            helperText={(formik.touched.mobile && formik.errors.mobile) || '10-digit Indian mobile'}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            id="email" name="email" label="Email" type="email"
            fullWidth size="medium"
            inputProps={{ inputMode: 'email' as const }}
            value={formik.values.email ?? ''} onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            id="occupation" name="occupation" label="Occupation"
            fullWidth size="medium"
            value={formik.values.occupation ?? ''} onChange={formik.handleChange} onBlur={formik.handleBlur}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="clientType-label">Client Type</InputLabel>
            <Select
              labelId="clientType-label" id="clientType" name="clientType" label="Client Type"
              value={formik.values.clientType ?? 'C'}
              onChange={formik.handleChange} onBlur={formik.handleBlur}
            >
              <MenuItem value="C">Customer (has policy)</MenuItem>
              <MenuItem value="P">Prospect (potential)</MenuItem>
              <MenuItem value="N">New</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="address" name="address" label="Address"
            fullWidth size="medium" multiline rows={2}
            value={formik.values.address ?? ''} onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.address && Boolean(formik.errors.address)}
            helperText={formik.touched.address && formik.errors.address}
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
          {loading ? 'Saving...' : 'Save Client'}
        </Button>
      </Box>
    </Box>
  );
}
