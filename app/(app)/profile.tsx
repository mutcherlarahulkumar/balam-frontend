import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import {
  Text,
  Card,
  Button,
  TextInput,
  Dialog,
  Portal,
  Divider,
  List,
  Avatar,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useFormik } from 'formik';
import * as yup from 'yup';
import Screen from '@/components/common/Screen';
import LoadingState from '@/components/common/LoadingState';
import { useAgentProfile, useUpdateAgentProfile } from '@/hooks/useAgent';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/useToast';
import { authApi } from '@/api/auth.api';
import { UpdateProfileRequest } from '@/types/agent.types';

// Validation schemas
const profileSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  mobile: yup
    .string()
    .required('Mobile is required')
    .matches(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  email: yup
    .string()
    .required('Email is required')
    .email('Enter a valid email address'),
});

const passwordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup
    .string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters'),
  confirmPassword: yup
    .string()
    .required('Please confirm your new password')
    .oneOf([yup.ref('newPassword')], 'Passwords do not match'),
});

type ProfileFormValues = {
  name: string;
  mobile: string;
  email: string;
};

type PasswordFormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ProfileScreen() {
  const router = useRouter();
  const toast = useToast();
  const { agent: authAgent, logout } = useAuth();

  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [passwordDialogVisible, setPasswordDialogVisible] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const { data: profile, isLoading } = useAgentProfile();
  const updateProfile = useUpdateAgentProfile();

  const displayAgent = profile ?? authAgent;

  const profileFormik = useFormik<ProfileFormValues>({
    initialValues: {
      name: displayAgent?.name ?? '',
      mobile: displayAgent?.mobile ?? '',
      email: displayAgent?.email ?? '',
    },
    validationSchema: profileSchema,
    validateOnBlur: true,
    validateOnChange: false,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const update: UpdateProfileRequest = {};
        if (values.name !== displayAgent?.name) update.name = values.name;
        if (values.mobile !== displayAgent?.mobile) update.mobile = values.mobile;
        if (values.email !== displayAgent?.email) update.email = values.email;

        if (Object.keys(update).length === 0) {
          toast.info('No changes to save');
          setEditDialogVisible(false);
          return;
        }

        await updateProfile.mutateAsync(update);
        toast.success('Profile updated successfully');
        setEditDialogVisible(false);
      } catch {
        toast.error('Failed to update profile');
      }
    },
  });

  const passwordFormik = useFormik<PasswordFormValues>({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: passwordSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, helpers) => {
      try {
        await authApi.changePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });
        toast.success('Password changed successfully');
        setPasswordDialogVisible(false);
        helpers.resetForm();
      } catch {
        toast.error('Failed to change password. Check your current password.');
      }
    },
  });

  function openEditDialog() {
    profileFormik.resetForm({
      values: {
        name: displayAgent?.name ?? '',
        mobile: displayAgent?.mobile ?? '',
        email: displayAgent?.email ?? '',
      },
    });
    setEditDialogVisible(true);
  }

  function openPasswordDialog() {
    passwordFormik.resetForm();
    setShowCurrentPw(false);
    setShowNewPw(false);
    setShowConfirmPw(false);
    setPasswordDialogVisible(true);
  }

  async function handleLogout() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  }

  if (isLoading && !authAgent) return <LoadingState />;

  const initials = displayAgent?.name
    ? displayAgent.name
        .split(' ')
        .slice(0, 2)
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
    : '?';

  return (
    <>
      <Screen>
        <Text variant="headlineSmall" style={styles.heading}>Profile</Text>

        {/* Agent Info Card */}
        <Card style={styles.card} mode="outlined">
          <Card.Content>
            <View style={styles.avatarRow}>
              <Avatar.Text
                size={64}
                label={initials}
                style={styles.avatar}
                labelStyle={styles.avatarLabel}
              />
              <View style={styles.agentInfo}>
                <Text variant="titleLarge" style={styles.agentName}>
                  {displayAgent?.name ?? '—'}
                </Text>
                <Text variant="bodyMedium" style={styles.agentCode}>
                  {displayAgent?.agentCode}
                  {displayAgent?.club ? ` · ${displayAgent.club}` : ''}
                </Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <List.Item
              title="Branch"
              description={displayAgent?.branch ?? '—'}
              left={() => <List.Icon icon="office-building-outline" color="#64748b" />}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDesc}
            />
            <List.Item
              title="Mobile"
              description={displayAgent?.mobile ?? '—'}
              left={() => <List.Icon icon="phone-outline" color="#64748b" />}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDesc}
            />
            <List.Item
              title="Email"
              description={displayAgent?.email ?? '—'}
              left={() => <List.Icon icon="email-outline" color="#64748b" />}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDesc}
            />
            <List.Item
              title="Licence No"
              description={displayAgent?.licenceNo ?? '—'}
              left={() => <List.Icon icon="card-account-details-outline" color="#64748b" />}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDesc}
            />
          </Card.Content>
        </Card>

        {/* Actions */}
        <Card style={styles.card} mode="outlined">
          <Card.Content>
            <Button
              mode="contained"
              icon="account-edit-outline"
              onPress={openEditDialog}
              style={styles.actionButton}
              contentStyle={styles.actionButtonContent}
            >
              Edit Profile
            </Button>
            <Button
              mode="outlined"
              icon="lock-reset"
              onPress={openPasswordDialog}
              style={styles.actionButtonSecondary}
              contentStyle={styles.actionButtonContent}
            >
              Change Password
            </Button>
          </Card.Content>
        </Card>

        {/* Sign Out */}
        <Button
          mode="outlined"
          icon="logout"
          onPress={handleLogout}
          style={styles.signOutButton}
          textColor="#dc2626"
          contentStyle={styles.actionButtonContent}
        >
          Sign Out
        </Button>
      </Screen>

      <Portal>
        {/* Edit Profile Dialog */}
        <Dialog visible={editDialogVisible} onDismiss={() => setEditDialogVisible(false)}>
          <Dialog.Title>Edit Profile</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Name *"
              mode="outlined"
              value={profileFormik.values.name}
              onChangeText={(v) => profileFormik.setFieldValue('name', v)}
              onBlur={() => profileFormik.setFieldTouched('name')}
              error={profileFormik.touched.name && !!profileFormik.errors.name}
              style={styles.input}
            />
            {profileFormik.touched.name && profileFormik.errors.name && (
              <Text style={styles.errorText}>{profileFormik.errors.name}</Text>
            )}

            <TextInput
              label="Mobile *"
              mode="outlined"
              keyboardType="phone-pad"
              value={profileFormik.values.mobile}
              onChangeText={(v) => profileFormik.setFieldValue('mobile', v)}
              onBlur={() => profileFormik.setFieldTouched('mobile')}
              error={profileFormik.touched.mobile && !!profileFormik.errors.mobile}
              style={styles.input}
            />
            {profileFormik.touched.mobile && profileFormik.errors.mobile && (
              <Text style={styles.errorText}>{profileFormik.errors.mobile}</Text>
            )}

            <TextInput
              label="Email *"
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              value={profileFormik.values.email}
              onChangeText={(v) => profileFormik.setFieldValue('email', v)}
              onBlur={() => profileFormik.setFieldTouched('email')}
              error={profileFormik.touched.email && !!profileFormik.errors.email}
              style={styles.input}
            />
            {profileFormik.touched.email && profileFormik.errors.email && (
              <Text style={styles.errorText}>{profileFormik.errors.email}</Text>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditDialogVisible(false)}>Cancel</Button>
            <Button
              mode="contained"
              onPress={() => profileFormik.handleSubmit()}
              loading={updateProfile.isPending}
              disabled={updateProfile.isPending}
            >
              Save Changes
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Change Password Dialog */}
        <Dialog visible={passwordDialogVisible} onDismiss={() => setPasswordDialogVisible(false)}>
          <Dialog.Title>Change Password</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Current Password *"
              mode="outlined"
              secureTextEntry={!showCurrentPw}
              value={passwordFormik.values.currentPassword}
              onChangeText={(v) => passwordFormik.setFieldValue('currentPassword', v)}
              onBlur={() => passwordFormik.setFieldTouched('currentPassword')}
              error={passwordFormik.touched.currentPassword && !!passwordFormik.errors.currentPassword}
              right={
                <TextInput.Icon
                  icon={showCurrentPw ? 'eye-off-outline' : 'eye-outline'}
                  onPress={() => setShowCurrentPw((p) => !p)}
                />
              }
              style={styles.input}
            />
            {passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword && (
              <Text style={styles.errorText}>{passwordFormik.errors.currentPassword}</Text>
            )}

            <TextInput
              label="New Password *"
              mode="outlined"
              secureTextEntry={!showNewPw}
              value={passwordFormik.values.newPassword}
              onChangeText={(v) => passwordFormik.setFieldValue('newPassword', v)}
              onBlur={() => passwordFormik.setFieldTouched('newPassword')}
              error={passwordFormik.touched.newPassword && !!passwordFormik.errors.newPassword}
              right={
                <TextInput.Icon
                  icon={showNewPw ? 'eye-off-outline' : 'eye-outline'}
                  onPress={() => setShowNewPw((p) => !p)}
                />
              }
              style={styles.input}
            />
            {passwordFormik.touched.newPassword && passwordFormik.errors.newPassword && (
              <Text style={styles.errorText}>{passwordFormik.errors.newPassword}</Text>
            )}

            <TextInput
              label="Confirm New Password *"
              mode="outlined"
              secureTextEntry={!showConfirmPw}
              value={passwordFormik.values.confirmPassword}
              onChangeText={(v) => passwordFormik.setFieldValue('confirmPassword', v)}
              onBlur={() => passwordFormik.setFieldTouched('confirmPassword')}
              error={passwordFormik.touched.confirmPassword && !!passwordFormik.errors.confirmPassword}
              right={
                <TextInput.Icon
                  icon={showConfirmPw ? 'eye-off-outline' : 'eye-outline'}
                  onPress={() => setShowConfirmPw((p) => !p)}
                />
              }
              style={styles.input}
            />
            {passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword && (
              <Text style={styles.errorText}>{passwordFormik.errors.confirmPassword}</Text>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPasswordDialogVisible(false)}>Cancel</Button>
            <Button
              mode="contained"
              onPress={() => passwordFormik.handleSubmit()}
              loading={passwordFormik.isSubmitting}
              disabled={passwordFormik.isSubmitting}
            >
              Change Password
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  heading: { fontWeight: '800', color: '#0d2137', marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 12 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', paddingBottom: 4 },
  avatar: { backgroundColor: '#1a3c5e' },
  avatarLabel: { fontSize: 24, fontWeight: '700' },
  agentInfo: { marginLeft: 16, flex: 1 },
  agentName: { fontWeight: '800', color: '#0d2137' },
  agentCode: { color: '#64748b', marginTop: 2 },
  divider: { marginVertical: 12 },
  listTitle: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  listDesc: { fontSize: 14, color: '#1e293b', fontWeight: '600' },
  actionButton: { backgroundColor: '#1a3c5e', marginBottom: 10 },
  actionButtonSecondary: { borderColor: '#1a3c5e' },
  actionButtonContent: { paddingVertical: 4 },
  signOutButton: {
    borderColor: '#dc2626',
    marginTop: 8,
    marginBottom: 8,
  },
  input: { marginBottom: 8 },
  errorText: { color: '#dc2626', fontSize: 12, marginBottom: 4, marginTop: -4 },
});
