import React from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useFormik } from 'formik';
import { useCreateFamily } from '@/hooks/useFamilies';
import { useToast } from '@/hooks/useToast';
import { familySchema, FamilyFormValues } from '@/validations/family.validation';
import { SafeAreaView } from 'react-native-safe-area-context';

const INITIAL_VALUES: FamilyFormValues = {
  familyCode: '',
  headName: '',
  address: '',
  mobile: '',
  email: '',
  pincode: '',
  religion: '',
  designation: '',
};

export default function NewFamilyScreen() {
  const router = useRouter();
  const toast = useToast();
  const createFamily = useCreateFamily();

  const formik = useFormik<FamilyFormValues>({
    initialValues: INITIAL_VALUES,
    validationSchema: familySchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values) => {
      try {
        const payload = {
          ...values,
          familyCode: values.familyCode || undefined,
        };
        const family = await createFamily.mutateAsync(payload);
        toast.success('Family created successfully');
        router.replace(`/(app)/family/${family.familyCode}`);
      } catch {
        toast.error('Failed to create family');
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
          <Text variant="labelLarge" style={styles.sectionLabel}>FAMILY DETAILS</Text>

          {/* Family Code */}
          <TextInput
            label="Family Code (optional)"
            mode="outlined"
            value={formik.values.familyCode}
            onChangeText={formik.handleChange('familyCode')}
            onBlur={formik.handleBlur('familyCode')}
            error={!!(formik.touched.familyCode && formik.errors.familyCode)}
            autoCapitalize="characters"
            style={styles.input}
          />
          <HelperText
            type={formik.touched.familyCode && formik.errors.familyCode ? 'error' : 'info'}
          >
            {formik.touched.familyCode && formik.errors.familyCode
              ? formik.errors.familyCode
              : 'Leave blank to auto-generate'}
          </HelperText>

          {/* Head Name */}
          <TextInput
            label="Head Name *"
            mode="outlined"
            value={formik.values.headName}
            onChangeText={formik.handleChange('headName')}
            onBlur={formik.handleBlur('headName')}
            error={!!(formik.touched.headName && formik.errors.headName)}
            style={styles.input}
          />
          <HelperText type="error" visible={!!(formik.touched.headName && formik.errors.headName)}>
            {formik.errors.headName}
          </HelperText>

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
            numberOfLines={3}
            style={styles.input}
          />
          <HelperText type="error" visible={!!(formik.touched.address && formik.errors.address)}>
            {formik.errors.address}
          </HelperText>

          {/* Pincode */}
          <TextInput
            label="Pincode"
            mode="outlined"
            value={formik.values.pincode}
            onChangeText={formik.handleChange('pincode')}
            onBlur={formik.handleBlur('pincode')}
            error={!!(formik.touched.pincode && formik.errors.pincode)}
            keyboardType="number-pad"
            maxLength={6}
            style={styles.input}
          />
          <HelperText type="error" visible={!!(formik.touched.pincode && formik.errors.pincode)}>
            {formik.errors.pincode}
          </HelperText>

          {/* Religion */}
          <TextInput
            label="Religion"
            mode="outlined"
            value={formik.values.religion}
            onChangeText={formik.handleChange('religion')}
            onBlur={formik.handleBlur('religion')}
            style={styles.input}
          />

          {/* Designation */}
          <TextInput
            label="Designation"
            mode="outlined"
            value={formik.values.designation}
            onChangeText={formik.handleChange('designation')}
            onBlur={formik.handleBlur('designation')}
            style={styles.input}
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
              Create Family
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
  input: { backgroundColor: '#fff', marginTop: 4 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelBtn: { flex: 1 },
  submitBtn: { flex: 2 },
  btnContent: { height: 52 },
});
