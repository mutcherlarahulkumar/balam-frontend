import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert, Grid, Link,
} from '@mui/material';
import NextLink from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { authApi } from '@/api/auth.api';
import { registerSchema, RegisterFormData } from '@/validations/auth.validation';

export default function RegisterPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
  });

  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => router.push('/login'),
  });

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{ background: 'linear-gradient(160deg, #0d2137 0%, #1a3c5e 60%, #2d6a9f 100%)', p: 2 }}
    >
      <Card sx={{ width: '100%', maxWidth: 520, borderRadius: 4 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box textAlign="center" mb={3}>
            <Typography variant="h4" fontWeight={800} color="primary.main">Balam</Typography>
            <Typography variant="body2" color="text.secondary">Register Agent Account</Typography>
          </Box>

          {mutation.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Registration failed. This email or agent code may already be in use.
            </Alert>
          )}
          {mutation.isSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Account created! Redirecting to login...
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit((d) => mutation.mutate(d))}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField label="Full Name *" fullWidth {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Email *" fullWidth {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Agent Code *" fullWidth {...register('agentCode')} error={!!errors.agentCode} helperText={errors.agentCode?.message} placeholder="e.g. AG001234" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Licence No. *" fullWidth {...register('licenceNo')} error={!!errors.licenceNo} helperText={errors.licenceNo?.message} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Branch *" fullWidth {...register('branch')} error={!!errors.branch} helperText={errors.branch?.message} placeholder="e.g. VZM001" />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Mobile *" fullWidth {...register('mobile')} error={!!errors.mobile} helperText={errors.mobile?.message} />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Password *" type="password" fullWidth {...register('password')} error={!!errors.password} helperText={errors.password?.message ?? 'Minimum 8 characters'} />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" size="large" fullWidth disabled={mutation.isPending} sx={{ py: 1.75 }}>
                  {mutation.isPending ? 'Creating Account...' : 'Create Account'}
                </Button>
              </Grid>
              <Grid item xs={12} textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Link component={NextLink} href="/login" fontWeight={600}>Sign In</Link>
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
