import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Divider, IconButton, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { usePolicies } from '@/hooks/usePolicies';
import { PolicyListItem } from '@/types/policy.types';
import { PolicyStatusBadge, FUPStatusBadge } from '@/components/common/StatusBadge';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import Screen from '@/components/common/Screen';
import SectionHeader from '@/components/common/SectionHeader';
import EmptyState from '@/components/common/EmptyState';

const PAYMENT_MODE_LABELS: Record<string, string> = {
  Y: 'Yearly',
  H: 'Half-yearly',
  Q: 'Quarterly',
  M: 'Monthly',
  S: 'Single',
};

export default function PolicyDetailScreen() {
  const { policyNo } = useLocalSearchParams<{ policyNo: string }>();
  const router = useRouter();

  const { data, isLoading, isError } = usePolicies({});

  const policy = React.useMemo(() => {
    if (!data?.data || !policyNo) return null;
    return (data.data as PolicyListItem[]).find((p: PolicyListItem) => String(p.policyNo) === String(policyNo)) ?? null;
  }, [data, policyNo]);

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: `Policy ${policyNo}`, headerShown: true }} />
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      </>
    );
  }

  if (isError || !policy) {
    return (
      <>
        <Stack.Screen options={{ title: `Policy ${policyNo}`, headerShown: true }} />
        <Screen>
          <EmptyState
            title="Policy not found"
            message={`No policy with number ${policyNo} was found.`}
            icon="document-search-outline"
            action={{ label: 'Go Back', onPress: () => router.back() }}
          />
        </Screen>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: `Policy ${policy.policyNo}`,
          headerShown: true,
          headerBackTitle: 'Policies',
          headerRight: () => (
            <IconButton
              icon="pencil"
              size={22}
              iconColor="#1a3c5e"
              onPress={() => router.push(`/(app)/policy/new`)}
            />
          ),
        }}
      />

      <Screen>
        {/* Status hero */}
        <Card style={styles.heroCard} mode="outlined">
          <Card.Content style={styles.heroContent}>
            <View style={styles.heroTop}>
              <View style={{ flex: 1 }}>
                <Text variant="titleLarge" style={styles.clientName}>{policy.clientName}</Text>
                <Text variant="bodyMedium" style={styles.planName}>{policy.planName}</Text>
                <Text style={styles.policyNo}>{String(policy.policyNo)}</Text>
              </View>
              <PolicyStatusBadge status={policy.status} />
            </View>

            <Divider style={styles.heroDivider} />

            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Text variant="labelSmall" style={styles.statLabel}>Premium</Text>
                <Text variant="titleMedium" style={styles.statValue}>{formatCurrency(policy.premium)}</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Text variant="labelSmall" style={styles.statLabel}>Sum Assured</Text>
                <Text variant="titleMedium" style={styles.statValue}>{formatCurrency(policy.sumAssured)}</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Text variant="labelSmall" style={styles.statLabel}>FUP Status</Text>
                <FUPStatusBadge status={policy.fupStatus} />
              </View>
            </View>

            {/* Lapse warning */}
            {policy.status === 'IF' && policy.daysUntilLapse >= 0 && policy.daysUntilLapse < 90 && (
              <View style={styles.lapseWarn}>
                <Text style={[
                  styles.lapseText,
                  policy.daysUntilLapse < 30 ? { color: '#dc2626' } : { color: '#b45309' },
                ]}>
                  {policy.daysUntilLapse === 0
                    ? 'Policy lapses today!'
                    : `${policy.daysUntilLapse} days until lapse`}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Identity */}
        <SectionHeader title="Policy Identity" />
        <Card style={styles.card} mode="outlined">
          <Card.Content>
            <DetailRow label="Policy Number" value={String(policy.policyNo)} mono />
            <Divider style={styles.rowDivider} />
            <DetailRow label="Family Code" value={policy.familyCode} mono />
            <Divider style={styles.rowDivider} />
            <DetailRow label="Plan" value={policy.planName} />
            <Divider style={styles.rowDivider} />
            <DetailRow label="Plan No." value={policy.planNo} mono />
            <Divider style={styles.rowDivider} />
            <DetailRow label="Payment Mode" value={PAYMENT_MODE_LABELS[policy.paymentMode] ?? policy.paymentMode} />
          </Card.Content>
        </Card>

        {/* Financial */}
        <SectionHeader title="Financial Details" />
        <Card style={styles.card} mode="outlined">
          <Card.Content>
            <DetailRow label="Premium" value={formatCurrency(policy.premium)} />
            <Divider style={styles.rowDivider} />
            <DetailRow label="Sum Assured" value={formatCurrency(policy.sumAssured)} />
            <Divider style={styles.rowDivider} />
            <DetailRow label="Term" value={`${policy.term} years`} />
            <Divider style={styles.rowDivider} />
            <DetailRow label="Premium Paying Term" value={`${policy.ppt} years`} />
          </Card.Content>
        </Card>

        {/* Dates */}
        <SectionHeader title="Dates" />
        <Card style={styles.card} mode="outlined">
          <Card.Content>
            <DetailRow label="Next Premium" value={formatDate(policy.nextPremium)} />
            <Divider style={styles.rowDivider} />
            <DetailRow label="Maturity Date" value={formatDate(policy.matDate)} />
          </Card.Content>
        </Card>

        <View style={{ height: 24 }} />
      </Screen>
    </>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <View style={detailStyles.row}>
      <Text variant="bodySmall" style={detailStyles.label}>{label}</Text>
      <Text
        variant="bodyMedium"
        style={[detailStyles.value, mono && detailStyles.mono]}
        numberOfLines={2}
      >
        {value || '—'}
      </Text>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  label: { color: '#64748b', flex: 1 },
  value: { fontWeight: '600', color: '#0d2137', textAlign: 'right', flex: 1 },
  mono: { fontFamily: 'monospace' },
});

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4f8' },
  heroCard: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 20 },
  heroContent: { paddingVertical: 16 },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  clientName: { fontWeight: '800', color: '#0d2137', marginBottom: 2 },
  planName: { color: '#475569', marginBottom: 4 },
  policyNo: { fontFamily: 'monospace', fontSize: 12, color: '#64748b' },
  heroDivider: { marginBottom: 12 },
  heroStats: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatDivider: { width: 1, height: 32, backgroundColor: '#e2e8f0' },
  statLabel: { color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 },
  statValue: { fontWeight: '700', color: '#1a3c5e' },
  lapseWarn: { marginTop: 12, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fef3c7', borderRadius: 8 },
  lapseText: { fontWeight: '700', textAlign: 'center', fontSize: 13 },
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 12 },
  rowDivider: { marginVertical: 0 },
});
