import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  Card,
  Chip,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useClient } from '@/hooks/useClients';
import { Client } from '@/types/client.types';
import { ClientType, Sex } from '@/types/common.types';
import { SafeAreaView } from 'react-native-safe-area-context';
import ErrorState from '@/components/common/ErrorState';

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
const SEX_LABEL: Record<Sex, string> = { M: 'Male', F: 'Female', O: 'Other' };

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text variant="bodyMedium" style={styles.infoValue}>{String(value)}</Text>
    </View>
  );
}

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: client, isLoading, isError, refetch } = useClient(Number(id));

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (isError || !client) {
    return (
      <SafeAreaView style={styles.center}>
        <ErrorState onRetry={refetch} />
      </SafeAreaView>
    );
  }

  const typedClient = client as Client;
  const typeLabel = CLIENT_TYPE_LABEL[typedClient.clientType] ?? typedClient.clientType;
  const chipBg = CLIENT_TYPE_COLOR[typedClient.clientType] ?? '#f1f5f9';
  const chipText = CLIENT_TYPE_TEXT[typedClient.clientType] ?? '#334155';
  const sexLabel = typedClient.sex ? SEX_LABEL[typedClient.sex] : undefined;

  return (
    <SafeAreaView style={styles.root} edges={['bottom', 'left', 'right']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Text variant="headlineMedium" style={styles.clientName}>{client.name}</Text>
          <Chip
            style={[styles.typeChip, { backgroundColor: chipBg }]}
            textStyle={{ color: chipText }}
          >
            {typeLabel}
          </Chip>
        </View>

        {/* Identity Card */}
        <Card mode="outlined" style={styles.card}>
          <Card.Title title="Identity" />
          <Card.Content>
            <Divider style={{ marginBottom: 12 }} />
            <InfoRow label="FAMILY CODE" value={client.familyCode} />
            <InfoRow label="PERSON CODE" value={client.persCode} />
            <InfoRow label="AGE" value={client.age != null ? `${client.age} years` : null} />
            <InfoRow label="DATE OF BIRTH" value={client.dob} />
            <InfoRow label="SEX" value={sexLabel} />
          </Card.Content>
        </Card>

        {/* Contact Card */}
        <Card mode="outlined" style={styles.card}>
          <Card.Title title="Contact" />
          <Card.Content>
            <Divider style={{ marginBottom: 12 }} />
            <InfoRow label="MOBILE" value={client.mobile} />
            <InfoRow label="EMAIL" value={client.email} />
            <InfoRow label="ADDRESS" value={client.address} />
          </Card.Content>
        </Card>

        {/* Professional Card */}
        <Card mode="outlined" style={styles.card}>
          <Card.Title title="Professional" />
          <Card.Content>
            <Divider style={{ marginBottom: 12 }} />
            <InfoRow label="OCCUPATION" value={client.occupation} />
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f0f4f8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4f8' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
    flexWrap: 'wrap',
  },
  clientName: { fontWeight: '800', color: '#0d2137', flex: 1 },
  typeChip: {},
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 16 },
  infoRow: { marginBottom: 12 },
  infoLabel: {
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 2,
  },
  infoValue: { color: '#0d2137', fontWeight: '500' },
});
