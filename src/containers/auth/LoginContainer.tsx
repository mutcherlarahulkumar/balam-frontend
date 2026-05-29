import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { authApi } from '@/api/auth.api';
import { useAuth } from '@/context/AuthContext';
import { loginSchema, LoginFormData } from '@/validations/auth.validation';

export default function LoginContainer() {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: yupResolver(loginSchema) });

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      login(data.token, data.agent);
      router.push('/dashboard');
    },
  });

  function onSubmit(data: LoginFormData) {
    mutation.mutate(data);
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{ bgcolor: 'primary.main' }}
    >
      <Card sx={{ width: '100%', maxWidth: 420, m: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Box textAlign="center" mb={4}>
            <Typography variant="h4" fontWeight={800} color="primary.main">Balam</Typography>
            <Typography variant="body2" color="text.secondary">LIC Agent CRM</Typography>
          </Box>
          <Typography variant="h6" fontWeight={600} mb={3}>Sign In</Typography>

          {mutation.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Invalid credentials. Please try again.
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} display="flex" flexDirection="column" gap={2.5}>
            <TextField
              label="Email or Agent Code"
              fullWidth
              {...register('identifier')}
              error={!!errors.identifier}
              helperText={errors.identifier?.message}
              autoComplete="username"
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
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((p) => !p)} edge="end">
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
              sx={{ mt: 1 }}
            >
              {mutation.isPending ? 'Signing in...' : 'Sign In'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
