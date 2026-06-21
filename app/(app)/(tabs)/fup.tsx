import React, { useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Text,
  Card,
  Chip,
  SegmentedButtons,
  Dialog,
  Portal,
  Button,
  TextInput,
  HelperText,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import { useFormik } from 'formik';
import { useFUPDue, useUpdateFUP } from '@/hooks/useFUP';
import { useToast } from '@/hooks/useToast';
import { fupUpdateSchema, FUPUpdateFormValues } from '@/validations/fup.validation';
import { FUPDueItem } from '@/types/fup.types';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import Screen from '@/components/common/Screen';
import EmptyState from '@/components/common/EmptyState';

type FUPFilter = 'ALL' | 'OVERDUE' | 'DUE_SOON';

export default function FUPScreen() {
  const toast = useToast();
  const [filter, setFilter] = useState<FUPFilter>('ALL');
  const [selectedItem, setSelectedItem] = useState<FUPDueItem | null>(null);

  const { data, isLoading, isError } = useFUPDue({});
  const updateFUP = useUpdateFUP();

  const items = useMemo(() => {
    const list = data?.data ?? [];
    if (filter === 'OVERDUE') return list.filter((d: FUPDueItem) => d.daysOverdue > 0);
    if (filter === 'DUE_SOON') return list.filter((d: FUPDueItem) => d.daysOverdue <= 0 && d.daysUntilLapse < 30);
    return list;
  }, [data, filter]);

  const totalCount = data?.data?.length ?? 0;
  const overdueCount = (data?.data ?? []).filter((d: FUPDueItem) => d.daysOverdue > 0).length;

  const formik = useFormik<FUPUpdateFormValues>({
    initialValues: {
      policyNo: 0,
      oldFup: '',
      newFup: '',
      reason: '',
    },
    validationSchema: fupUpdateSchema,
    validateOnBlur: true,
    validateOnChange: false,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      try {
        await updateFUP.mutateAsync({
          policyNo: Number(values.policyNo),
          oldFup: values.oldFup,
          newFup: values.newFup,
          reason: values.reason || undefined,
        });
        toast.success('FUP updated successfully');
        setSelectedItem(null);
        resetForm();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to update FUP';
        toast.error(msg);
      }
    },
  });

  function openDialog(item: FUPDueItem) {
    setSelectedItem(item);
    formik.resetForm({
      values: {
        policyNo: item.policyNo,
        oldFup: item.nextPremium ?? '',
        newFup: '',
        reason: '',
      },
    });
  }

  function closeDialog() {
    setSelectedItem(null);
    formik.resetForm();
  }

  const { values, errors, touched, handleBlur, handleSubmit, setFieldValue } = formik;

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>FUP Tracker</Text>
        <Text variant="bodySmall" style={styles.subtitle}>Follow-Up Premiums</Text>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <Card style={[styles.statCard, { borderColor: '#e2e8f0' }]} mode="outlined">
          <Card.Content style={styles.statContent}>
            <Text variant="labelSmall" style={styles.statLabel}>Total Due</Text>
            <Text variant="headlineMedium" style={[styles.statValue, { color: '#1a3c5e' }]}>
              {totalCount}
            </Text>
          </Card.Content>
        </Card>
        <View style={{ width: 12 }} />
        <Card
          style={[styles.statCard, overdueCount > 0 ? { borderColor: '#fca5a5' } : undefined]}
          mode="outlined"
        >
          <Card.Content style={styles.statContent}>
            <Text variant="labelSmall" style={styles.statLabel}>Overdue</Text>
            <Text
              variant="headlineMedium"
              style={[styles.statValue, { color: overdueCount > 0 ? '#dc2626' : '#15803d' }]}
            >
              {overdueCount}
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Filter */}
      <SegmentedButtons
        value={filter}
        onValueChange={(v) => setFilter(v as FUPFilter)}
        style={styles.segment}
        buttons={[
          { value: 'ALL', label: 'All' },
          { value: 'OVERDUE', label: 'Overdue' },
          { value: 'DUE_SOON', label: 'Due Soon' },
        ]}
      />

      {/* List */}
      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" />
        </View>
      ) : isError ? (
        <EmptyState
          title="Failed to load"
          message="Could not fetch FUP data."
          icon="alert-circle-outline"
        />
      ) : items.length === 0 ? (
        <EmptyState
          title={filter === 'ALL' ? 'All premiums collected' : 'No items in this category'}
          message={filter === 'ALL' ? 'Great job keeping up with collections!' : 'Try changing the filter.'}
          icon="checkmark-circle-outline"
        />
      ) : (
        <>
          <Text variant="labelSmall" style={styles.countLabel}>
            {items.length} {items.length === 1 ? 'record' : 'records'}
          </Text>
          {(items as FUPDueItem[]).map((item) => (
            <Card
              key={item.policyNo}
              style={styles.card}
              mode="outlined"
              onPress={() => openDialog(item)}
            >
              <Card.Content>
                {/* Top row */}
                <View style={styles.row}>
                  <Text variant="titleSmall" style={styles.clientName} numberOfLines={1}>
                    {item.clientName}
                  </Text>
                  {item.daysOverdue > 0 ? (
                    <Chip
                      compact
                      style={styles.overdueChip}
                      textStyle={styles.overdueChipText}
                    >
                      {item.daysOverdue}d overdue
                    </Chip>
                  ) : (
                    <Chip compact style={styles.dueChip} textStyle={styles.dueChipText}>
                      Due
                    </Chip>
                  )}
                </View>

                <Text variant="bodySmall" style={styles.planName} numberOfLines={1}>
                  {item.planName}
                </Text>
                <Text style={styles.policyNo}>{String(item.policyNo)}</Text>

                {/* Premium row */}
                <View style={styles.financialRow}>
                  <View>
                    <Text variant="labelSmall" style={styles.fieldLabel}>Premium</Text>
                    <Text variant="bodyMedium" style={styles.premiumText}>
                      {formatCurrency(item.premium)}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text variant="labelSmall" style={styles.fieldLabel}>Due Date</Text>
                    <Text
                      variant="bodyMedium"
                      style={[
                        styles.dueDateText,
                        item.daysOverdue > 0 ? { color: '#dc2626' } : { color: '#b45309' },
                      ]}
                    >
                      {formatDate(item.nextPremium)}
                    </Text>
                  </View>
                </View>

                {/* Mobile + lapse */}
                <View style={styles.bottomRow}>
                  {item.mobile ? (
                    <Text variant="bodySmall" style={styles.mobile}>{item.mobile}</Text>
                  ) : (
                    <View />
                  )}
                  {item.daysUntilLapse < 30 && item.daysUntilLapse >= 0 && (
                    <Text variant="bodySmall" style={styles.lapseWarn}>
                      Lapses in {item.daysUntilLapse}d
                    </Text>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))}
          <View style={{ height: 24 }} />
        </>
      )}

      {/* FUP Update Dialog */}
      <Portal>
        <Dialog visible={!!selectedItem} onDismiss={closeDialog} style={styles.dialog}>
          <Dialog.Title>Update FUP</Dialog.Title>
          <Dialog.Content>
            {selectedItem && (
              <>
                <Text variant="bodySmall" style={styles.dialogSubtitle}>
                  {selectedItem.clientName} · {String(selectedItem.policyNo)}
                </Text>
                <Divider style={{ marginBottom: 12 }} />

                {/* Policy No (pre-filled, readonly display) */}
                <TextInput
                  label="Policy Number"
                  mode="outlined"
                  value={String(values.policyNo)}
                  editable={false}
                  style={styles.dialogInput}
                  outlineColor="#e2e8f0"
                  activeOutlineColor="#1a3c5e"
                />

                {/* Old FUP (pre-filled) */}
                <TextInput
                  label="Current FUP Date"
                  mode="outlined"
                  value={values.oldFup}
                  onChangeText={(v) => setFieldValue('oldFup', v)}
                  onBlur={handleBlur('oldFup')}
                  keyboardType="numeric"
                  placeholder="YYYY-MM-DD"
                  error={!!(touched.oldFup && errors.oldFup)}
                  style={styles.dialogInput}
                  outlineColor="#e2e8f0"
                  activeOutlineColor="#1a3c5e"
                />
                {touched.oldFup && errors.oldFup && (
                  <HelperText type="error" visible>{errors.oldFup}</HelperText>
                )}

                {/* New FUP */}
                <TextInput
                  label="New FUP Date"
                  mode="outlined"
                  value={values.newFup}
                  onChangeText={(v) => setFieldValue('newFup', v)}
                  onBlur={handleBlur('newFup')}
                  keyboardType="numeric"
                  placeholder="YYYY-MM-DD"
                  error={!!(touched.newFup && errors.newFup)}
                  style={styles.dialogInput}
                  outlineColor="#e2e8f0"
                  activeOutlineColor="#1a3c5e"
                />
                {touched.newFup && errors.newFup && (
                  <HelperText type="error" visible>{errors.newFup}</HelperText>
                )}

                {/* Reason */}
                <TextInput
                  label="Reason (optional)"
                  mode="outlined"
                  value={values.reason ?? ''}
                  onChangeText={(v) => setFieldValue('reason', v)}
                  onBlur={handleBlur('reason')}
                  multiline
                  numberOfLines={2}
                  placeholder="e.g. Premium collected on visit"
                  error={!!(touched.reason && errors.reason)}
                  style={styles.dialogInput}
                  outlineColor="#e2e8f0"
                  activeOutlineColor="#1a3c5e"
                />
                {touched.reason && errors.reason && (
                  <HelperText type="error" visible>{errors.reason}</HelperText>
                )}
              </>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeDialog} textColor="#64748b">
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={() => handleSubmit()}
              loading={formik.isSubmitting}
              disabled={formik.isSubmitting}
              buttonColor="#1a3c5e"
            >
              Update FUP
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 12 },
  title: { fontWeight: '800', color: '#0d2137' },
  subtitle: { color: '#64748b', marginTop: 2 },
  statsRow: { flexDirection: 'row', marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: '#fff' },
  statContent: { paddingVertical: 12, paddingHorizontal: 14 },
  statLabel: { color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  statValue: { fontWeight: '800' },
  segment: { marginBottom: 16 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 200 },
  countLabel: { color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  clientName: { fontWeight: '700', color: '#0d2137', flex: 1, marginRight: 8 },
  planName: { color: '#475569', marginBottom: 4 },
  policyNo: { fontFamily: 'monospace', fontSize: 12, color: '#64748b', marginBottom: 8 },
  overdueChip: { backgroundColor: '#fee2e2' },
  overdueChipText: { color: '#dc2626', fontSize: 11, fontWeight: '700' },
  dueChip: { backgroundColor: '#fef3c7' },
  dueChipText: { color: '#b45309', fontSize: 11 },
  financialRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  fieldLabel: { color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 },
  premiumText: { fontWeight: '700', color: '#1a3c5e' },
  dueDateText: { fontWeight: '600' },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mobile: { color: '#64748b' },
  lapseWarn: { color: '#dc2626', fontWeight: '700', fontSize: 12 },
  dialog: { borderRadius: 16, backgroundColor: '#fff' },
  dialogSubtitle: { color: '#64748b', marginBottom: 8 },
  dialogInput: { backgroundColor: '#fff', marginBottom: 4 },
});
