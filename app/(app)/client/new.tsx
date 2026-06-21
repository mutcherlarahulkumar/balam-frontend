import React from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, HelperText, SegmentedButtons } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFormik } from 'formik';
import { useCreateClient } from '@/hooks/useClients';
import { useToast } from '@/hooks/useToast';
import { clientSchema, ClientFormValues } from '@/validations/client.validation';
import { Sex, ClientType } from '@/types/common.types';
import { SafeAreaView } from 'react-native-safe-area-context';

const INITIAL_VALUES: ClientFormValues = {
  familyCode: '',
  persCode: '',
  name: '',
  sex: undefined,
  dob: '',
  mobile: '',
  email: '',
  occupation: '',
  clientType: undefined,
  address: '',
};

const SEX_OPTIONS = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
  { value: 'O', label: 'Other' },
];

const TYPE_OPTIONS = [
  { value: 'C', label: 'Client' },
  { value: 'P', label: 'Proposer' },
  { value: 'N', label: 'Nominee' },
];

export default function NewClientScreen() {
  const router = useRouter();
  const toast = useToast();
  const createClient = useCreateClient();

  const { familyCode: prefillFamilyCode } = useLocalSearchParams<{ familyCode?: string }>();

  const formik = useFormik<ClientFormValues>({
    initialValues: {
      ...INITIAL_VALUES,
      familyCode: prefillFamilyCode ?? '',
    },
    validationSchema: clientSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values) => {
      try {
        const client = await createClient.mutateAsync({
          familyCode: values.familyCode,
          persCode: values.persCode,
          name: values.name,
          dob: values.dob || undefined,
          sex: values.sex as Sex | undefined,
          mobile: values.mobile || undefined,
          email: values.email || undefined,
          occupation: values.occupation || undefined,
          clientType: values.clientType as ClientType | undefined,
          address: values.address || undefined,
        });
        toast.success('Client added successfully');
        router.replace(`/(app)/client/${client.id}`);
      } catch {
        toast.error('Failed to add client');
      }
    },
  });

  return (
    <SafeAreaView style={styles.root} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionLabel}>IDENTITY</Text>

          {/* Family Code */}
          <TextInput
            label="Family Code *"
            mode="outlined"
            value={formik.values.familyCode}
            onChangeText={formik.handleChange('familyCode')}
            onBlur={formik.handleBlur('familyCode')}
            error={!!(formik.touched.familyCode && formik.errors.familyCode)}
            autoCapitalize="characters"
            style={styles.input}
          />
          <HelperText type="error" visible={!!(formik.touched.familyCode && formik.errors.familyCode)}>
            {formik.errors.familyCode}
          </HelperText>

          {/* Person Code */}
          <TextInput
            label="Person Code * (e.g. 01)"
            mode="outlined"
            value={formik.values.persCode}
            onChangeText={formik.handleChange('persCode')}
            onBlur={formik.handleBlur('persCode')}
            error={!!(formik.touched.persCode && formik.errors.persCode)}
            keyboardType="number-pad"
            maxLength={2}
            style={styles.input}
          />
          <HelperText type="error" visible={!!(formik.touched.persCode && formik.errors.persCode)}>
            {formik.errors.persCode}
          </HelperText>

          {/* Full Name */}
          <TextInput
            label="Full Name *"
            mode="outlined"
            value={formik.values.name}
            onChangeText={formik.handleChange('name')}
            onBlur={formik.handleBlur('name')}
            error={!!(formik.touched.name && formik.errors.name)}
            style={styles.input}
          />
          <HelperText type="error" visible={!!(formik.touched.name && formik.errors.name)}>
            {formik.errors.name}
          </HelperText>

          {/* Sex */}
          <Text style={styles.fieldLabel}>Sex</Text>
          <SegmentedButtons
            value={formik.values.sex ?? ''}
            onValueChange={(v) => formik.setFieldValue('sex', v || undefined)}
            style={styles.segmented}
            buttons={SEX_OPTIONS}
          />

          {/* Date of Birth */}
          <TextInput
            label="Date of Birth (YYYY-MM-DD)"
            mode="outlined"
            value={formik.values.dob}
            onChangeText={formik.handleChange('dob')}
            onBlur={formik.handleBlur('dob')}
            error={!!(formik.touched.dob && formik.errors.dob)}
            placeholder="1990-01-15"
            style={styles.input}
          />
          <HelperText type="error" visible={!!(formik.touched.dob && formik.errors.dob)}>
            {formik.errors.dob}
          </HelperText>

          <Text style={[styles.sectionLabel, { marginTop: 12 }]}>CONTACT</Text>

          {/* Mobile */}
          <TextInput
            label="Mobile"
            mode="outlined"
            value={formik.values.mobile}
            onChangeText={formik.handleChange('mobile')}
            onBlur={formik.handleBlur('mobile')}
            error={!!(formik.touched.mobile && formik.errors.mobile)}
            keyboardType="phone-pad"
            maxLength={10}
            style={styles.input}
          />
          <HelperText type="error" visible={!!(formik.touched.mobile && formik.errors.mobile)}>
            {formik.errors.mobile}
          </HelperText>

          {/* Email */}
          <TextInput
            label="Email"
            mode="outlined"
            value={formik.values.email}
            onChangeText={formik.handleChange('email')}
            onBlur={formik.handleBlur('email')}
            error={!!(formik.touched.email && formik.errors.email)}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          <HelperText type="error" visible={!!(formik.touched.email && formik.errors.email)}>
            {formik.errors.email}
          </HelperText>

          {/* Address */}
          <TextInput
            label="Address"
            mode="outlined"
            value={formik.values.address}
            onChangeText={formik.handleChange('address')}
            onBlur={formik.handleBlur('address')}
            error={!!(formik.touched.address && formik.errors.address)}
            multiline
            numberOfLines={2}
            style={styles.input}
          />
          <HelperText type="error" visible={!!(formik.touched.address && formik.errors.address)}>
            {formik.errors.address}
          </HelperText>

          <Text style={[styles.sectionLabel, { marginTop: 12 }]}>PROFESSIONAL</Text>

          {/* Occupation */}
          <TextInput
            label="Occupation"
            mode="outlined"
            value={formik.values.occupation}
            onChangeText={formik.handleChange('occupation')}
            onBlur={formik.handleBlur('occupation')}
            style={styles.input}
          />

          {/* Client Type */}
          <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Client Type</Text>
          <SegmentedButtons
            value={formik.values.clientType ?? ''}
            onValueChange={(v) => formik.setFieldValue('clientType', v || undefined)}
            style={styles.segmented}
            buttons={TYPE_OPTIONS}
          />

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={() => router.back()}
              style={styles.cancelBtn}
              contentStyle={styles.btnContent}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={() => formik.handleSubmit()}
              loading={formik.isSubmitting}
              disabled={formik.isSubmitting}
              style={styles.submitBtn}
              contentStyle={styles.btnContent}
              buttonColor="#1a3c5e"
            >
              Add Client
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f0f4f8' },
  kav: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  sectionLabel: {
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 12,
  },
  fieldLabel: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    marginTop: 4,
  },
  input: { backgroundColor: '#fff', marginTop: 4 },
  segmented: { marginBottom: 4 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelBtn: { flex: 1 },
  submitBtn: { flex: 2 },
  btnContent: { height: 52 },
});
