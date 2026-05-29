import React, { useState } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, TextField, Button, Divider, Avatar,
} from '@mui/material';
import { useFormik } from 'formik';
import { useAgentProfile, useUpdateAgentProfile } from '@/hooks/useAgent';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/auth.api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/useToast';
import PageHeader from '@/components/common/PageHeader';
import LoadingState from '@/components/common/LoadingState';
import { formatDate } from '@/utils/date';
import { changePasswordSchema, ChangePasswordFormData } from '@/validations/auth.validation';

export default function ProfileContainer() {
  const { agent: authAgent } = useAuth();
  const { data: profile, isLoading } = useAgentProfile();
  const updateProfile = useUpdateAgentProfile();
  const toast = useToast();
  const [editMode, setEditMode] = useState(false);

  const agent = profile ?? authAgent;

  const profileFormik = useFormik({
    initialValues: {
      name: agent?.name ?? '',
      mobile: agent?.mobile ?? '',
      slogan: agent?.slogan ?? '',
    },
    enableReinitialize: true,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: (values) => {
      updateProfile.mutate(values, {
        onSuccess: () => {
          toast.success('Profile updated');
          setEditMode(false);
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message ?? 'Failed to update profile');
        },
      });
    },
  });

  const passwordFormik = useFormik<ChangePasswordFormData>({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: changePasswordSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: (values, helpers) => {
      changePassword.mutate(values, {
        onSuccess: () => {
          toast.success('Password changed successfully');
          helpers.resetForm();
        },
        onError: (err: any) => {
          toast.error(
            err?.response?.data?.message ?? 'Failed to change password. Check your current password.',
          );
        },
      });
    },
  });

  const changePassword = useMutation({
    mutationFn: authApi.changePassword,
  });

  if (isLoading) return <LoadingState />;

  return (
    <>
      <PageHeader
        title="Agent Profile"
        subtitle={[agent?.agentCode, agent?.branch].filter(Boolean).join(' - ')}
      />

      <Grid container spacing={3}>
        {/* Left column: agent detail card */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    fontSize: 32,
                    bgcolor: 'primary.main',
                    mb: 1,
                  }}
                >
                  {agent?.name?.[0]?.toUpperCase() ?? '?'}
                </Avatar>
                <Typography variant="h6" fontWeight={700} textAlign="center">
                  {agent?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  {agent?.email}
                </Typography>
                {agent?.club && (
                  <Typography
                    variant="caption"
                    color="secondary.main"
                    fontWeight={700}
                    textAlign="center"
                    mt={0.5}
                  >
                    {agent.club}
                  </Typography>
                )}
              </Box>
              <Divider sx={{ mb: 2 }} />
              {(
                [
                  ['Agent Code', agent?.agentCode],
                  ['Branch', agent?.branch],
                  ['Licence No.', agent?.licenceNo],
                  ['PAN', agent?.pan],
                  ['Mobile', agent?.mobile],
                  ['Agent Since', formatDate(agent?.agSince)],
                  ['Renewal Date', formatDate(agent?.renewalDate)],
                ] as [string, string | undefined][]
              ).map(([label, value]) => (
                <Box
                  key={label}
                  display="flex"
                  justifyContent="space-between"
                  py={0.75}
                  borderBottom="1px solid"
                  borderColor="divider"
                >
                  <Typography variant="body2" color="text.secondary">{label}</Typography>
                  <Typography variant="body2" fontWeight={500} textAlign="right" ml={2}>
                    {value || '—'}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Right column: edit + password */}
        <Grid item xs={12} md={7}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={600}>Edit Profile</Typography>
                <Button
                  size="medium"
                  variant={editMode ? 'outlined' : 'contained'}
                  sx={{ minHeight: 44 }}
                  onClick={() => {
                    if (editMode) profileFormik.resetForm();
                    setEditMode((v) => !v);
                  }}
                >
                  {editMode ? 'Cancel' : 'Edit'}
                </Button>
              </Box>
              {editMode ? (
                <Box
                  component="form"
                  onSubmit={profileFormik.handleSubmit}
                  display="flex"
                  flexDirection="column"
                  gap={2}
                >
                  <TextField
                    label="Name"
                    fullWidth
                    id="name"
                    name="name"
                    value={profileFormik.values.name}
                    onChange={profileFormik.handleChange}
                    onBlur={profileFormik.handleBlur}
                  />
                  <TextField
                    label="Mobile"
                    fullWidth
                    id="mobile"
                    name="mobile"
                    value={profileFormik.values.mobile}
                    onChange={profileFormik.handleChange}
                    onBlur={profileFormik.handleBlur}
                  />
                  <TextField
                    label="Slogan"
                    fullWidth
                    id="slogan"
                    name="slogan"
                    value={profileFormik.values.slogan}
                    onChange={profileFormik.handleChange}
                    onBlur={profileFormik.handleBlur}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    sx={{ minHeight: 44 }}
                    disabled={updateProfile.isPending}
                  >
                    {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Click Edit to update your name, mobile, or slogan.
                </Typography>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Change Password</Typography>
              <Box
                component="form"
                onSubmit={passwordFormik.handleSubmit}
                display="flex"
                flexDirection="column"
                gap={2}
              >
                <TextField
                  label="Current Password"
                  type="password"
                  fullWidth
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordFormik.values.currentPassword}
                  onChange={passwordFormik.handleChange}
                  onBlur={passwordFormik.handleBlur}
                  error={
                    passwordFormik.touched.currentPassword &&
                    Boolean(passwordFormik.errors.currentPassword)
                  }
                  helperText={
                    passwordFormik.touched.currentPassword &&
                    passwordFormik.errors.currentPassword
                  }
                />
                <TextField
                  label="New Password"
                  type="password"
                  fullWidth
                  id="newPassword"
                  name="newPassword"
                  value={passwordFormik.values.newPassword}
                  onChange={passwordFormik.handleChange}
                  onBlur={passwordFormik.handleBlur}
                  error={
                    passwordFormik.touched.newPassword &&
                    Boolean(passwordFormik.errors.newPassword)
                  }
                  helperText={
                    passwordFormik.touched.newPassword && passwordFormik.errors.newPassword
                  }
                />
                <TextField
                  label="Confirm New Password"
                  type="password"
                  fullWidth
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordFormik.values.confirmPassword}
                  onChange={passwordFormik.handleChange}
                  onBlur={passwordFormik.handleBlur}
                  error={
                    passwordFormik.touched.confirmPassword &&
                    Boolean(passwordFormik.errors.confirmPassword)
                  }
                  helperText={
                    passwordFormik.touched.confirmPassword &&
                    passwordFormik.errors.confirmPassword
                  }
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{ minHeight: 44 }}
                  disabled={changePassword.isPending}
                >
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
