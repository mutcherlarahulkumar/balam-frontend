import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  InputAdornment, IconButton, Divider, Link,
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
import { loginSchema, LoginFormData } from '@/validations/auth.validation';
import { useToast } from '@/hooks/useToast';
import BalamLogo from '@/components/common/BalamLogo';

export default function LoginContainer() {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      login(data.token, data.agent);
      router.push('/dashboard');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message
        ?? err?.message
        ?? 'Login failed. Please try again.';
      toast.error(msg);
    },
  });

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        background: 'linear-gradient(160deg, #0d2137 0%, #1a3c5e 60%, #2d6a9f 100%)',
        p: 2,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 4,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          {/* Logo / Brand */}
          <Box textAlign="center" mb={4}>
            <Box mx="auto" mb={2} sx={{ display: 'inline-block', filter: 'drop-shadow(0 4px 20px rgba(26,60,94,0.4))' }}>
              <BalamLogo size={84} />
            </Box>
            <Typography variant="h4" fontWeight={800} color="primary.main">Balam</Typography>
            <Typography variant="body1" color="text.secondary">LIC Agent CRM</Typography>
          </Box>

          <Typography variant="h5" fontWeight={700} mb={0.5}>Welcome back</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Sign in with your email or agent code
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit((data) => mutation.mutate(data))}
            display="flex"
            flexDirection="column"
            gap={2.5}
          >
            <TextField
              label="Email or Agent Code"
              fullWidth
              size="medium"
              {...register('identifier')}
              error={!!errors.identifier}
              helperText={errors.identifier?.message}
              autoComplete="username"
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircleIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Password"
              fullWidth
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              autoComplete="current-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((p) => !p)}
                      edge="end"
                      size="large"
                      aria-label="toggle password visibility"
                    >
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
              sx={{ mt: 0.5, py: 1.75, fontSize: '1.05rem' }}
            >
              {mutation.isPending ? 'Signing in...' : 'Sign In'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />
          <Typography variant="body2" color="text.secondary" textAlign="center">
            New agent?{' '}
            <Link component={NextLink} href="/register" fontWeight={600}>
              Create an account
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
