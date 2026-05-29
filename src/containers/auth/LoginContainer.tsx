import React, { useState } from 'react';
import { useFormik } from 'formik';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  InputAdornment, IconButton, Divider, Link, Alert,
} from '@mui/material';
import NextLink from 'next/link';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LockIcon from '@mui/icons-material/Lock';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { authApi } from '@/api/auth.api';
import { useAuth } from '@/context/AuthContext';
import { loginSchema, LoginFormValues } from '@/validations/auth.validation';
import BalamLogo from '@/components/common/BalamLogo';

const ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: 'Email/agent code or password is incorrect.',
  account_locked: 'Too many failed attempts. Account locked for 15 minutes.',
  account_terminated: 'This agent account has been terminated.',
};

export default function LoginContainer() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const mutation = useMutation({ mutationFn: authApi.login });

  const formik = useFormik<LoginFormValues>({
    initialValues: { identifier: '', password: '' },
    validationSchema: loginSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: (values) => {
      setServerError('');
      mutation.mutate(values, {
        onSuccess: (data) => {
          login(data.token, data.agent);
          router.push('/dashboard');
        },
        onError: (err: any) => {
          const code = err?.response?.data?.error as string;
          setServerError(
            ERROR_MESSAGES[code]
            ?? err?.response?.data?.message
            ?? err?.message
            ?? 'Login failed. Please try again.',
          );
        },
      });
    },
  });

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{ background: 'linear-gradient(160deg, #0d2137 0%, #1a3c5e 60%, #2d6a9f 100%)', p: 2 }}
    >
      <Card sx={{ width: '100%', maxWidth: 420, borderRadius: 4, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box textAlign="center" mb={3}>
            <Box mx="auto" mb={1.5} sx={{ display: 'inline-block', filter: 'drop-shadow(0 4px 20px rgba(26,60,94,0.4))' }}>
              <BalamLogo size={80} />
            </Box>
            <Typography variant="h4" fontWeight={800} color="primary.main" lineHeight={1}>Balam</Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>LIC Agent CRM</Typography>
          </Box>

          <Typography variant="h5" fontWeight={700} mb={0.5}>Welcome back</Typography>
          <Typography variant="body2" color="text.secondary" mb={2.5}>
            Sign in with your email or agent code
          </Typography>

          {serverError && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }} onClose={() => setServerError('')}>
              {serverError}
            </Alert>
          )}

          <Box component="form" onSubmit={formik.handleSubmit} display="flex" flexDirection="column" gap={2.5}>
            <TextField
              id="identifier"
              name="identifier"
              label="Email or Agent Code"
              fullWidth
              autoFocus
              autoComplete="username"
              value={formik.values.identifier}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.identifier && Boolean(formik.errors.identifier)}
              helperText={formik.touched.identifier && formik.errors.identifier}
              InputProps={{
                startAdornment: <InputAdornment position="start"><AccountCircleIcon color="action" /></InputAdornment>,
              }}
            />
            <TextField
              id="password"
              name="password"
              label="Password"
              fullWidth
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              InputProps={{
                startAdornment: <InputAdornment position="start"><LockIcon color="action" /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(p => !p)} edge="end" size="large" aria-label="toggle password visibility">
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={mutation.isPending}
              sx={{ py: 1.75, fontSize: '1.05rem', mt: 0.5 }}
            >
              {mutation.isPending ? 'Signing in…' : 'Sign In'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />
          <Typography variant="body2" color="text.secondary" textAlign="center">
            New agent?{' '}
            <Link component={NextLink} href="/register" fontWeight={600}>Create an account</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
