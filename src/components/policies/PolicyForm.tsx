import React from 'react';
import { useFormik } from 'formik';
import {
  Box, TextField, Button, Grid, Select, MenuItem,
  FormControl, InputLabel, FormHelperText, Typography, Divider, InputAdornment,
} from '@mui/material';
import { policySchema, PolicyFormValues } from '@/validations/policy.validation';

interface Props {
  initialValues?: Partial<PolicyFormValues>;
  onSubmit: (values: PolicyFormValues) => void;
  loading?: boolean;
  onCancel?: () => void;
}

const PAYMENT_MODES = [
  { value: 'Y', label: 'Yearly' },
  { value: 'H', label: 'Half-Yearly' },
  { value: 'Q', label: 'Quarterly' },
  { value: 'M', label: 'Monthly' },
  { value: 'S', label: 'Single' },
];

const RELATIONS = ['Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister', 'Other'];

const defaults: PolicyFormValues = {
  policyNo: '' as unknown as number,
  familyCode: '',
  persCode: '',
  planNo: '',
  issueDate: '',
  matDate: '',
  term: '' as unknown as number,
  ppt: '' as unknown as number,
  sumAssured: '' as unknown as number,
  premium: '' as unknown as number,
  paymentMode: 'Y',
  nextPremium: '',
  nominee: '',
  relation: '',
  branch: '',
  neft: undefined,
  dab: undefined,
  termRider: undefined,
};

export default function PolicyForm({ initialValues, onSubmit, loading, onCancel }: Props) {
  const formik = useFormik<PolicyFormValues>({
    initialValues: { ...defaults, ...initialValues },
    validationSchema: policySchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit,
  });

  const f = (name: keyof PolicyFormValues) => ({
    id: name,
    name,
    value: (formik.values[name] ?? '') as string,
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    error: formik.touched[name] && Boolean(formik.errors[name]),
    helperText: (formik.touched[name] && formik.errors[name] as string) || undefined,
    fullWidth: true,
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} noValidate>

      {/* Section 1: Policy Identity */}
      <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.8}>
        Policy Identity
      </Typography>
      <Divider sx={{ mb: 2, mt: 0.5 }} />
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12}>
          <TextField
            {...f('policyNo')}
            label="Policy Number *"
            type="number"
            inputProps={{ inputMode: 'numeric' }}
            helperText={(formik.touched.policyNo && formik.errors.policyNo as string) || '9-digit LIC policy number'}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField {...f('familyCode')} label="Family Code *" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField {...f('persCode')} label="Person Code *" inputProps={{ inputMode: 'numeric' as const, maxLength: 10 }} />
        </Grid>
        <Grid item xs={12}>
          <TextField {...f('planNo')} label="Plan Number *" placeholder="e.g. 914" />
        </Grid>
      </Grid>

      {/* Section 2: Dates & Term */}
      <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.8}>
        Dates &amp; Term
      </Typography>
      <Divider sx={{ mb: 2, mt: 0.5 }} />
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6}>
          <TextField {...f('issueDate')} label="Issue Date *" type="date" InputLabelProps={{ shrink: true }} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField {...f('matDate')} label="Maturity Date *" type="date" InputLabelProps={{ shrink: true }} />
        </Grid>
        <Grid item xs={6}>
          <TextField {...f('term')} label="Term (years) *" type="number" inputProps={{ inputMode: 'numeric' as const, min: 1 }} />
        </Grid>
        <Grid item xs={6}>
          <TextField
            {...f('ppt')}
            label="PPT (years) *"
            type="number"
            inputProps={{ inputMode: 'numeric' as const, min: 1 }}
            helperText={(formik.touched.ppt && formik.errors.ppt as string) || 'Premium paying term'}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField {...f('nextPremium')} label="Next Premium Date *" type="date" InputLabelProps={{ shrink: true }} />
        </Grid>
      </Grid>

      {/* Section 3: Financial */}
      <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.8}>
        Financial Details
      </Typography>
      <Divider sx={{ mb: 2, mt: 0.5 }} />
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12}>
          <TextField
            {...f('sumAssured')}
            label="Sum Assured *"
            type="number"
            inputProps={{ inputMode: 'numeric' as const, min: 0 }}
            InputProps={{ startAdornment: <InputAdornment position="start">&#8377;</InputAdornment> }}
            helperText={(formik.touched.sumAssured && formik.errors.sumAssured as string) || 'Min ₹1,00,000 · Multiple of ₹5,000'}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            {...f('premium')}
            label="Annual Premium *"
            type="number"
            inputProps={{ inputMode: 'numeric' as const, min: 0 }}
            InputProps={{ startAdornment: <InputAdornment position="start">&#8377;</InputAdornment> }}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth error={formik.touched.paymentMode && Boolean(formik.errors.paymentMode)}>
            <InputLabel>Payment Mode *</InputLabel>
            <Select
              name="paymentMode"
              value={formik.values.paymentMode}
              label="Payment Mode *"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              {PAYMENT_MODES.map(m => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
            </Select>
            {formik.touched.paymentMode && formik.errors.paymentMode && (
              <FormHelperText>{String(formik.errors.paymentMode)}</FormHelperText>
            )}
          </FormControl>
        </Grid>
      </Grid>

      {/* Section 4: Nominee & Other */}
      <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.8}>
        Nominee &amp; Other
      </Typography>
      <Divider sx={{ mb: 2, mt: 0.5 }} />
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12}>
          <TextField {...f('nominee')} label="Nominee Name *" />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth error={formik.touched.relation && Boolean(formik.errors.relation)}>
            <InputLabel>Relation *</InputLabel>
            <Select
              name="relation"
              value={formik.values.relation}
              label="Relation *"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              {RELATIONS.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </Select>
            {formik.touched.relation && formik.errors.relation && (
              <FormHelperText>{String(formik.errors.relation)}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField {...f('branch')} label="Branch" inputProps={{ maxLength: 15 }} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>NEFT</InputLabel>
            <Select
              name="neft"
              value={formik.values.neft ?? ''}
              label="NEFT"
              onChange={formik.handleChange}
            >
              <MenuItem value="">Not set</MenuItem>
              <MenuItem value="YES">Yes</MenuItem>
              <MenuItem value="NO">No</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <TextField
            {...f('dab')}
            label="DAB"
            type="number"
            inputProps={{ inputMode: 'numeric' as const, min: 0 }}
            InputProps={{ startAdornment: <InputAdornment position="start">&#8377;</InputAdornment> }}
            helperText="Disability Accidental Benefit"
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            {...f('termRider')}
            label="Term Rider"
            type="number"
            inputProps={{ inputMode: 'numeric' as const, min: 0 }}
            InputProps={{ startAdornment: <InputAdornment position="start">&#8377;</InputAdornment> }}
          />
        </Grid>
      </Grid>

      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={1.5}>
        {onCancel && (
          <Button variant="outlined" onClick={onCancel} fullWidth size="large" disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
          {loading ? 'Saving…' : 'Save Policy'}
        </Button>
      </Box>
    </Box>
  );
}
