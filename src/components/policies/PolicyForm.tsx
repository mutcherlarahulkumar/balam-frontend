import React from 'react';
import { useFormik } from 'formik';
import {
  Box, TextField, Button, Grid, Select, MenuItem,
  FormControl, InputLabel, FormHelperText, Typography, Divider,
  InputAdornment,
} from '@mui/material';
import { policySchema, PolicyFormValues } from '@/validations/policy.validation';
import { usePlans } from '@/hooks/usePlans';

interface Props {
  initialValues?: Partial<PolicyFormValues>;
  onSubmit: (values: PolicyFormValues) => void;
  loading?: boolean;
  onCancel?: () => void;
}

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
  neft: 'YES',
  dab: undefined,
  termRider: undefined,
};

const PAYMENT_MODE_LABELS: Record<string, string> = {
  Y: 'Yearly (2% rebate)',
  H: 'Half-Yearly (1% rebate)',
  Q: 'Quarterly',
  M: 'Monthly',
  S: 'Single Premium',
};

const RELATION_OPTIONS = [
  'WIFE', 'HUSBAND', 'SON', 'DAUGHTER', 'FATHER', 'MOTHER',
  'BROTHER', 'SISTER', 'GRANDFATHER', 'GRANDMOTHER', 'GRANDSON',
  'GRANDDAUGHTER', 'UNCLE', 'AUNT', 'NEPHEW', 'NIECE', 'OTHER',
];

export default function PolicyForm({ initialValues, onSubmit, loading, onCancel }: Props) {
  const { data: plansData } = usePlans({});

  const formik = useFormik<PolicyFormValues>({
    initialValues: { ...defaults, ...initialValues },
    validationSchema: policySchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit,
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} noValidate>
      {/* Section: Identity */}
      <Typography variant="overline" color="text.secondary" display="block" mb={1.5}>
        Policy Identity
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            id="policyNo" name="policyNo" label="Policy Number *" type="number"
            fullWidth size="medium"
            inputProps={{ inputMode: 'numeric' as const }}
            value={formik.values.policyNo ?? ''}
            onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.policyNo && Boolean(formik.errors.policyNo)}
            helperText={(formik.touched.policyNo && formik.errors.policyNo) || '9-digit LIC policy number'}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            id="familyCode" name="familyCode" label="Family Code *"
            fullWidth size="medium"
            value={formik.values.familyCode}
            onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.familyCode && Boolean(formik.errors.familyCode)}
            helperText={(formik.touched.familyCode && formik.errors.familyCode) || 'e.g. F001'}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            id="persCode" name="persCode" label="Person Code *"
            fullWidth size="medium"
            inputProps={{ inputMode: 'numeric' as const }}
            value={formik.values.persCode}
            onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.persCode && Boolean(formik.errors.persCode)}
            helperText={(formik.touched.persCode && formik.errors.persCode) || '01, 02, 03...'}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth error={formik.touched.planNo && Boolean(formik.errors.planNo)}>
            <InputLabel id="planNo-label">Plan *</InputLabel>
            <Select
              labelId="planNo-label" id="planNo" name="planNo" label="Plan *"
              value={formik.values.planNo}
              onChange={formik.handleChange} onBlur={formik.handleBlur}
            >
              {plansData?.data?.map((plan) => (
                <MenuItem key={plan.planNo} value={plan.planNo}>
                  {plan.planNo} — {plan.planName}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.planNo && formik.errors.planNo && (
              <FormHelperText>{formik.errors.planNo}</FormHelperText>
            )}
          </FormControl>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2.5 }} />
      <Typography variant="overline" color="text.secondary" display="block" mb={1.5}>
        Dates &amp; Term
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            id="issueDate" name="issueDate" label="Issue Date *" type="date"
            fullWidth size="medium" InputLabelProps={{ shrink: true }}
            inputProps={{ max: new Date().toISOString().split('T')[0] }}
            value={formik.values.issueDate}
            onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.issueDate && Boolean(formik.errors.issueDate)}
            helperText={formik.touched.issueDate && formik.errors.issueDate}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            id="matDate" name="matDate" label="Maturity Date *" type="date"
            fullWidth size="medium" InputLabelProps={{ shrink: true }}
            value={formik.values.matDate}
            onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.matDate && Boolean(formik.errors.matDate)}
            helperText={formik.touched.matDate && formik.errors.matDate}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            id="term" name="term" label="Term (years) *" type="number"
            fullWidth size="medium"
            inputProps={{ inputMode: 'numeric' as const }}
            value={formik.values.term ?? ''}
            onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.term && Boolean(formik.errors.term)}
            helperText={(formik.touched.term && formik.errors.term) || '5–40 years'}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            id="ppt" name="ppt" label="PPT (years) *" type="number"
            fullWidth size="medium"
            inputProps={{ inputMode: 'numeric' as const }}
            value={formik.values.ppt ?? ''}
            onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.ppt && Boolean(formik.errors.ppt)}
            helperText={(formik.touched.ppt && formik.errors.ppt) || '≤ term'}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth error={formik.touched.paymentMode && Boolean(formik.errors.paymentMode)}>
            <InputLabel id="paymentMode-label">Mode *</InputLabel>
            <Select
              labelId="paymentMode-label" id="paymentMode" name="paymentMode" label="Mode *"
              value={formik.values.paymentMode}
              onChange={formik.handleChange} onBlur={formik.handleBlur}
            >
              {Object.entries(PAYMENT_MODE_LABELS).map(([k, v]) => (
                <MenuItem key={k} value={k}>{v}</MenuItem>
              ))}
            </Select>
            {formik.touched.paymentMode && formik.errors.paymentMode && (
              <FormHelperText>{formik.errors.paymentMode}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="nextPremium" name="nextPremium" label="Next Premium Date *" type="date"
            fullWidth size="medium" InputLabelProps={{ shrink: true }}
            value={formik.values.nextPremium}
            onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.nextPremium && Boolean(formik.errors.nextPremium)}
            helperText={formik.touched.nextPremium && formik.errors.nextPremium}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2.5 }} />
      <Typography variant="overline" color="text.secondary" display="block" mb={1.5}>
        Financial Details
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            id="sumAssured" name="sumAssured" label="Sum Assured *"
            fullWidth size="medium"
            inputProps={{ inputMode: 'numeric' as const }}
            InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
            value={formik.values.sumAssured ?? ''}
            onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.sumAssured && Boolean(formik.errors.sumAssured)}
            helperText={(formik.touched.sumAssured && formik.errors.sumAssured) || 'Min ₹1,00,000 · Multiple of ₹5,000'}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            id="premium" name="premium" label="Premium *"
            fullWidth size="medium"
            inputProps={{ inputMode: 'numeric' as const }}
            InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
            value={formik.values.premium ?? ''}
            onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.premium && Boolean(formik.errors.premium)}
            helperText={(formik.touched.premium && formik.errors.premium) || 'Min ₹1,000'}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            id="dab" name="dab" label="DAB Rider (₹)" type="number"
            fullWidth size="medium"
            inputProps={{ inputMode: 'numeric' as const }}
            InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
            value={formik.values.dab ?? ''}
            onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.dab && Boolean(formik.errors.dab)}
            helperText={formik.touched.dab && formik.errors.dab}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            id="termRider" name="termRider" label="Term Rider (₹)" type="number"
            fullWidth size="medium"
            inputProps={{ inputMode: 'numeric' as const }}
            InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
            value={formik.values.termRider ?? ''}
            onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.termRider && Boolean(formik.errors.termRider)}
            helperText={formik.touched.termRider && formik.errors.termRider}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2.5 }} />
      <Typography variant="overline" color="text.secondary" display="block" mb={1.5}>
        Nominee &amp; Other
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            id="nominee" name="nominee" label="Nominee Name *"
            fullWidth size="medium"
            value={formik.values.nominee}
            onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.nominee && Boolean(formik.errors.nominee)}
            helperText={formik.touched.nominee && formik.errors.nominee}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={formik.touched.relation && Boolean(formik.errors.relation)}>
            <InputLabel id="relation-label">Relation *</InputLabel>
            <Select
              labelId="relation-label" id="relation" name="relation" label="Relation *"
              value={formik.values.relation}
              onChange={formik.handleChange} onBlur={formik.handleBlur}
            >
              {RELATION_OPTIONS.map((r) => (
                <MenuItem key={r} value={r}>{r}</MenuItem>
              ))}
            </Select>
            {formik.touched.relation && formik.errors.relation && (
              <FormHelperText>{formik.errors.relation}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            id="branch" name="branch" label="Branch"
            fullWidth size="medium"
            value={formik.values.branch ?? ''}
            onChange={formik.handleChange} onBlur={formik.handleBlur}
            helperText="e.g. VZM001"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="neft-label">NEFT Registered</InputLabel>
            <Select
              labelId="neft-label" id="neft" name="neft" label="NEFT Registered"
              value={formik.values.neft ?? 'YES'}
              onChange={formik.handleChange} onBlur={formik.handleBlur}
            >
              <MenuItem value="YES">Yes</MenuItem>
              <MenuItem value="NO">No</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mt={3}>
        {onCancel && (
          <Button variant="outlined" onClick={onCancel} fullWidth size="large" disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}
          sx={{ py: 1.5 }}>
          {loading ? 'Saving Policy...' : 'Save Policy'}
        </Button>
      </Box>
    </Box>
  );
}
