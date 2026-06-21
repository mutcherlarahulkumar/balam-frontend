import React, { useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Text,
  Card,
  FAB,
  Portal,
  Dialog,
  Button,
  TextInput,
  HelperText,
  ActivityIndicator,
  Divider,
  Chip,
} from 'react-native-paper';
import { Stack } from 'expo-router';
import { useFormik } from 'formik';
import { useCommissions, useCommissionSummary, useCreateCommission } from '@/hooks/useCommission';
import { Commission, CommissionYearly } from '@/types/commission.types';
import { useToast } from '@/hooks/useToast';
import { commissionSchema, CommissionFormValues } from '@/validations/commission.validation';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import Screen from '@/components/common/Screen';
import StatCard from '@/components/common/StatCard';
import EmptyState from '@/components/common/EmptyState';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => String(CURRENT_YEAR - i));
const MONTHS = [
  { value: '01', label: 'Jan' },
  { value: '02', label: 'Feb' },
  { value: '03', label: 'Mar' },
  { value: '04', label: 'Apr' },
  { value: '05', label: 'May' },
  { value: '06', label: 'Jun' },
  { value: '07', label: 'Jul' },
  { value: '08', label: 'Aug' },
  { value: '09', label: 'Sep' },
  { value: '10', label: 'Oct' },
  { value: '11', label: 'Nov' },
  { value: '12', label: 'Dec' },
];

const initialValues: CommissionFormValues = {
  policyNo: '' as unknown as number,
  billDate: '',
  firstComm: undefined,
  secondComm: undefined,
  thirdComm: undefined,
  bonusComm: undefined,
  singleComm: undefined,
  payDate: '',
};

export default function CommissionScreen() {
  const toast = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [yearFilter, setYearFilter] = useState<string>('');
  const [monthFilter, setMonthFilter] = useState<string>('');

  const { data: summary, isLoading: summaryLoading } = useCommissionSummary();
  const { data: records, isLoading: recordsLoading } = useCommissions({
    year: yearFilter ? Number(yearFilter) : undefined,
    month: monthFilter ? Number(monthFilter) : undefined,
  });
  const createCommission = useCreateCommission();

  const totalAllTime = useMemo(() => {
    if (!summary?.yearly) return 0;
    return summary.yearly.reduce((acc: number, y: CommissionYearly) => acc + y.gross, 0);
  }, [summary]);

  const currentYearGross = useMemo(() => {
    if (!summary?.yearly) return 0;
    const yr = summary.yearly.find((y: CommissionYearly) => y.year === CURRENT_YEAR);
    return yr?.gross ?? 0;
  }, [summary]);

  const formik = useFormik<CommissionFormValues>({
    initialValues,
    validationSchema: commissionSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, { resetForm }) => {
      try {
        await createCommission.mutateAsync({
          policyNo: Number(values.policyNo),
          billDate: values.billDate,
          firstComm: values.firstComm != null ? Number(values.firstComm) : undefined,
          secondComm: values.secondComm != null ? Number(values.secondComm) : undefined,
          thirdComm: values.thirdComm != null ? Number(values.thirdComm) : undefined,
          bonusComm: values.bonusComm != null ? Number(values.bonusComm) : undefined,
          singleComm: values.singleComm != null ? Number(values.singleComm) : undefined,
          payDate: values.payDate || undefined,
        });
        toast.success('Commission record added');
        setShowAddDialog(false);
        resetForm();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to add commission record';
        toast.error(msg);
      }
    },
  });

  const { values, errors, touched, handleBlur, handleSubmit, setFieldValue } = formik;

  function commField(
    name: keyof CommissionFormValues,
    label: string,
    opts: { keyboardType?: 'default' | 'numeric'; placeholder?: string; prefix?: boolean } = {},
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
          left={opts.prefix ? <TextInput.Affix text="₹" /> : undefined}
          style={styles.input}
          outlineColor="#e2e8f0"
          activeOutlineColor="#1a3c5e"
        />
        {hasError && <HelperText type="error" visible>{errors[name] as string}</HelperText>}
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Commission',
          headerShown: true,
          headerBackTitle: 'Back',
        }}
      />

      <Screen>
        {/* Stats */}
        {summaryLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator />
          </View>
        ) : (
          <>
            <Text variant="headlineSmall" style={styles.pageTitle}>Commission</Text>

            {/* 3 stat cards */}
            <View style={styles.statsRow}>
              <StatCard
                title="This Month"
                value={formatCurrency(summary?.currentMonth?.totalCommission)}
                subtitle={`${summary?.currentMonth?.policiesBilled ?? 0} policies`}
                color="#15803d"
              />
            </View>
            <View style={[styles.statsRow, { marginTop: 12 }]}>
              <StatCard
                title="This Year"
                value={formatCurrency(currentYearGross)}
                color="#1a3c5e"
              />
              <View style={{ width: 12 }} />
              <StatCard
                title="All Time"
                value={formatCurrency(totalAllTime)}
                color="#2d6a9f"
              />
            </View>
          </>
        )}

        {/* Filters */}
        <View style={styles.filterRow}>
          <Text variant="labelMedium" style={styles.filterLabel}>Year</Text>
          <View style={styles.chipScroll}>
            <Chip
              selected={yearFilter === ''}
              onPress={() => setYearFilter('')}
              style={[styles.filterChip, yearFilter === '' && styles.filterChipSelected]}
              textStyle={yearFilter === '' ? styles.filterChipTextSelected : styles.filterChipText}
              compact
            >
              All
            </Chip>
            {YEARS.map((y) => (
              <Chip
                key={y}
                selected={yearFilter === y}
                onPress={() => setYearFilter(y)}
                style={[styles.filterChip, yearFilter === y && styles.filterChipSelected]}
                textStyle={yearFilter === y ? styles.filterChipTextSelected : styles.filterChipText}
                compact
              >
                {y}
              </Chip>
            ))}
          </View>
        </View>

        <View style={[styles.filterRow, { marginBottom: 16 }]}>
          <Text variant="labelMedium" style={styles.filterLabel}>Month</Text>
          <View style={styles.chipScroll}>
            <Chip
              selected={monthFilter === ''}
              onPress={() => setMonthFilter('')}
              style={[styles.filterChip, monthFilter === '' && styles.filterChipSelected]}
              textStyle={monthFilter === '' ? styles.filterChipTextSelected : styles.filterChipText}
              compact
            >
              All
            </Chip>
            {MONTHS.map((m) => (
              <Chip
                key={m.value}
                selected={monthFilter === m.value}
                onPress={() => setMonthFilter(m.value)}
                style={[styles.filterChip, monthFilter === m.value && styles.filterChipSelected]}
                textStyle={monthFilter === m.value ? styles.filterChipTextSelected : styles.filterChipText}
                compact
              >
                {m.label}
              </Chip>
            ))}
          </View>
        </View>

        {/* Records list */}
        {recordsLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" />
          </View>
        ) : !records?.length ? (
          <EmptyState
            title="No commission records"
            message="Add your first commission record using the + button."
            icon="cash-outline"
            action={{ label: 'Add Record', onPress: () => setShowAddDialog(true) }}
          />
        ) : (
          <>
            <Text variant="labelSmall" style={styles.countLabel}>
              {records.length} {records.length === 1 ? 'record' : 'records'}
            </Text>
            {(records as Commission[]).map((rec: Commission) => {
              const gross = rec.firstComm + rec.secondComm + rec.thirdComm + rec.bonusComm + rec.singleComm;
              return (
                <Card key={rec.id} style={styles.card} mode="outlined">
                  <Card.Content>
                    <View style={styles.recRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.recPolicyNo}>{String(rec.policyNo)}</Text>
                        <Text variant="bodySmall" style={styles.recDate}>
                          Bill: {formatDate(rec.billDate)}
                        </Text>
                        {rec.payDate && (
                          <Text variant="bodySmall" style={styles.recDate}>
                            Paid: {formatDate(rec.payDate)}
                          </Text>
                        )}
                      </View>
                      <Text variant="titleMedium" style={styles.recAmount}>
                        {formatCurrency(gross)}
                      </Text>
                    </View>

                    {/* Commission breakdown */}
                    <Divider style={{ marginVertical: 8 }} />
                    <View style={styles.breakdownRow}>
                      {rec.firstComm > 0 && (
                        <BreakdownItem label="1st" value={rec.firstComm} />
                      )}
                      {rec.secondComm > 0 && (
                        <BreakdownItem label="2nd" value={rec.secondComm} />
                      )}
                      {rec.thirdComm > 0 && (
                        <BreakdownItem label="3rd" value={rec.thirdComm} />
                      )}
                      {rec.bonusComm > 0 && (
                        <BreakdownItem label="Bonus" value={rec.bonusComm} />
                      )}
                      {rec.singleComm > 0 && (
                        <BreakdownItem label="Single" value={rec.singleComm} />
                      )}
                    </View>
                  </Card.Content>
                </Card>
              );
            })}
            <View style={{ height: 80 }} />
          </>
        )}

        {/* Add Dialog */}
        <Portal>
          <Dialog
            visible={showAddDialog}
            onDismiss={() => { setShowAddDialog(false); formik.resetForm(); }}
            style={styles.dialog}
          >
            <Dialog.ScrollArea style={{ maxHeight: 500 }}>
              <Dialog.Title>Add Commission Record</Dialog.Title>
              <View style={styles.dialogBody}>
                {commField('policyNo', 'Policy Number', {
                  keyboardType: 'numeric',
                  placeholder: '9-digit policy number',
                })}
                {commField('billDate', 'Bill Date', {
                  keyboardType: 'numeric',
                  placeholder: 'YYYY-MM-DD',
                })}
                {commField('payDate', 'Pay Date (optional)', {
                  keyboardType: 'numeric',
                  placeholder: 'YYYY-MM-DD',
                })}
                {commField('firstComm', '1st Year Commission', {
                  keyboardType: 'numeric',
                  prefix: true,
                })}
                {commField('secondComm', '2nd Year Commission', {
                  keyboardType: 'numeric',
                  prefix: true,
                })}
                {commField('thirdComm', '3rd Year Commission', {
                  keyboardType: 'numeric',
                  prefix: true,
                })}
                {commField('bonusComm', 'Bonus Commission', {
                  keyboardType: 'numeric',
                  prefix: true,
                })}
                {commField('singleComm', 'Single Premium Commission', {
                  keyboardType: 'numeric',
                  prefix: true,
                })}
              </View>
            </Dialog.ScrollArea>
            <Dialog.Actions>
              <Button
                onPress={() => { setShowAddDialog(false); formik.resetForm(); }}
                textColor="#64748b"
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={() => handleSubmit()}
                loading={formik.isSubmitting}
                disabled={formik.isSubmitting}
                buttonColor="#1a3c5e"
              >
                Save
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => setShowAddDialog(true)}
          label="Add Record"
        />
      </Screen>
    </>
  );
}

function BreakdownItem({ label, value }: { label: string; value: number }) {
  return (
    <View style={breakdownStyles.item}>
      <Text variant="labelSmall" style={breakdownStyles.label}>{label}</Text>
      <Text variant="bodySmall" style={breakdownStyles.value}>{formatCurrency(value)}</Text>
    </View>
  );
}

const breakdownStyles = StyleSheet.create({
  item: { alignItems: 'center' },
  label: { color: '#94a3b8', fontSize: 10, marginBottom: 2 },
  value: { fontWeight: '600', color: '#334155', fontSize: 12 },
});

const styles = StyleSheet.create({
  pageTitle: { fontWeight: '800', color: '#0d2137', marginBottom: 16 },
  loadingWrap: { justifyContent: 'center', alignItems: 'center', minHeight: 80 },
  statsRow: { flexDirection: 'row' },
  filterRow: { marginTop: 16 },
  filterLabel: { color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  chipScroll: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterChip: { backgroundColor: '#f1f5f9' },
  filterChipSelected: { backgroundColor: '#dbeafe' },
  filterChipText: { color: '#475569', fontSize: 12 },
  filterChipTextSelected: { color: '#1a3c5e', fontWeight: '700', fontSize: 12 },
  countLabel: { color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 12 },
  recRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  recPolicyNo: { fontFamily: 'monospace', fontSize: 13, fontWeight: '700', color: '#0d2137' },
  recDate: { color: '#64748b', marginTop: 2 },
  recAmount: { fontWeight: '800', color: '#15803d' },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-around' },
  dialog: { borderRadius: 16, backgroundColor: '#fff' },
  dialogBody: { paddingHorizontal: 4, paddingTop: 8 },
  fieldWrap: { marginBottom: 4 },
  input: { backgroundColor: '#fff', marginBottom: 2 },
  fab: { position: 'absolute', bottom: 24, right: 16, backgroundColor: '#1a3c5e' },
});
