import React, { useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Text,
  Card,
  Searchbar,
  SegmentedButtons,
  Chip,
  FAB,
  ActivityIndicator,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { usePolicies } from '@/hooks/usePolicies';
import { PolicyStatusBadge } from '@/components/common/StatusBadge';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import Screen from '@/components/common/Screen';
import EmptyState from '@/components/common/EmptyState';
import { PolicyStatus } from '@/types/common.types';
import { PolicyListItem } from '@/types/policy.types';

type FilterValue = 'ALL' | 'IF' | 'LA' | 'PU';

export default function PoliciesScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterValue>('ALL');

  const { data, isLoading, isError } = usePolicies({});

  const policies = useMemo(() => {
    let list = data?.data ?? [];
    if (filter !== 'ALL') {
      list = (list as PolicyListItem[]).filter((p: PolicyListItem) => p.status === (filter as PolicyStatus));
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = (list as PolicyListItem[]).filter(
        (p: PolicyListItem) =>
          p.clientName.toLowerCase().includes(q) ||
          p.planName.toLowerCase().includes(q) ||
          String(p.policyNo).includes(q) ||
          p.familyCode.toLowerCase().includes(q),
      );
    }
    return list;
  }, [data, filter, search]);

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>Policies</Text>
        {data?.total != null && (
          <Text variant="bodySmall" style={styles.subtitle}>{data.total} total</Text>
        )}
      </View>

      {/* Search */}
      <Searchbar
        placeholder="Search name, plan, policy no…"
        value={search}
        onChangeText={setSearch}
        style={styles.searchbar}
        inputStyle={{ fontSize: 14 }}
      />

      {/* Filter */}
      <SegmentedButtons
        value={filter}
        onValueChange={(v) => setFilter(v as FilterValue)}
        style={styles.segment}
        buttons={[
          { value: 'ALL', label: 'All' },
          { value: 'IF', label: 'In Force' },
          { value: 'LA', label: 'Lapsed' },
          { value: 'PU', label: 'Paid Up' },
        ]}
      />

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" />
        </View>
      ) : isError ? (
        <EmptyState
          title="Failed to load"
          message="Could not fetch policies. Pull to retry."
          icon="alert-circle-outline"
        />
      ) : policies.length === 0 ? (
        <EmptyState
          title="No policies found"
          message={search ? 'Try a different search term.' : 'Add your first policy.'}
          icon="document-text-outline"
          action={{ label: 'Add Policy', onPress: () => router.push('/(app)/policy/new') }}
        />
      ) : (
        <>
          <Text variant="labelSmall" style={styles.countLabel}>
            {policies.length} {policies.length === 1 ? 'policy' : 'policies'}
          </Text>
          {policies.map((policy: PolicyListItem, index: number) => (
            <React.Fragment key={policy.id}>
              <Card
                style={styles.card}
                mode="outlined"
                onPress={() => router.push(`/(app)/policy/${policy.policyNo}`)}
              >
                <Card.Content style={styles.cardContent}>
                  {/* Top row: name + badge */}
                  <View style={styles.row}>
                    <Text variant="titleSmall" style={styles.clientName} numberOfLines={1}>
                      {policy.clientName}
                    </Text>
                    <PolicyStatusBadge status={policy.status} />
                  </View>

                  {/* Plan name */}
                  <Text variant="bodySmall" style={styles.planName} numberOfLines={1}>
                    {policy.planName}
                  </Text>

                  {/* Policy No (monospace) */}
                  <Text style={styles.policyNo}>{String(policy.policyNo)}</Text>

                  {/* Financial row */}
                  <View style={styles.financialRow}>
                    <View>
                      <Text variant="labelSmall" style={styles.fieldLabel}>Premium</Text>
                      <Text variant="bodyMedium" style={styles.premium}>
                        {formatCurrency(policy.premium)}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text variant="labelSmall" style={styles.fieldLabel}>Sum Assured</Text>
                      <Text variant="bodyMedium" style={styles.sumAssured}>
                        {formatCurrency(policy.sumAssured)}
                      </Text>
                    </View>
                  </View>

                  {/* Next premium date */}
                  {policy.nextPremium && (
                    <Text variant="bodySmall" style={styles.nextPremium}>
                      Next premium: {formatDate(policy.nextPremium)}
                    </Text>
                  )}

                  {/* Lapse warning */}
                  {policy.status === 'IF' &&
                    policy.daysUntilLapse >= 0 &&
                    policy.daysUntilLapse < 90 && (
                      <View style={styles.chipRow}>
                        <Chip
                          compact
                          icon="alert"
                          style={[
                            styles.warningChip,
                            policy.daysUntilLapse < 30 ? styles.dangerChip : undefined,
                          ]}
                          textStyle={[
                            styles.warningChipText,
                            policy.daysUntilLapse < 30 ? styles.dangerChipText : undefined,
                          ]}
                        >
                          {policy.daysUntilLapse === 0
                            ? 'Lapses today'
                            : `${policy.daysUntilLapse}d until lapse`}
                        </Chip>
                      </View>
                    )}
                </Card.Content>
              </Card>
            </React.Fragment>
          ))}
          {/* Bottom padding for FAB */}
          <View style={{ height: 80 }} />
        </>
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/(app)/policy/new')}
        label="Add Policy"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontWeight: '800', color: '#0d2137' },
  subtitle: { color: '#64748b' },
  searchbar: { marginBottom: 12, backgroundColor: '#fff', elevation: 0, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  segment: { marginBottom: 16 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 200 },
  countLabel: { color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 12 },
  cardContent: { paddingVertical: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  clientName: { fontWeight: '700', color: '#0d2137', flex: 1, marginRight: 8 },
  planName: { color: '#475569', marginBottom: 4 },
  policyNo: { fontFamily: 'monospace', fontSize: 12, color: '#64748b', marginBottom: 8 },
  financialRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  fieldLabel: { color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 },
  premium: { fontWeight: '700', color: '#1a3c5e' },
  sumAssured: { fontWeight: '600', color: '#334155' },
  nextPremium: { color: '#64748b', marginTop: 4 },
  chipRow: { marginTop: 8 },
  warningChip: { backgroundColor: '#fef3c7', alignSelf: 'flex-start' },
  warningChipText: { color: '#b45309', fontSize: 11 },
  dangerChip: { backgroundColor: '#fee2e2' },
  dangerChipText: { color: '#dc2626' },
  fab: { position: 'absolute', bottom: 24, right: 16, backgroundColor: '#1a3c5e' },
});
