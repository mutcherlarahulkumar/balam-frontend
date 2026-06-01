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
  Chip,
  SegmentedButtons,
  Divider,
} from 'react-native-paper';
import { useFormik } from 'formik';
import Screen from '@/components/common/Screen';
import LoadingState from '@/components/common/LoadingState';
import { useSBList, useCreateSB, useMarkSBPaid } from '@/hooks/useSB';
import { useToast } from '@/hooks/useToast';
import { sbSchema, SBFormValues, sbMarkPaidSchema, SBMarkPaidFormValues } from '@/validations/sb.validation';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { SB } from '@/types/sb.types';

type FilterValue = 'all' | 'paid' | 'unpaid';

const ADD_INITIAL: SBFormValues = {
  policyNo: undefined as unknown as number,
  sbDueDate: '',
  sbAmount: undefined as unknown as number,
  instalmentNo: undefined as unknown as number,
};

const PAID_INITIAL: SBMarkPaidFormValues = {
  paidDate: '',
  chequeNo: undefined,
};

export default function SBScreen() {
  const toast = useToast();
  const [filter, setFilter] = useState<FilterValue>('all');
  const [addDialogVisible, setAddDialogVisible] = useState(false);
  const [paidDialogRecord, setPaidDialogRecord] = useState<SB | null>(null);

  const { data: sbRecords, isLoading } = useSBList({});
  const createSB = useCreateSB();
  const markPaid = useMarkSBPaid();

  const filteredRecords = (sbRecords ?? []).filter((r: SB) => {
    if (filter === 'paid') return !!r.sbPayDate;
    if (filter === 'unpaid') return !r.sbPayDate;
    return true;
  });

  // Add form
  const addFormik = useFormik<SBFormValues>({
    initialValues: ADD_INITIAL,
    validationSchema: sbSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, helpers) => {
      try {
        await createSB.mutateAsync({
          policyNo: values.policyNo,
          sbDueDate: values.sbDueDate,
          sbAmount: values.sbAmount,
          instalmentNo: values.instalmentNo,
        });
        toast.success('SB record added');
        setAddDialogVisible(false);
        helpers.resetForm();
      } catch {
        toast.error('Failed to add SB record');
      }
    },
  });

  // Mark paid form
  const paidFormik = useFormik<SBMarkPaidFormValues>({
    initialValues: PAID_INITIAL,
    validationSchema: sbMarkPaidSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, helpers) => {
      if (!paidDialogRecord) return;
      try {
        await markPaid.mutateAsync({
          id: paidDialogRecord.id,
          data: {
            paidDate: values.paidDate,
            chequeNo: values.chequeNo || undefined,
          },
        });
        toast.success('Marked as paid');
        setPaidDialogRecord(null);
        helpers.resetForm();
      } catch {
        toast.error('Failed to mark as paid');
      }
    },
  });

  function openAddDialog() {
    addFormik.resetForm();
    setAddDialogVisible(true);
  }

  function closeAddDialog() {
    setAddDialogVisible(false);
    addFormik.resetForm();
  }

  function openPaidDialog(record: SB) {
    paidFormik.resetForm();
    setPaidDialogRecord(record);
  }

  function closePaidDialog() {
    setPaidDialogRecord(null);
    paidFormik.resetForm();
  }

  if (isLoading) return <LoadingState />;

  return (
    <>
      <Screen>
        <Text variant="headlineSmall" style={styles.heading}>Survival Benefits</Text>

        <SegmentedButtons
          value={filter}
          onValueChange={(v) => setFilter(v as FilterValue)}
          buttons={[
            { value: 'all', label: 'All' },
            { value: 'paid', label: 'Paid' },
            { value: 'unpaid', label: 'Unpaid' },
          ]}
          style={styles.segmented}
        />

        {!filteredRecords.length ? (
          <Text style={styles.empty}>No SB records found.</Text>
        ) : (
          filteredRecords.map((record: SB) => {
            const isPaid = !!record.sbPayDate;
            return (
              <Card key={record.id} style={styles.card} mode="outlined">
                <Card.Content>
                  <View style={styles.row}>
                    <Text variant="titleMedium" style={styles.policyNo}>
                      Policy #{record.policyNo}
                    </Text>
                    <Chip
                      compact
                      style={[
                        styles.statusChip,
                        { backgroundColor: isPaid ? '#dcfce7' : '#fef3c7' },
                      ]}
                      textStyle={{
                        color: isPaid ? '#15803d' : '#b45309',
                        fontSize: 11,
                        fontWeight: '700',
                      }}
                    >
                      {isPaid ? 'Paid' : 'Unpaid'}
                    </Chip>
                  </View>
                  <Divider style={styles.divider} />
                  <View style={styles.row}>
                    <View>
                      <Text variant="labelSmall" style={styles.label}>SB Due Date</Text>
                      <Text variant="bodyMedium">{formatDate(record.sbDueDate)}</Text>
                    </View>
                    <View style={styles.alignEnd}>
                      <Text variant="labelSmall" style={styles.label}>Amount</Text>
                      <Text variant="bodyMedium" style={styles.amount}>{formatCurrency(record.sbAmount)}</Text>
                    </View>
                  </View>
                  <Text variant="bodySmall" style={styles.instalment}>
                    Instalment #{record.instalmentNo}
                  </Text>
                  {isPaid && (
                    <Text variant="bodySmall" style={styles.paidInfo}>
                      Paid on {formatDate(record.sbPayDate)}
                      {record.chequeNo ? ` · Cheque ${record.chequeNo}` : ''}
                    </Text>
                  )}
                  {!isPaid && (
                    <Button
                      mode="outlined"
                      compact
                      style={styles.markPaidBtn}
                      onPress={() => openPaidDialog(record)}
                    >
                      Mark as Paid
                    </Button>
                  )}
                </Card.Content>
              </Card>
            );
          })
        )}
      </Screen>

      <FAB icon="plus" style={styles.fab} onPress={openAddDialog} />

      {/* Add SB Dialog */}
      <Portal>
        <Dialog visible={addDialogVisible} onDismiss={closeAddDialog}>
          <Dialog.Title>Add SB Record</Dialog.Title>
          <Dialog.ScrollArea style={styles.scrollArea}>
            <TextInput
              label="Policy Number *"
              mode="outlined"
              keyboardType="numeric"
              value={addFormik.values.policyNo ? String(addFormik.values.policyNo) : ''}
              onChangeText={(v) => addFormik.setFieldValue('policyNo', v ? Number(v) : undefined)}
              onBlur={() => addFormik.setFieldTouched('policyNo')}
              error={addFormik.touched.policyNo && !!addFormik.errors.policyNo}
              style={styles.input}
            />
            {addFormik.touched.policyNo && addFormik.errors.policyNo && (
              <Text style={styles.errorText}>{addFormik.errors.policyNo}</Text>
            )}

            <TextInput
              label="SB Due Date *"
              mode="outlined"
              placeholder="YYYY-MM-DD"
              keyboardType="numeric"
              value={addFormik.values.sbDueDate}
              onChangeText={(v) => addFormik.setFieldValue('sbDueDate', v)}
              onBlur={() => addFormik.setFieldTouched('sbDueDate')}
              error={addFormik.touched.sbDueDate && !!addFormik.errors.sbDueDate}
              style={styles.input}
            />
            {addFormik.touched.sbDueDate && addFormik.errors.sbDueDate && (
              <Text style={styles.errorText}>{addFormik.errors.sbDueDate}</Text>
            )}

            <TextInput
              label="SB Amount (₹) *"
              mode="outlined"
              keyboardType="numeric"
              value={addFormik.values.sbAmount ? String(addFormik.values.sbAmount) : ''}
              onChangeText={(v) => addFormik.setFieldValue('sbAmount', v ? Number(v) : undefined)}
              onBlur={() => addFormik.setFieldTouched('sbAmount')}
              error={addFormik.touched.sbAmount && !!addFormik.errors.sbAmount}
              style={styles.input}
            />
            {addFormik.touched.sbAmount && addFormik.errors.sbAmount && (
              <Text style={styles.errorText}>{addFormik.errors.sbAmount}</Text>
            )}

            <TextInput
              label="Instalment Number *"
              mode="outlined"
              keyboardType="numeric"
              value={addFormik.values.instalmentNo ? String(addFormik.values.instalmentNo) : ''}
              onChangeText={(v) => addFormik.setFieldValue('instalmentNo', v ? Number(v) : undefined)}
              onBlur={() => addFormik.setFieldTouched('instalmentNo')}
              error={addFormik.touched.instalmentNo && !!addFormik.errors.instalmentNo}
              style={styles.input}
            />
            {addFormik.touched.instalmentNo && addFormik.errors.instalmentNo && (
              <Text style={styles.errorText}>{addFormik.errors.instalmentNo}</Text>
            )}
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={closeAddDialog}>Cancel</Button>
            <Button
              mode="contained"
              onPress={() => addFormik.handleSubmit()}
              loading={createSB.isPending}
              disabled={createSB.isPending}
            >
              Add Record
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Mark Paid Dialog */}
        <Dialog visible={!!paidDialogRecord} onDismiss={closePaidDialog}>
          <Dialog.Title>Mark as Paid</Dialog.Title>
          <Dialog.Content>
            {paidDialogRecord && (
              <Text variant="bodyMedium" style={styles.paidSubtitle}>
                Policy #{paidDialogRecord.policyNo} · {formatCurrency(paidDialogRecord.sbAmount)}
              </Text>
            )}
            <TextInput
              label="Paid Date *"
              mode="outlined"
              placeholder="YYYY-MM-DD"
              keyboardType="numeric"
              value={paidFormik.values.paidDate}
              onChangeText={(v) => paidFormik.setFieldValue('paidDate', v)}
              onBlur={() => paidFormik.setFieldTouched('paidDate')}
              error={paidFormik.touched.paidDate && !!paidFormik.errors.paidDate}
              style={styles.input}
            />
            {paidFormik.touched.paidDate && paidFormik.errors.paidDate && (
              <Text style={styles.errorText}>{paidFormik.errors.paidDate}</Text>
            )}

            <TextInput
              label="Cheque Number (optional)"
              mode="outlined"
              keyboardType="numeric"
              value={paidFormik.values.chequeNo ?? ''}
              onChangeText={(v) => paidFormik.setFieldValue('chequeNo', v || undefined)}
              onBlur={() => paidFormik.setFieldTouched('chequeNo')}
              error={paidFormik.touched.chequeNo && !!paidFormik.errors.chequeNo}
              style={styles.input}
            />
            {paidFormik.touched.chequeNo && paidFormik.errors.chequeNo && (
              <Text style={styles.errorText}>{paidFormik.errors.chequeNo}</Text>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closePaidDialog}>Cancel</Button>
            <Button
              mode="contained"
              onPress={() => paidFormik.handleSubmit()}
              loading={markPaid.isPending}
              disabled={markPaid.isPending}
            >
              Confirm
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  heading: { fontWeight: '800', color: '#0d2137', marginBottom: 12 },
  segmented: { marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  policyNo: { fontWeight: '700', color: '#1a3c5e' },
  amount: { fontWeight: '700', color: '#1a3c5e' },
  label: { color: '#64748b', marginBottom: 2 },
  alignEnd: { alignItems: 'flex-end' },
  divider: { marginVertical: 10 },
  statusChip: { borderRadius: 8 },
  instalment: { color: '#64748b', marginTop: 8 },
  paidInfo: { color: '#15803d', marginTop: 4 },
  markPaidBtn: { marginTop: 10, borderColor: '#1a3c5e', alignSelf: 'flex-start' },
  empty: { color: '#64748b', textAlign: 'center', marginTop: 40 },
  fab: { position: 'absolute', right: 16, bottom: 16, backgroundColor: '#1a3c5e' },
  scrollArea: { paddingHorizontal: 0, maxHeight: 380 },
  input: { marginBottom: 8 },
  errorText: { color: '#dc2626', fontSize: 12, marginBottom: 4, marginTop: -4 },
  paidSubtitle: { color: '#64748b', marginBottom: 12 },
});
