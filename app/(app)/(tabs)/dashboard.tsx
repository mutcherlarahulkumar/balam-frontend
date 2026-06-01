import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, List, Chip, Button, Divider, Banner } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { usePolicies } from '@/hooks/usePolicies';
import { useFamilies } from '@/hooks/useFamilies';
import { useCommissionSummary } from '@/hooks/useCommission';
import { useFUPDue } from '@/hooks/useFUP';
import { useTodayActivities } from '@/hooks/useActivities';
import { useAuth } from '@/context/AuthContext';
import StatCard from '@/components/common/StatCard';
import LoadingState from '@/components/common/LoadingState';
import { PolicyStatusBadge } from '@/components/common/StatusBadge';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import Screen from '@/components/common/Screen';
import { PolicyListItem } from '@/types/policy.types';
import { FUPDueItem } from '@/types/fup.types';
import { Activity } from '@/types/activity.types';

export default function DashboardScreen() {
  const { agent } = useAuth();
  const router = useRouter();

  const { data: policies, isLoading } = usePolicies({ limit: 6 });
  const { data: families } = useFamilies({ limit: 1 });
  const { data: commissionSummary } = useCommissionSummary();
  const { data: duePolicies } = useFUPDue({});
  const { data: todayActivities } = useTodayActivities();

  if (isLoading) return <LoadingState />;

  const lapsingCount = (policies?.data ?? []).filter((p: PolicyListItem) => p.daysUntilLapse < 30 && p.daysUntilLapse >= 0 && p.status === 'IF').length;
  const overdueCount = (duePolicies?.data ?? []).filter((d: FUPDueItem) => d.daysOverdue > 0).length;
  const dueCount = duePolicies?.data?.length ?? 0;

  return (
    <Screen>
      {/* Greeting */}
      <View style={styles.greeting}>
        <Text variant="headlineSmall" style={styles.greetingName}>
          Namaste, {agent?.name?.split(' ')[0]}
        </Text>
        <Text variant="bodySmall" style={styles.greetingSub}>
          {agent?.agentCode}{agent?.branch ? ` · ${agent.branch}` : ''}
          {agent?.club ? ` · ${agent.club}` : ''}
        </Text>
      </View>

      {/* Alerts */}
      {lapsingCount > 0 && (
        <Banner
          visible
          icon="alert"
          style={styles.alertError}
          actions={[{ label: 'View FUP', onPress: () => router.push('/(app)/(tabs)/fup') }]}
        >
          <Text style={{ color: '#7f1d1d' }}>
            {lapsingCount} {lapsingCount === 1 ? 'policy' : 'policies'} lapse within 30 days.
          </Text>
        </Banner>
      )}
      {overdueCount > 0 && (
        <Banner
          visible
          icon="clock-alert"
          style={styles.alertWarning}
          actions={[{ label: 'Collect', onPress: () => router.push('/(app)/(tabs)/fup') }]}
        >
          <Text style={{ color: '#78350f' }}>
            {overdueCount} overdue premium{overdueCount > 1 ? 's' : ''} need collection.
          </Text>
        </Banner>
      )}

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard title="Families" value={families?.total ?? 0} color="#1a3c5e" />
        <View style={{ width: 12 }} />
        <StatCard title="Policies" value={policies?.total ?? 0} color="#2d6a9f" />
      </View>
      <View style={[styles.statsRow, { marginTop: 12 }]}>
        <StatCard title="Due" value={dueCount} subtitle="premiums" color={dueCount > 0 ? '#b45309' : '#15803d'} />
        <View style={{ width: 12 }} />
        <StatCard
          title="Commission"
          value={formatCurrency(commissionSummary?.currentMonth?.totalCommission)}
          subtitle="this month"
          color="#15803d"
        />
      </View>

      {/* Due premiums */}
      <Card style={styles.card} mode="outlined">
        <Card.Title
          title="Premiums Due"
          right={() =>
            dueCount > 0 ? (
              <Chip compact style={{ marginRight: 12, backgroundColor: '#fef3c7' }} textStyle={{ color: '#b45309' }}>
                {dueCount}
              </Chip>
            ) : null
          }
        />
        <Card.Content style={{ paddingTop: 0 }}>
          {!duePolicies?.data?.length ? (
            <Text variant="bodyMedium" style={styles.empty}>All premiums up to date</Text>
          ) : (
            duePolicies.data.slice(0, 5).map((d: FUPDueItem, i: number) => (
              <React.Fragment key={d.policyNo}>
                {i > 0 && <Divider />}
                <List.Item
                  title={d.clientName}
                  description={`${d.planName} · Due ${formatDate(d.nextPremium)}`}
                  right={() => (
                    <View style={styles.listRight}>
                      <Text variant="bodyMedium" style={styles.premium}>{formatCurrency(d.premium)}</Text>
                      <Text variant="labelSmall" style={d.daysOverdue > 0 ? styles.overdue : styles.due}>
                        {d.daysOverdue > 0 ? `${d.daysOverdue}d overdue` : 'Due'}
                      </Text>
                    </View>
                  )}
                  onPress={() => router.push(`/(app)/policy/${d.policyNo}`)}
                  style={styles.listItem}
                  titleStyle={{ fontWeight: '600', fontSize: 14 }}
                  descriptionStyle={{ fontSize: 12 }}
                />
              </React.Fragment>
            ))
          )}
          {dueCount > 5 && (
            <Button onPress={() => router.push('/(app)/(tabs)/fup')} style={{ marginTop: 8 }}>
              View all {dueCount}
            </Button>
          )}
        </Card.Content>
      </Card>

      {/* Recent policies */}
      <Card style={styles.card} mode="outlined">
        <Card.Title
          title="Recent Policies"
          right={() => (
            <Button compact onPress={() => router.push('/(app)/(tabs)/policies')} style={{ marginRight: 8 }}>
              All
            </Button>
          )}
        />
        <Card.Content style={{ paddingTop: 0 }}>
          {!policies?.data?.length ? (
            <Text variant="bodyMedium" style={styles.empty}>No policies yet.</Text>
          ) : (
            policies.data.slice(0, 5).map((p: PolicyListItem, i: number) => (
              <React.Fragment key={p.id}>
                {i > 0 && <Divider />}
                <List.Item
                  title={p.clientName}
                  description={`${p.planName} · ${formatCurrency(p.premium)}`}
                  right={() => <PolicyStatusBadge status={p.status} />}
                  onPress={() => router.push(`/(app)/policy/${p.policyNo}`)}
                  style={styles.listItem}
                  titleStyle={{ fontWeight: '600', fontSize: 14 }}
                  descriptionStyle={{ fontSize: 12 }}
                />
              </React.Fragment>
            ))
          )}
        </Card.Content>
      </Card>

      {/* Today's activities */}
      {todayActivities && todayActivities.length > 0 && (
        <Card style={styles.card} mode="outlined">
          <Card.Title
            title="Today's Reminders"
            right={() => (
              <Chip compact style={{ marginRight: 12, backgroundColor: '#e0f2fe' }} textStyle={{ color: '#0369a1' }}>
                {todayActivities.length}
              </Chip>
            )}
          />
          <Card.Content style={{ paddingTop: 0 }}>
            {todayActivities.map((a: Activity, i: number) => (
              <React.Fragment key={a.id}>
                {i > 0 && <Divider />}
                <List.Item
                  title={a.details || '—'}
                  description={a.activityType}
                  right={() => (
                    <Chip
                      compact
                      style={{ backgroundColor: a.status === 'DONE' ? '#dcfce7' : '#fef3c7' }}
                      textStyle={{ color: a.status === 'DONE' ? '#15803d' : '#b45309', fontSize: 11 }}
                    >
                      {a.status}
                    </Chip>
                  )}
                  style={styles.listItem}
                  titleStyle={{ fontSize: 14 }}
                  descriptionStyle={{ fontSize: 12 }}
                />
              </React.Fragment>
            ))}
          </Card.Content>
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  greeting: { marginBottom: 16 },
  greetingName: { fontWeight: '800', color: '#0d2137' },
  greetingSub: { color: '#64748b', marginTop: 2 },
  alertError: { backgroundColor: '#fee2e2', marginBottom: 12, borderRadius: 12 },
  alertWarning: { backgroundColor: '#fef3c7', marginBottom: 12, borderRadius: 12 },
  statsRow: { flexDirection: 'row' },
  card: { marginTop: 16, backgroundColor: '#fff', borderRadius: 12 },
  empty: { color: '#64748b', paddingVertical: 12 },
  listItem: { paddingVertical: 4 },
  listRight: { alignItems: 'flex-end', justifyContent: 'center' },
  premium: { fontWeight: '700', color: '#1a3c5e' },
  overdue: { color: '#dc2626', fontWeight: '700', fontSize: 11 },
  due: { color: '#b45309', fontSize: 11 },
});
