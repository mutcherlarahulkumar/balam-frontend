import React, { useState } from 'react';
import {
  View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Pressable,
} from 'react-native';
import { Text, TextInput, Button, HelperText, Surface } from 'react-native-paper';
import { useFormik } from 'formik';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/auth.api';
import { useAuth } from '@/context/AuthContext';
import { loginSchema, LoginFormValues } from '@/validations/auth.validation';

const ERR: Record<string, string> = {
  invalid_credentials: 'Email/agent code or password is incorrect.',
  account_locked: 'Too many failed attempts. Account locked for 15 minutes.',
  account_terminated: 'This agent account has been terminated.',
};

export default function LoginScreen() {
  const [showPwd, setShowPwd] = useState(false);
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
        onSuccess: async (data) => {
          await login(data.token, data.agent);
          router.replace('/(app)/(tabs)/dashboard');
        },
        onError: (err: any) => {
          const code = err?.response?.data?.error as string;
          setServerError(
            ERR[code] ?? err?.response?.data?.message ?? err?.message ?? 'Login failed.',
          );
        },
      });
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand */}
        <View style={styles.brand}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>B</Text>
          </View>
          <Text variant="headlineMedium" style={styles.appName}>Balam</Text>
          <Text variant="bodySmall" style={styles.tagline}>LIC Agent CRM</Text>
        </View>

        <Surface style={styles.card} elevation={2}>
          <Text variant="headlineSmall" style={styles.heading}>Welcome back</Text>
          <Text variant="bodyMedium" style={styles.subheading}>
            Sign in with your email or agent code
          </Text>

          {!!serverError && (
            <Surface style={styles.errorBox} elevation={0}>
              <Text style={styles.errorText}>{serverError}</Text>
            </Surface>
          )}

          <TextInput
            label="Email or Agent Code"
            mode="outlined"
            value={formik.values.identifier}
            onChangeText={formik.handleChange('identifier')}
            onBlur={formik.handleBlur('identifier')}
            error={formik.touched.identifier && !!formik.errors.identifier}
            autoCapitalize="none"
            autoComplete="username"
            left={<TextInput.Icon icon="account-outline" />}
            style={styles.input}
          />
          <HelperText type="error" visible={formik.touched.identifier && !!formik.errors.identifier}>
            {formik.errors.identifier}
          </HelperText>

          <TextInput
            label="Password"
            mode="outlined"
            value={formik.values.password}
            onChangeText={formik.handleChange('password')}
            onBlur={formik.handleBlur('password')}
            error={formik.touched.password && !!formik.errors.password}
            secureTextEntry={!showPwd}
            autoComplete="password"
            left={<TextInput.Icon icon="lock-outline" />}
            right={
              <TextInput.Icon
                icon={showPwd ? 'eye-off' : 'eye'}
                onPress={() => setShowPwd(p => !p)}
              />
            }
            style={styles.input}
          />
          <HelperText type="error" visible={formik.touched.password && !!formik.errors.password}>
            {formik.errors.password}
          </HelperText>

          <Button
            mode="contained"
            onPress={() => formik.handleSubmit()}
            loading={mutation.isPending}
            disabled={mutation.isPending}
            style={styles.btn}
            contentStyle={styles.btnContent}
            labelStyle={styles.btnLabel}
          >
            Sign In
          </Button>

          <View style={styles.footer}>
            <Text variant="bodyMedium" style={styles.footerText}>New agent? </Text>
            <Pressable onPress={() => router.push('/(auth)/register')}>
              <Text variant="bodyMedium" style={styles.link}>Create an account</Text>
            </Pressable>
          </View>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#0d2137' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20, paddingTop: 60 },
  brand: { alignItems: 'center', marginBottom: 32 },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#2d6a9f', justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  logoText: { fontSize: 36, fontWeight: '900', color: '#fff' },
  appName: { color: '#fff', fontWeight: '800' },
  tagline: { color: '#93c5fd', marginTop: 4 },
  card: { borderRadius: 20, padding: 24, backgroundColor: '#fff' },
  heading: { fontWeight: '800', color: '#0d2137', marginBottom: 4 },
  subheading: { color: '#64748b', marginBottom: 20 },
  errorBox: { backgroundColor: '#fee2e2', borderRadius: 10, padding: 12, marginBottom: 12 },
  errorText: { color: '#b91c1c', fontSize: 14 },
  input: { backgroundColor: '#fff' },
  btn: { marginTop: 8, borderRadius: 12 },
  btnContent: { height: 52 },
  btnLabel: { fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20, alignItems: 'center' },
  footerText: { color: '#64748b' },
  link: { color: '#1a3c5e', fontWeight: '700' },
});
