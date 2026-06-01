import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import {
  Text,
  Card,
  Searchbar,
  FAB,
  Chip,
  SegmentedButtons,
  ActivityIndicator,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useClients } from '@/hooks/useClients';
import { ClientType } from '@/types/common.types';
import { Client } from '@/types/client.types';
import Screen from '@/components/common/Screen';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';

type FilterType = '' | ClientType;

const CLIENT_TYPE_LABEL: Record<ClientType, string> = { C: 'Client', P: 'Proposer', N: 'Nominee' };
const CLIENT_TYPE_COLOR: Record<ClientType, string> = {
  C: '#dbeafe',
  P: '#dcfce7',
  N: '#fef3c7',
};
const CLIENT_TYPE_TEXT: Record<ClientType, string> = {
  C: '#1e40af',
  P: '#15803d',
  N: '#b45309',
};

function ClientCard({ client, onPress }: { client: Client; onPress: () => void }) {
  const typeLabel = CLIENT_TYPE_LABEL[client.clientType] ?? client.clientType;
  const chipBg = CLIENT_TYPE_COLOR[client.clientType] ?? '#f1f5f9';
  const chipText = CLIENT_TYPE_TEXT[client.clientType] ?? '#334155';
  return (
    <Card mode="outlined" style={styles.card} onPress={onPress}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.cardRow}>
          <View style={styles.cardInfo}>
            <Text variant="titleMedium" style={styles.clientName}>{client.name}</Text>
            <Text variant="bodySmall" style={styles.codes}>
              {client.familyCode} / {client.persCode}
            </Text>
            {client.mobile ? (
              <Text variant="bodySmall" style={styles.meta}>{client.mobile}</Text>
            ) : null}
          </View>
          <Chip
            compact
            style={[styles.typeChip, { backgroundColor: chipBg }]}
            textStyle={{ color: chipText, fontSize: 11 }}
          >
            {typeLabel}
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );
}

export default function ClientsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('');

  const { data, isLoading, isError, refetch } = useClients({
    search: search || undefined,
    clientType: filter || undefined,
  });

  const clients = data?.data ?? [];

  const renderItem = useCallback(
    ({ item }: { item: Client }) => (
      <ClientCard
        client={item}
        onPress={() => router.push(`/(app)/client/${item.id}`)}
      />
    ),
    [router],
  );

  const renderHeader = () => (
    <View>
      <Searchbar
        placeholder="Search clients..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchbar}
        inputStyle={styles.searchInput}
      />
      <SegmentedButtons
        value={filter}
        onValueChange={(v) => setFilter(v as FilterType)}
        style={styles.segmented}
        buttons={[
          { value: '', label: 'All' },
          { value: 'C', label: 'Client' },
          { value: 'P', label: 'Proposer' },
          { value: 'N', label: 'Nominee' },
        ]}
      />
      {isLoading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" />
        </View>
      )}
      {isError && !isLoading && <ErrorState onRetry={refetch} />}
      {!isLoading && !isError && clients.length === 0 && (
        <EmptyState
          title="No clients found"
          message={search || filter ? 'Try adjusting your filters.' : 'Add your first client using the + button.'}
          icon="account-outline"
        />
      )}
    </View>
  );

  return (
    <Screen scroll={false} style={styles.root}>
      <View style={styles.titleRow}>
        <Text variant="headlineSmall" style={styles.pageTitle}>Clients</Text>
        {data?.total != null && (
          <Chip style={styles.totalChip} textStyle={styles.totalChipText}>{data.total}</Chip>
        )}
      </View>

      <FlatList
        data={clients}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/(app)/client/new')}
        label="Add Client"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
    gap: 8,
  },
  pageTitle: { fontWeight: '800', color: '#0d2137', flex: 1 },
  totalChip: { backgroundColor: '#dbeafe' },
  totalChipText: { color: '#1e40af', fontSize: 12 },
  searchbar: { marginHorizontal: 16, marginBottom: 8, backgroundColor: '#fff', elevation: 0 },
  searchInput: { fontSize: 14 },
  segmented: { marginHorizontal: 16, marginBottom: 12 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  loadingRow: { paddingVertical: 32, alignItems: 'center' },
  sep: { height: 8 },
  card: { backgroundColor: '#fff', borderRadius: 12 },
  cardContent: { paddingVertical: 12 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardInfo: { flex: 1 },
  clientName: { fontWeight: '700', color: '#0d2137' },
  codes: { color: '#64748b', marginTop: 2, fontFamily: 'monospace', fontSize: 12 },
  meta: { color: '#475569', marginTop: 2 },
  typeChip: { alignSelf: 'center' },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#1a3c5e',
  },
});
