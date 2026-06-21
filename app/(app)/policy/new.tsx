import React from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  SegmentedButtons,
  HelperText,
  Chip,
} from 'react-native-paper';
import { useRouter, Stack } from 'expo-router';
import { useFormik } from 'formik';
import { useCreatePolicy } from '@/hooks/usePolicies';
import { useToast } from '@/hooks/useToast';
import { policySchema, PolicyFormValues } from '@/validations/policy.validation';
import SectionHeader from '@/components/common/SectionHeader';
import Screen from '@/components/common/Screen';

const PAYMENT_MODES = [
  { value: 'Y', label: 'Yearly' },
  { value: 'H', label: 'Half-yr' },
  { value: 'Q', label: 'Quarterly' },
  { value: 'M', label: 'Monthly' },
  { value: 'S', label: 'Single' },
];

const NEFT_OPTIONS = [
  { value: 'YES', label: 'Yes' },
  { value: 'NO', label: 'No' },
];

const RELATION_OPTIONS = [
  'Spouse', 'Son', 'Daughter', 'Father', 'Mother',
  'Brother', 'Sister', 'Grandfather', 'Grandmother', 'Other',
];

const initialValues: PolicyFormValues = {
  policyNo: '' as unknown as number,
  familyCode: '',
  persCode: '',
  planNo: '',
  issueDate: '',
  matDate: '',
  term: '' as unknown as number,
  ppt: '' as unknown as number,
  sumAssured: '' as unknown as number,
  premium: '' as unknown as number,
  paymentMode: 'Y',
  nextPremium: '',
  nominee: '',
  relation: '',
  branch: '',
  neft: 'NO',
  dab: undefined,
  termRider: undefined,
};

export default function NewPolicyScreen() {
  const router = useRouter();
  const toast = useToast();
  const createPolicy = useCreatePolicy();

  const formik = useFormik<PolicyFormValues>({
    initialValues,
    validationSchema: policySchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values) => {
      try {
        await createPolicy.mutateAsync({
          policyNo: Number(values.policyNo),
          familyCode: values.familyCode,
          persCode: values.persCode,
          planNo: values.planNo,
          issueDate: values.issueDate,
          matDate: values.matDate,
          term: Number(values.term),
          ppt: Number(values.ppt),
          sumAssured: Number(values.sumAssured),
          premium: Number(values.premium),
          paymentMode: values.paymentMode as 'Y' | 'H' | 'Q' | 'M' | 'S',
          nextPremium: values.nextPremium,
          nominee: values.nominee,
          relation: values.relation,
          branch: values.branch || undefined,
          neft: (values.neft as 'YES' | 'NO') || undefined,
          dab: values.dab != null ? Number(values.dab) : undefined,
          termRider: values.termRider != null ? Number(values.termRider) : undefined,
        });
        toast.success('Policy created successfully');
        router.back();
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : 'Failed to create policy. Please try again.';
        toast.error(msg);
      }
    },
  });

  const { values, errors, touched, handleBlur, handleSubmit, setFieldValue } = formik;

  function field(
    name: keyof PolicyFormValues,
    label: string,
    opts: {
      keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
      placeholder?: string;
      left?: React.ReactNode;
      right?: React.ReactNode;
    } = {},
  ) {
    const hasError = !!(touched[name] && errors[name]);
    return (
      <View style={styles.fieldWrap}>
        <TextInput
          label={label}
          mode="outlined"
          value={String(values[name] ?? '')}
          onChangeText={(v) => setFieldValue(name, v)}
          onBlur={handleBlur(name)}
          keyboardType={opts.keyboardType ?? 'default'}
          placeholder={opts.placeholder}
          error={hasError}
          left={opts.left}
          right={opts.right}
          style={styles.input}
          outlineColor="#e2e8f0"
          activeOutlineColor="#1a3c5e"
        />
        {hasError && (
          <HelperText type="error" visible>
            {errors[name] as string}
          </HelperText>
        )}
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'New Policy',
          headerShown: true,
          headerBackTitle: 'Back',
        }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Screen>
          {/* Policy Identity */}
          <SectionHeader title="Policy Identity" />
          <Card style={styles.card} mode="outlined">
            <Card.Content>
              {field('policyNo', 'Policy Number', {
                keyboardType: 'numeric',
                placeholder: '9-digit LIC policy number',
              })}
              {field('familyCode', 'Family Code', { placeholder: 'e.g. ABC01' })}
              {field('persCode', 'Person Code', {
                keyboardType: 'numeric',
                placeholder: '2-digit code',
              })}
              {field('planNo', 'Plan Number', { placeholder: 'e.g. 914' })}
            </Card.Content>
          </Card>

          {/* Dates & Term */}
          <SectionHeader title="Dates & Term" />
          <Card style={styles.card} mode="outlined">
            <Card.Content>
              {field('issueDate', 'Issue Date', {
                keyboardType: 'numeric',
                placeholder: 'YYYY-MM-DD',
              })}
              {field('matDate', 'Maturity Date', {
                keyboardType: 'numeric',
                placeholder: 'YYYY-MM-DD',
              })}
              {field('nextPremium', 'Next Premium Date', {
                keyboardType: 'numeric',
                placeholder: 'YYYY-MM-DD',
              })}
              {field('term', 'Policy Term (years)', {
                keyboardType: 'numeric',
                placeholder: '5 – 40',
              })}
              {field('ppt', 'Premium Paying Term (years)', {
                keyboardType: 'numeric',
                placeholder: '1 – 40',
              })}
            </Card.Content>
          </Card>

          {/* Financial */}
          <SectionHeader title="Financial" />
          <Card style={styles.card} mode="outlined">
            <Card.Content>
              {field('sumAssured', 'Sum Assured', {
                keyboardType: 'numeric',
                placeholder: 'e.g. 500000',
                left: <TextInput.Affix text="₹" />,
              })}
              {field('premium', 'Annual Premium', {
                keyboardType: 'numeric',
                placeholder: 'e.g. 25000',
                left: <TextInput.Affix text="₹" />,
              })}

              <Text variant="labelMedium" style={styles.modeLabel}>Payment Mode</Text>
              <View style={styles.modeRow}>
                {PAYMENT_MODES.map((m) => (
                  <Chip
                    key={m.value}
                    selected={values.paymentMode === m.value}
                    onPress={() => setFieldValue('paymentMode', m.value)}
                    style={[
                      styles.modeChip,
                      values.paymentMode === m.value && styles.modeChipSelected,
                    ]}
                    textStyle={[
                      styles.modeChipText,
                      values.paymentMode === m.value && styles.modeChipTextSelected,
                    ]}
                    compact
                  >
                    {m.label}
                  </Chip>
                ))}
              </View>
              {touched.paymentMode && errors.paymentMode && (
                <HelperText type="error" visible>
                  {errors.paymentMode}
                </HelperText>
              )}
            </Card.Content>
          </Card>

          {/* Nominee & Other */}
          <SectionHeader title="Nominee & Other" />
          <Card style={styles.card} mode="outlined">
            <Card.Content>
              {field('nominee', 'Nominee Name', { placeholder: 'Full name of nominee' })}

              {/* Relation picker */}
              <Text variant="labelMedium" style={styles.modeLabel}>Relation</Text>
              <View style={styles.relationGrid}>
                {RELATION_OPTIONS.map((rel) => (
                  <Chip
                    key={rel}
                    selected={values.relation === rel}
                    onPress={() => setFieldValue('relation', rel)}
                    style={[
                      styles.relationChip,
                      values.relation === rel && styles.modeChipSelected,
                    ]}
                    textStyle={[
                      styles.modeChipText,
                      values.relation === rel && styles.modeChipTextSelected,
                    ]}
                    compact
                  >
                    {rel}
                  </Chip>
                ))}
              </View>
              {touched.relation && errors.relation && (
                <HelperText type="error" visible>
                  {errors.relation}
                </HelperText>
              )}

              {field('branch', 'Branch', { placeholder: 'Branch name (optional)' })}

              {/* NEFT */}
              <Text variant="labelMedium" style={styles.modeLabel}>NEFT Registered</Text>
              <SegmentedButtons
                value={values.neft ?? 'NO'}
                onValueChange={(v) => setFieldValue('neft', v)}
                style={styles.segmentSmall}
                buttons={NEFT_OPTIONS}
              />

              {field('dab', 'DAB (optional)', {
                keyboardType: 'numeric',
                placeholder: 'Disability benefit amount',
                left: <TextInput.Affix text="₹" />,
              })}
              {field('termRider', 'Term Rider (optional)', {
                keyboardType: 'numeric',
                placeholder: 'Term rider amount',
                left: <TextInput.Affix text="₹" />,
              })}
            </Card.Content>
          </Card>

          {/* Submit */}
          <Button
            mode="contained"
            onPress={() => handleSubmit()}
            loading={formik.isSubmitting}
            disabled={formik.isSubmitting}
            style={styles.submitBtn}
            contentStyle={styles.submitBtnContent}
            buttonColor="#1a3c5e"
          >
            Save Policy
          </Button>

          <View style={{ height: 40 }} />
        </Screen>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 16 },
  fieldWrap: { marginBottom: 4 },
  input: { backgroundColor: '#fff', marginBottom: 2 },
  modeLabel: { color: '#64748b', marginTop: 8, marginBottom: 8 },
  modeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  modeChip: { backgroundColor: '#f1f5f9' },
  modeChipSelected: { backgroundColor: '#dbeafe' },
  modeChipText: { color: '#475569', fontSize: 12 },
  modeChipTextSelected: { color: '#1a3c5e', fontWeight: '700' },
  relationGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  relationChip: { backgroundColor: '#f1f5f9' },
  segmentSmall: { marginBottom: 12 },
  submitBtn: { marginTop: 8, borderRadius: 10 },
  submitBtnContent: { paddingVertical: 6 },
});
