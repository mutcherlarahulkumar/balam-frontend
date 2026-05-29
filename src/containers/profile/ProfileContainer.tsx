import React, { useState } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, TextField, Button, Divider, Avatar,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useAgentProfile, useUpdateAgentProfile } from '@/hooks/useAgent';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/auth.api';
import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/components/common/PageHeader';
import LoadingState from '@/components/common/LoadingState';
import { formatDate } from '@/utils/date';
import { changePasswordSchema, ChangePasswordFormData } from '@/validations/auth.validation';
import { yupResolver } from '@hookform/resolvers/yup';

export default function ProfileContainer() {
  const { agent: authAgent } = useAuth();
  const { data: profile, isLoading } = useAgentProfile();
  const updateProfile = useUpdateAgentProfile();
  const [editMode, setEditMode] = useState(false);
  const [profileValues, setProfileValues] = useState({ name: '', mobile: '', slogan: '' });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ChangePasswordFormData>({
    resolver: yupResolver(changePasswordSchema),
  });

  const changePassword = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => reset(),
  });

  if (isLoading) return <LoadingState />;

  const agent = profile ?? authAgent;

  return (
    <>
      <PageHeader title="Agent Profile" subtitle={`${agent?.agentCode} · ${agent?.branch}`} />
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
                <Avatar sx={{ width: 80, height: 80, fontSize: 32, bgcolor: 'primary.main', mb: 1 }}>
                  {agent?.name?.[0]?.toUpperCase()}
                </Avatar>
                <Typography variant="h6" fontWeight={700}>{agent?.name}</Typography>
                <Typography variant="body2" color="text.secondary">{agent?.email}</Typography>
                {agent?.club && <Typography variant="caption" color="secondary.main" fontWeight={700}>{agent.club}</Typography>}
              </Box>
              <Divider sx={{ mb: 2 }} />
              {([
                ['Agent Code', agent?.agentCode],
                ['Branch', agent?.branch],
                ['Licence No.', agent?.licenceNo],
                ['PAN', agent?.pan],
                ['Mobile', agent?.mobile],
                ['Agent Since', formatDate(agent?.agSince)],
                ['Renewal Date', formatDate(agent?.renewalDate)],
              ] as [string, string | undefined][]).map(([label, value]) => (
                <Box key={label} display="flex" justifyContent="space-between" py={0.75} borderBottom="1px solid" borderColor="divider">
                  <Typography variant="body2" color="text.secondary">{label}</Typography>
                  <Typography variant="body2" fontWeight={500}>{value || '—'}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={600}>Edit Profile</Typography>
                <Button size="small" variant={editMode ? 'outlined' : 'contained'} onClick={() => setEditMode((v) => !v)}>
                  {editMode ? 'Cancel' : 'Edit'}
                </Button>
              </Box>
              {editMode ? (
                <Box display="flex" flexDirection="column" gap={2}>
                  <TextField label="Name" fullWidth value={profileValues.name || agent?.name || ''} onChange={(e) => setProfileValues((v) => ({ ...v, name: e.target.value }))} />
                  <TextField label="Mobile" fullWidth value={profileValues.mobile || agent?.mobile || ''} onChange={(e) => setProfileValues((v) => ({ ...v, mobile: e.target.value }))} />
                  <TextField label="Slogan" fullWidth value={profileValues.slogan || agent?.slogan || ''} onChange={(e) => setProfileValues((v) => ({ ...v, slogan: e.target.value }))} />
                  <Button variant="contained" disabled={updateProfile.isPending} onClick={() => {
                    updateProfile.mutate(profileValues, { onSuccess: () => setEditMode(false) });
                  }}>
                    {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">Click Edit to update your profile details.</Typography>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Change Password</Typography>
              {changePassword.isSuccess && (
                <Typography color="success.main" variant="body2" mb={2}>Password changed successfully.</Typography>
              )}
              {changePassword.isError && (
                <Typography color="error.main" variant="body2" mb={2}>Failed to change password. Check your current password.</Typography>
              )}
              <Box component="form" onSubmit={handleSubmit((data) => changePassword.mutate(data))} display="flex" flexDirection="column" gap={2}>
                <TextField label="Current Password" type="password" fullWidth {...register('currentPassword')} error={!!errors.currentPassword} helperText={errors.currentPassword?.message} />
                <TextField label="New Password" type="password" fullWidth {...register('newPassword')} error={!!errors.newPassword} helperText={errors.newPassword?.message} />
                <TextField label="Confirm New Password" type="password" fullWidth {...register('confirmPassword')} error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message} />
                <Button type="submit" variant="contained" disabled={changePassword.isPending}>
                  {changePassword.isPending ? 'Updating...' : 'Change Password'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
