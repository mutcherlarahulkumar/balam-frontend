import React, { useState } from 'react';
import {
  View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Pressable,
} from 'react-native';
import { Text, TextInput, Button, HelperText, Surface } from 'react-native-paper';
import { useFormik } from 'formik';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/auth.api';
import { registerSchema, RegisterFormValues } from '@/validations/auth.validation';
import { useToast } from '@/hooks/useToast';

const FIELD_MAP: Record<string, keyof RegisterFormValues> = {
  name: 'name', email: 'email', agentCode: 'agentCode',
  password: 'password', branch: 'branch', mobile: 'mobile', licenceNo: 'licenceNo',
};

const ERR: Record<string, string> = {
  email_taken: 'An account with this email already exists.',
  agent_code_taken: 'This agent code is already registered.',
};

export default function RegisterScreen() {
  const [showPwd, setShowPwd] = useState(false);
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
          router.replace('/(auth)/login');
        },
        onError: (err: any) => {
          const code = err?.response?.data?.error as string;
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
          setServerError(ERR[code] ?? err?.response?.data?.message ?? 'Registration failed.');
        },
      });
    },
  });

  const fi = (name: keyof RegisterFormValues) => ({
    value: formik.values[name],
    onChangeText: formik.handleChange(name),
    onBlur: formik.handleBlur(name),
    error: formik.touched[name] && !!formik.errors[name],
  });

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brand}>
          <View style={styles.logoCircle}><Text style={styles.logoText}>B</Text></View>
          <Text variant="headlineMedium" style={styles.appName}>Balam</Text>
          <Text variant="bodySmall" style={styles.tagline}>LIC Agent CRM</Text>
        </View>

        <Surface style={styles.card} elevation={2}>
          <Text variant="headlineSmall" style={styles.heading}>Create account</Text>
          <Text variant="bodyMedium" style={styles.subheading}>Register your LIC agent profile</Text>

          {!!serverError && (
            <Surface style={styles.errorBox} elevation={0}>
              <Text style={styles.errorText}>{serverError}</Text>
            </Surface>
          )}

          <TextInput label="Full Name *" mode="outlined" {...fi('name')} autoCapitalize="words" style={styles.input} />
          <HelperText type="error" visible={formik.touched.name && !!formik.errors.name}>{formik.errors.name}</HelperText>

          <TextInput label="Email *" mode="outlined" {...fi('email')} keyboardType="email-address" autoCapitalize="none" style={styles.input} />
          <HelperText type="error" visible={formik.touched.email && !!formik.errors.email}>{formik.errors.email}</HelperText>

          <TextInput label="Agent Code *" mode="outlined" {...fi('agentCode')} autoCapitalize="characters" placeholder="e.g. 0045269T" style={styles.input} />
          <HelperText type="error" visible={formik.touched.agentCode && !!formik.errors.agentCode}>{formik.errors.agentCode}</HelperText>

          <TextInput label="Licence No. *" mode="outlined" {...fi('licenceNo')} style={styles.input} />
          <HelperText type="error" visible={formik.touched.licenceNo && !!formik.errors.licenceNo}>{formik.errors.licenceNo}</HelperText>

          <TextInput label="Branch *" mode="outlined" {...fi('branch')} placeholder="e.g. VZM001" style={styles.input} />
          <HelperText type="error" visible={formik.touched.branch && !!formik.errors.branch}>{formik.errors.branch}</HelperText>

          <TextInput label="Mobile *" mode="outlined" {...fi('mobile')} keyboardType="phone-pad" style={styles.input} />
          <HelperText type="error" visible={formik.touched.mobile && !!formik.errors.mobile}>{formik.errors.mobile}</HelperText>

          <TextInput
            label="Password *"
            mode="outlined"
            {...fi('password')}
            secureTextEntry={!showPwd}
            right={<TextInput.Icon icon={showPwd ? 'eye-off' : 'eye'} onPress={() => setShowPwd(p => !p)} />}
            style={styles.input}
          />
          <HelperText type="error" visible={formik.touched.password && !!formik.errors.password}>
            {formik.errors.password || 'Minimum 8 characters'}
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
            Create Account
          </Button>

          <View style={styles.footer}>
            <Text variant="bodyMedium" style={styles.footerText}>Already have an account? </Text>
            <Pressable onPress={() => router.back()}>
              <Text variant="bodyMedium" style={styles.link}>Sign In</Text>
            </Pressable>
          </View>
        </Surface>
        <View style={{ height: 32 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#0d2137' },
  scroll: { flexGrow: 1, padding: 20, paddingTop: 48 },
  brand: { alignItems: 'center', marginBottom: 24 },
  logoCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#2d6a9f', justifyContent: 'center', alignItems: 'center', marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  logoText: { fontSize: 30, fontWeight: '900', color: '#fff' },
  appName: { color: '#fff', fontWeight: '800' },
  tagline: { color: '#93c5fd', marginTop: 2 },
  card: { borderRadius: 20, padding: 24, backgroundColor: '#fff' },
  heading: { fontWeight: '800', color: '#0d2137', marginBottom: 4 },
  subheading: { color: '#64748b', marginBottom: 16 },
  errorBox: { backgroundColor: '#fee2e2', borderRadius: 10, padding: 12, marginBottom: 12 },
  errorText: { color: '#b91c1c', fontSize: 14 },
  input: { backgroundColor: '#fff', marginBottom: -4 },
  btn: { marginTop: 12, borderRadius: 12 },
  btnContent: { height: 52 },
  btnLabel: { fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20, alignItems: 'center' },
  footerText: { color: '#64748b' },
  link: { color: '#1a3c5e', fontWeight: '700' },
});
