import React, { useState } from 'react';
import { useFormik } from 'formik';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  InputAdornment, IconButton, Divider, Link, Grid, Alert,
} from '@mui/material';
import NextLink from 'next/link';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { authApi } from '@/api/auth.api';
import { registerSchema, RegisterFormValues } from '@/validations/auth.validation';
import { useToast } from '@/hooks/useToast';
import BalamLogo from '@/components/common/BalamLogo';

const ERROR_MESSAGES: Record<string, string> = {
  email_taken: 'An account with this email already exists.',
  agent_code_taken: 'This agent code is already registered.',
};

const FIELD_MAP: Record<string, keyof RegisterFormValues> = {
  name: 'name', email: 'email', agentCode: 'agentCode',
  password: 'password', branch: 'branch', mobile: 'mobile', licenceNo: 'licenceNo',
};

export default function RegisterContainer() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const toast = useToast();
  const router = useRouter();

  const mutation = useMutation({ mutationFn: authApi.register });

  const formik = useFormik<RegisterFormValues>({
    initialValues: { name: '', email: '', agentCode: '', password: '', branch: '', mobile: '', licenceNo: '' },
    validationSchema: registerSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: (values, helpers) => {
      setServerError('');
      mutation.mutate(values, {
        onSuccess: () => {
          toast.success('Account created! Please sign in.');
          router.push('/login');
        },
        onError: (err: any) => {
          const code = err?.response?.data?.error as string;
          // Field-level validation errors from backend
          const fieldErrors: Array<{ field: string; message: string }> = err?.response?.data?.errors ?? [];
          if (fieldErrors.length > 0) {
            const touched: Record<string, boolean> = {};
            const errors: Record<string, string> = {};
            fieldErrors.forEach(({ field, message }) => {
              const key = FIELD_MAP[field] ?? field;
              touched[key] = true;
              errors[key] = message;
            });
            helpers.setTouched(touched as any);
            helpers.setErrors(errors as any);
            return;
          }
          setServerError(
            ERROR_MESSAGES[code]
            ?? err?.response?.data?.message
            ?? err?.message
            ?? 'Registration failed. Please try again.',
          );
        },
      });
    },
  });

  const field = (name: keyof RegisterFormValues) => ({
    id: name,
    name,
    value: formik.values[name],
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    error: formik.touched[name] && Boolean(formik.errors[name]),
    helperText: formik.touched[name] && formik.errors[name],
    fullWidth: true,
  });

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{ background: 'linear-gradient(160deg, #0d2137 0%, #1a3c5e 60%, #2d6a9f 100%)', p: 2, py: 4 }}
    >
      <Card sx={{ width: '100%', maxWidth: 520, borderRadius: 4, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box textAlign="center" mb={3}>
            <Box mx="auto" mb={1.5} sx={{ display: 'inline-block', filter: 'drop-shadow(0 4px 20px rgba(26,60,94,0.4))' }}>
              <BalamLogo size={72} />
            </Box>
            <Typography variant="h4" fontWeight={800} color="primary.main" lineHeight={1}>Balam</Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>LIC Agent CRM</Typography>
          </Box>

          <Typography variant="h5" fontWeight={700} mb={0.5}>Create your account</Typography>
          <Typography variant="body2" color="text.secondary" mb={2.5}>
            Register your LIC agent profile
          </Typography>

          {serverError && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }} onClose={() => setServerError('')}>
              {serverError}
            </Alert>
          )}

          <Box component="form" onSubmit={formik.handleSubmit} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField {...field('name')} label="Full Name *" autoFocus autoComplete="name" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField {...field('email')} label="Email *" type="email" autoComplete="email" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField {...field('agentCode')} label="Agent Code *" placeholder="e.g. 0045269T" autoCapitalize="characters" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField {...field('licenceNo')} label="Licence No. *" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField {...field('branch')} label="Branch *" placeholder="e.g. VZM001" />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  {...field('mobile')}
                  label="Mobile *"
                  type="tel"
                  autoComplete="tel"
                  inputProps={{ inputMode: 'numeric', maxLength: 15 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  {...field('password')}
                  label="Password *"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  helperText={(formik.touched.password && formik.errors.password) || 'Minimum 8 characters'}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(p => !p)} edge="end" size="large" aria-label="toggle password visibility">
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={mutation.isPending}
                  sx={{ py: 1.75, fontSize: '1.05rem' }}
                >
                  {mutation.isPending ? 'Creating Account…' : 'Create Account'}
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Already have an account?{' '}
            <Link component={NextLink} href="/login" fontWeight={600}>Sign In</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
