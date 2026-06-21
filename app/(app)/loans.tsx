import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Text,
  Card,
  FAB,
  Dialog,
  Portal,
  Button,
  TextInput,
  Divider,
} from 'react-native-paper';
import { useFormik } from 'formik';
import Screen from '@/components/common/Screen';
import LoadingState from '@/components/common/LoadingState';
import { useLoans, useCreateLoan } from '@/hooks/useLoans';
import { useToast } from '@/hooks/useToast';
import { loanSchema, LoanFormValues } from '@/validations/loan.validation';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { Loan } from '@/types/loan.types';

const INITIAL_VALUES: LoanFormValues = {
  policyNo: undefined as unknown as number,
  loanDate: '',
  loanAmount: undefined as unknown as number,
  interestDueDate: '',
  loanInterest: undefined,
};

export default function LoansScreen() {
  const toast = useToast();
  const [dialogVisible, setDialogVisible] = useState(false);

  const { data: loans, isLoading } = useLoans();
  const createLoan = useCreateLoan();

  const formik = useFormik<LoanFormValues>({
    initialValues: INITIAL_VALUES,
    validationSchema: loanSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, helpers) => {
      try {
        await createLoan.mutateAsync({
          policyNo: values.policyNo,
          loanDate: values.loanDate,
          loanAmount: values.loanAmount,
          interestDueDate: values.interestDueDate,
          loanInterest: values.loanInterest,
        });
        toast.success('Loan added successfully');
        setDialogVisible(false);
        helpers.resetForm();
      } catch {
        toast.error('Failed to add loan');
      }
    },
  });

  function openDialog() {
    formik.resetForm();
    setDialogVisible(true);
  }

  function closeDialog() {
    setDialogVisible(false);
    formik.resetForm();
  }

  if (isLoading) return <LoadingState />;

  return (
    <>
      <Screen>
        <Text variant="headlineSmall" style={styles.heading}>Loans</Text>

        {!loans?.length ? (
          <Text style={styles.empty}>No loan records found.</Text>
        ) : (
          loans.map((loan: Loan) => (
            <Card key={loan.id} style={styles.card} mode="outlined">
              <Card.Content>
                <View style={styles.row}>
                  <Text variant="titleMedium" style={styles.policyNo}>
                    Policy #{loan.policyNo}
                  </Text>
                  <Text variant="titleMedium" style={styles.amount}>
                    {formatCurrency(loan.loanAmount)}
                  </Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.row}>
                  <View>
                    <Text variant="labelSmall" style={styles.label}>Loan Date</Text>
                    <Text variant="bodyMedium">{formatDate(loan.loanDate)}</Text>
                  </View>
                  <View style={styles.alignEnd}>
                    <Text variant="labelSmall" style={styles.label}>Interest Due</Text>
                    <Text variant="bodyMedium">{formatDate(loan.interestDueDate)}</Text>
                  </View>
                </View>
                {loan.loanInterest != null && loan.loanInterest > 0 && (
                  <Text variant="bodySmall" style={styles.interestText}>
                    Interest: {formatCurrency(loan.loanInterest)}
                  </Text>
                )}
              </Card.Content>
            </Card>
          ))
        )}
      </Screen>

      <FAB icon="plus" style={styles.fab} onPress={openDialog} />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={closeDialog}>
          <Dialog.Title>Add Loan</Dialog.Title>
          <Dialog.ScrollArea style={styles.scrollArea}>
            <TextInput
              label="Policy Number *"
              mode="outlined"
              keyboardType="numeric"
              value={formik.values.policyNo ? String(formik.values.policyNo) : ''}
              onChangeText={(v) => formik.setFieldValue('policyNo', v ? Number(v) : undefined)}
              onBlur={() => formik.setFieldTouched('policyNo')}
              error={formik.touched.policyNo && !!formik.errors.policyNo}
              style={styles.input}
            />
            {formik.touched.policyNo && formik.errors.policyNo && (
              <Text style={styles.errorText}>{formik.errors.policyNo}</Text>
            )}

            <TextInput
              label="Loan Date *"
              mode="outlined"
              placeholder="YYYY-MM-DD"
              keyboardType="numeric"
              value={formik.values.loanDate}
              onChangeText={(v) => formik.setFieldValue('loanDate', v)}
              onBlur={() => formik.setFieldTouched('loanDate')}
              error={formik.touched.loanDate && !!formik.errors.loanDate}
              style={styles.input}
            />
            {formik.touched.loanDate && formik.errors.loanDate && (
              <Text style={styles.errorText}>{formik.errors.loanDate}</Text>
            )}

            <TextInput
              label="Loan Amount (₹) *"
              mode="outlined"
              keyboardType="numeric"
              value={formik.values.loanAmount ? String(formik.values.loanAmount) : ''}
              onChangeText={(v) => formik.setFieldValue('loanAmount', v ? Number(v) : undefined)}
              onBlur={() => formik.setFieldTouched('loanAmount')}
              error={formik.touched.loanAmount && !!formik.errors.loanAmount}
              style={styles.input}
            />
            {formik.touched.loanAmount && formik.errors.loanAmount && (
              <Text style={styles.errorText}>{formik.errors.loanAmount}</Text>
            )}

            <TextInput
              label="Interest Due Date *"
              mode="outlined"
              placeholder="YYYY-MM-DD"
              keyboardType="numeric"
              value={formik.values.interestDueDate}
              onChangeText={(v) => formik.setFieldValue('interestDueDate', v)}
              onBlur={() => formik.setFieldTouched('interestDueDate')}
              error={formik.touched.interestDueDate && !!formik.errors.interestDueDate}
              style={styles.input}
            />
            {formik.touched.interestDueDate && formik.errors.interestDueDate && (
              <Text style={styles.errorText}>{formik.errors.interestDueDate}</Text>
            )}

            <TextInput
              label="Loan Interest (₹) (optional)"
              mode="outlined"
              keyboardType="numeric"
              value={formik.values.loanInterest != null ? String(formik.values.loanInterest) : ''}
              onChangeText={(v) => formik.setFieldValue('loanInterest', v ? Number(v) : undefined)}
              onBlur={() => formik.setFieldTouched('loanInterest')}
              error={formik.touched.loanInterest && !!formik.errors.loanInterest}
              style={styles.input}
            />
            {formik.touched.loanInterest && formik.errors.loanInterest && (
              <Text style={styles.errorText}>{formik.errors.loanInterest}</Text>
            )}
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={closeDialog}>Cancel</Button>
            <Button
              mode="contained"
              onPress={() => formik.handleSubmit()}
              loading={createLoan.isPending}
              disabled={createLoan.isPending}
            >
              Add Loan
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  heading: { fontWeight: '800', color: '#0d2137', marginBottom: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  policyNo: { fontWeight: '700', color: '#1a3c5e' },
  amount: { fontWeight: '700', color: '#15803d' },
  label: { color: '#64748b', marginBottom: 2 },
  alignEnd: { alignItems: 'flex-end' },
  divider: { marginVertical: 10 },
  interestText: { color: '#64748b', marginTop: 8 },
  empty: { color: '#64748b', textAlign: 'center', marginTop: 40 },
  fab: { position: 'absolute', right: 16, bottom: 16, backgroundColor: '#1a3c5e' },
  scrollArea: { paddingHorizontal: 0, maxHeight: 420 },
  input: { marginBottom: 8 },
  errorText: { color: '#dc2626', fontSize: 12, marginBottom: 4, marginTop: -4 },
});
