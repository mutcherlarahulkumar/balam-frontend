import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  Card,
  Chip,
  Divider,
  Button,
  List,
  FAB,
  ActivityIndicator,
} from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFamily } from '@/hooks/useFamilies';
import { useClients } from '@/hooks/useClients';
import { ClientType } from '@/types/common.types';
import { Client } from '@/types/client.types';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import { SafeAreaView } from 'react-native-safe-area-context';

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

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text variant="labelSmall" style={styles.infoLabel}>{label}</Text>
      <Text variant="bodyMedium" style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function ClientRow({ client, onPress }: { client: Client; onPress: () => void }) {
  const typeLabel = CLIENT_TYPE_LABEL[client.clientType] ?? client.clientType;
  const chipBg = CLIENT_TYPE_COLOR[client.clientType] ?? '#f1f5f9';
  const chipText = CLIENT_TYPE_TEXT[client.clientType] ?? '#334155';
  return (
    <>
      <List.Item
        title={client.name}
        description={[client.persCode, client.mobile, client.occupation].filter(Boolean).join(' · ')}
        left={() => (
          <List.Icon icon="account" color="#64748b" />
        )}
        right={() => (
          <Chip compact style={[styles.typeChip, { backgroundColor: chipBg }]} textStyle={{ color: chipText, fontSize: 11 }}>
            {typeLabel}
          </Chip>
        )}
        onPress={onPress}
        style={styles.listItem}
        titleStyle={styles.listTitle}
        descriptionStyle={styles.listDesc}
      />
      <Divider />
    </>
  );
}

export default function FamilyDetailScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();

  const { data: family, isLoading: familyLoading, isError: familyError, refetch: refetchFamily } = useFamily(code ?? '');
  const { data: clientsData, isLoading: clientsLoading } = useClients({ familyCode: code ?? '' });

  const clients = clientsData?.data ?? [];

  if (familyLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (familyError || !family) {
    return (
      <SafeAreaView style={styles.center}>
        <ErrorState onRetry={refetchFamily} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['bottom', 'left', 'right']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Family Info Card */}
        <Card mode="outlined" style={styles.card}>
          <Card.Title
            title={family.headName}
            subtitle={family.familyCode}
            subtitleStyle={styles.familyCode}
            right={() => (
              <Button
                mode="outlined"
                compact
                onPress={() => router.push(`/(app)/(tabs)/families`)}
                style={styles.backBtn}
              >
                All Families
              </Button>
            )}
          />
          <Card.Content>
            <Divider style={{ marginBottom: 12 }} />
            <InfoRow label="FAMILY CODE" value={family.familyCode} />
            <InfoRow label="MOBILE" value={family.mobile} />
            <InfoRow label="EMAIL" value={family.email} />
            <InfoRow label="ADDRESS" value={family.address} />
            <InfoRow label="PINCODE" value={family.pincode} />
            <InfoRow label="RELIGION" value={family.religion} />
            <InfoRow label="DESIGNATION" value={family.designation} />
          </Card.Content>
        </Card>

        {/* Members Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>MEMBERS</Text>
          {clients.length > 0 && (
            <Chip compact style={styles.countChip} textStyle={styles.countText}>
              {clients.length}
            </Chip>
          )}
        </View>

        <Card mode="outlined" style={styles.card}>
          {clientsLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" />
            </View>
          ) : clients.length === 0 ? (
            <Card.Content>
              <EmptyState
                title="No members yet"
                message="Add clients to this family."
                icon="account-plus-outline"
              />
            </Card.Content>
          ) : (
            (clients as Client[]).map((client: Client) => (
              <ClientRow
                key={client.id}
                client={client}
                onPress={() => router.push(`/(app)/client/${client.id}`)}
              />
            ))
          )}
        </Card>

        <View style={{ height: 100 }} />
      </ScrollView>

      <FAB
        icon="account-plus"
        style={styles.fab}
        onPress={() => router.push(`/(app)/client/new?familyCode=${family.familyCode}`)}
        label="Add Member"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f0f4f8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4f8' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 16 },
  familyCode: { color: '#64748b', fontFamily: 'monospace', fontSize: 13 },
  backBtn: { marginRight: 12 },
  infoRow: { marginBottom: 10 },
  infoLabel: {
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 10,
    marginBottom: 2,
  },
  infoValue: { color: '#0d2137', fontWeight: '500' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionLabel: {
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
    fontWeight: '700',
  },
  countChip: { backgroundColor: '#e0f2fe' },
  countText: { color: '#0369a1', fontSize: 11 },
  loadingRow: { paddingVertical: 24, alignItems: 'center' },
  listItem: { paddingVertical: 4 },
  listTitle: { fontWeight: '600', fontSize: 14, color: '#0d2137' },
  listDesc: { fontSize: 12, color: '#64748b' },
  typeChip: { alignSelf: 'center', marginRight: 4 },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#1a3c5e',
  },
});
