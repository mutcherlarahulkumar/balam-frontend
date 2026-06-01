import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Text,
  Card,
  SegmentedButtons,
  Divider,
  Chip,
  List,
  ActivityIndicator,
} from 'react-native-paper';
import Screen from '@/components/common/Screen';
import { useFUPDue } from '@/hooks/useFUP';
import { useCommissions, useCommissionSummary } from '@/hooks/useCommission';
import { usePolicies } from '@/hooks/usePolicies';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { FUPDueItem } from '@/types/fup.types';
import { Commission, CommissionYearly } from '@/types/commission.types';
import { PolicyListItem } from '@/types/policy.types';

type ReportTab = 'summary' | 'due' | 'lapsing' | 'commission';

function SectionDivider() {
  return <Divider style={styles.rowDivider} />;
}

function SummaryReport() {
  const { data: policies, isLoading: policiesLoading } = usePolicies({});
  const { data: commissionSummary, isLoading: commLoading } = useCommissionSummary();

  if (policiesLoading || commLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#1a3c5e" />
      </View>
    );
  }

  const allPolicies = policies?.data ?? [];
  const totalPolicies = policies?.total ?? 0;
  const ifCount = (allPolicies as PolicyListItem[]).filter((p: PolicyListItem) => p.status === 'IF').length;
  const lapseCount = (allPolicies as PolicyListItem[]).filter((p: PolicyListItem) => p.status === 'LA').length;
  const totalPremium = (allPolicies as PolicyListItem[]).reduce((sum: number, p: PolicyListItem) => sum + (p.premium ?? 0), 0);

  return (
    <Card style={styles.card} mode="outlined">
      <Card.Title title="Portfolio Summary" titleStyle={styles.cardTitle} />
      <Card.Content>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text variant="displaySmall" style={[styles.summaryValue, { color: '#1a3c5e' }]}>
              {totalPolicies}
            </Text>
            <Text variant="labelMedium" style={styles.summaryLabel}>Total Policies</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text variant="displaySmall" style={[styles.summaryValue, { color: '#15803d' }]}>
              {ifCount}
            </Text>
            <Text variant="labelMedium" style={styles.summaryLabel}>In-Force (IF)</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text variant="displaySmall" style={[styles.summaryValue, { color: '#dc2626' }]}>
              {lapseCount}
            </Text>
            <Text variant="labelMedium" style={styles.summaryLabel}>Lapsed</Text>
          </View>
        </View>
        <SectionDivider />
        <View style={styles.summaryRowFull}>
          <Text variant="labelMedium" style={styles.summaryLabel}>Total Premium Collected</Text>
          <Text variant="titleLarge" style={styles.premiumTotal}>{formatCurrency(totalPremium)}</Text>
        </View>
        {commissionSummary?.currentMonth && (
          <>
            <SectionDivider />
            <View style={styles.summaryRowFull}>
              <Text variant="labelMedium" style={styles.summaryLabel}>Commission This Month</Text>
              <Text variant="titleMedium" style={styles.commissionValue}>
                {formatCurrency(commissionSummary.currentMonth.totalCommission)}
              </Text>
            </View>
            <Text variant="bodySmall" style={styles.monthLabel}>
              {commissionSummary.currentMonth.policiesBilled} policies billed in{' '}
              {commissionSummary.currentMonth.month}
            </Text>
          </>
        )}
      </Card.Content>
    </Card>
  );
}

function DueReport() {
  const { data: duePolicies, isLoading } = useFUPDue({});

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#1a3c5e" />
      </View>
    );
  }

  const items = duePolicies?.data ?? [];

  return (
    <Card style={styles.card} mode="outlined">
      <Card.Title
        title="Premiums Due This Month"
        titleStyle={styles.cardTitle}
        right={() =>
          items.length > 0 ? (
            <Chip compact style={styles.countChip} textStyle={styles.countChipText}>
              {items.length}
            </Chip>
          ) : null
        }
      />
      <Card.Content style={styles.noTopPadding}>
        {!items.length ? (
          <Text style={styles.empty}>All premiums are up to date.</Text>
        ) : (
          items.map((item: FUPDueItem, i: number) => (
            <React.Fragment key={item.policyNo}>
              {i > 0 && <SectionDivider />}
              <List.Item
                title={item.clientName}
                description={`${item.planName} · ${item.paymentMode}`}
                descriptionStyle={styles.listDescription}
                titleStyle={styles.listTitle}
                right={() => (
                  <View style={styles.dueRight}>
                    <Text variant="bodyMedium" style={styles.premiumText}>
                      {formatCurrency(item.premium)}
                    </Text>
                    {item.daysOverdue > 0 ? (
                      <Text variant="labelSmall" style={styles.overdueText}>
                        {item.daysOverdue}d overdue
                      </Text>
                    ) : (
                      <Text variant="labelSmall" style={styles.dueText}>Due</Text>
                    )}
                  </View>
                )}
                style={styles.listItem}
              />
            </React.Fragment>
          ))
        )}
      </Card.Content>
    </Card>
  );
}

function LapsingReport() {
  const { data: duePolicies, isLoading } = useFUPDue({});

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#1a3c5e" />
      </View>
    );
  }

  const items = (duePolicies?.data ?? [])
    .filter((p: FUPDueItem) => p.daysUntilLapse < 90 && p.daysUntilLapse >= 0)
    .sort((a: FUPDueItem, b: FUPDueItem) => a.daysUntilLapse - b.daysUntilLapse);

  return (
    <Card style={styles.card} mode="outlined">
      <Card.Title
        title="Lapsing Policies (within 90 days)"
        titleStyle={styles.cardTitle}
        right={() =>
          items.length > 0 ? (
            <Chip compact style={styles.lapseChip} textStyle={styles.lapseChipText}>
              {items.length}
            </Chip>
          ) : null
        }
      />
      <Card.Content style={styles.noTopPadding}>
        {!items.length ? (
          <Text style={styles.empty}>No policies lapsing within 90 days.</Text>
        ) : (
          items.map((item: FUPDueItem, i: number) => (
            <React.Fragment key={item.policyNo}>
              {i > 0 && <SectionDivider />}
              <List.Item
                title={item.clientName}
                description={`Policy #${item.policyNo} · ${item.planName}`}
                descriptionStyle={styles.listDescription}
                titleStyle={styles.listTitle}
                right={() => (
                  <View style={styles.dueRight}>
                    <Text
                      variant="labelMedium"
                      style={[
                        styles.daysLeft,
                        { color: item.daysUntilLapse < 30 ? '#dc2626' : '#b45309' },
                      ]}
                    >
                      {item.daysUntilLapse}d left
                    </Text>
                    {item.lapseDate && (
                      <Text variant="labelSmall" style={styles.lapseDateText}>
                        {formatDate(item.lapseDate)}
                      </Text>
                    )}
                  </View>
                )}
                style={styles.listItem}
              />
            </React.Fragment>
          ))
        )}
      </Card.Content>
    </Card>
  );
}

function CommissionReport() {
  const { data: summary, isLoading: summaryLoading } = useCommissionSummary();
  const { data: commissions, isLoading: listLoading } = useCommissions({});

  if (summaryLoading || listLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#1a3c5e" />
      </View>
    );
  }

  const recent = (commissions ?? []).slice(0, 10);

  return (
    <>
      {summary?.currentMonth && (
        <Card style={styles.card} mode="outlined">
          <Card.Title title="This Month" titleStyle={styles.cardTitle} />
          <Card.Content>
            <View style={styles.summaryRowFull}>
              <Text variant="labelMedium" style={styles.summaryLabel}>Total Commission</Text>
              <Text variant="titleLarge" style={styles.premiumTotal}>
                {formatCurrency(summary.currentMonth.totalCommission)}
              </Text>
            </View>
            <Text variant="bodySmall" style={styles.monthLabel}>
              {summary.currentMonth.policiesBilled} policies · {summary.currentMonth.month}
            </Text>
          </Card.Content>
        </Card>
      )}

      {summary?.yearly && summary.yearly.length > 0 && (
        <Card style={styles.card} mode="outlined">
          <Card.Title title="Yearly Breakdown" titleStyle={styles.cardTitle} />
          <Card.Content style={styles.noTopPadding}>
            {summary.yearly.map((y: CommissionYearly, i: number) => (
              <React.Fragment key={y.year}>
                {i > 0 && <SectionDivider />}
                <View style={styles.yearRow}>
                  <Text variant="labelLarge" style={styles.yearLabel}>{y.year}</Text>
                  <View style={styles.yearValues}>
                    <Text variant="bodySmall" style={styles.commissionCell}>
                      FY: {formatCurrency(y.firstYear)}
                    </Text>
                    <Text variant="bodySmall" style={styles.commissionCell}>
                      Renewal: {formatCurrency(y.renewal)}
                    </Text>
                    <Text variant="bodyMedium" style={styles.grossValue}>
                      {formatCurrency(y.gross)}
                    </Text>
                  </View>
                </View>
              </React.Fragment>
            ))}
          </Card.Content>
        </Card>
      )}

      {recent.length > 0 && (
        <Card style={styles.card} mode="outlined">
          <Card.Title title="Recent Records" titleStyle={styles.cardTitle} />
          <Card.Content style={styles.noTopPadding}>
            {recent.map((c: Commission, i: number) => (
              <React.Fragment key={c.id}>
                {i > 0 && <SectionDivider />}
                <List.Item
                  title={`Policy #${c.policyNo}`}
                  description={formatDate(c.billDate)}
                  descriptionStyle={styles.listDescription}
                  titleStyle={styles.listTitle}
                  right={() => (
                    <Text variant="bodyMedium" style={styles.premiumText}>
                      {formatCurrency(
                        (c.firstComm ?? 0) +
                          (c.secondComm ?? 0) +
                          (c.thirdComm ?? 0) +
                          (c.bonusComm ?? 0),
                      )}
                    </Text>
                  )}
                  style={styles.listItem}
                />
              </React.Fragment>
            ))}
          </Card.Content>
        </Card>
      )}
    </>
  );
}

export default function ReportsScreen() {
  const [tab, setTab] = useState<ReportTab>('summary');

  return (
    <Screen>
      <Text variant="headlineSmall" style={styles.heading}>Reports</Text>

      <SegmentedButtons
        value={tab}
        onValueChange={(v) => setTab(v as ReportTab)}
        buttons={[
          { value: 'summary', label: 'Summary' },
          { value: 'due', label: 'Due' },
          { value: 'lapsing', label: 'Lapsing' },
          { value: 'commission', label: 'Commission' },
        ]}
        style={styles.segmented}
      />

      {tab === 'summary' && <SummaryReport />}
      {tab === 'due' && <DueReport />}
      {tab === 'lapsing' && <LapsingReport />}
      {tab === 'commission' && <CommissionReport />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { fontWeight: '800', color: '#0d2137', marginBottom: 12 },
  segmented: { marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 12 },
  cardTitle: { fontWeight: '700', color: '#1a3c5e' },
  noTopPadding: { paddingTop: 0 },
  center: { paddingVertical: 40, alignItems: 'center' },
  empty: { color: '#64748b', textAlign: 'center', paddingVertical: 16 },
  rowDivider: { marginVertical: 4 },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
  },
  summaryItem: { alignItems: 'center' },
  summaryValue: { fontWeight: '800' },
  summaryLabel: { color: '#64748b', marginTop: 4, textAlign: 'center' },
  summaryRowFull: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  premiumTotal: { fontWeight: '800', color: '#15803d' },
  commissionValue: { fontWeight: '700', color: '#1a3c5e' },
  monthLabel: { color: '#94a3b8', marginTop: 4 },
  countChip: { marginRight: 12, backgroundColor: '#fef3c7' },
  countChipText: { color: '#b45309' },
  lapseChip: { marginRight: 12, backgroundColor: '#fee2e2' },
  lapseChipText: { color: '#dc2626' },
  listItem: { paddingVertical: 4 },
  listTitle: { fontWeight: '600', fontSize: 14, color: '#1e293b' },
  listDescription: { fontSize: 12, color: '#64748b' },
  dueRight: { alignItems: 'flex-end', justifyContent: 'center' },
  premiumText: { fontWeight: '700', color: '#1a3c5e' },
  overdueText: { color: '#dc2626', fontWeight: '700', fontSize: 11 },
  dueText: { color: '#b45309', fontSize: 11 },
  daysLeft: { fontWeight: '800', fontSize: 14 },
  lapseDateText: { color: '#94a3b8', fontSize: 11 },
  yearRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  yearLabel: { color: '#1a3c5e', fontWeight: '700' },
  yearValues: { alignItems: 'flex-end' },
  commissionCell: { color: '#64748b' },
  grossValue: { fontWeight: '700', color: '#15803d', marginTop: 2 },
});
