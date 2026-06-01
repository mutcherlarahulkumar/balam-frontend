import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, List, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Screen from '@/components/common/Screen';
import { useAuth } from '@/context/AuthContext';

interface MenuItem {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  color: string;
}

const MENU_SECTIONS: Array<{ section: string; items: MenuItem[] }> = [
  {
    section: 'CLIENTS & FAMILIES',
    items: [
      {
        title: 'Clients',
        description: 'Manage all your clients',
        icon: 'people',
        route: '/(app)/(tabs)/clients',
        color: '#2d6a9f',
      },
    ],
  },
  {
    section: 'FINANCE',
    items: [
      {
        title: 'Commission',
        description: 'View earnings and commission summary',
        icon: 'cash',
        route: '/(app)/(tabs)/commission',
        color: '#15803d',
      },
      {
        title: 'Loans',
        description: 'Policy loans and advances',
        icon: 'wallet',
        route: '/(app)/(tabs)/loans',
        color: '#0369a1',
      },
      {
        title: 'SB / Maturity',
        description: 'Survival benefits and maturity',
        icon: 'trending-up',
        route: '/(app)/(tabs)/sb',
        color: '#7c3aed',
      },
      {
        title: 'GST',
        description: 'GST reports and details',
        icon: 'receipt',
        route: '/(app)/(tabs)/gst',
        color: '#b45309',
      },
    ],
  },
  {
    section: 'SALES & CRM',
    items: [
      {
        title: 'Leads',
        description: 'Manage prospects and leads',
        icon: 'person-add',
        route: '/(app)/(tabs)/leads',
        color: '#0891b2',
      },
      {
        title: 'Activities',
        description: 'Calls, meetings, and follow-ups',
        icon: 'calendar',
        route: '/(app)/(tabs)/activities',
        color: '#d97706',
      },
    ],
  },
  {
    section: 'REPORTS',
    items: [
      {
        title: 'Reports',
        description: 'Business reports and analytics',
        icon: 'bar-chart',
        route: '/(app)/(tabs)/reports',
        color: '#1a3c5e',
      },
    ],
  },
  {
    section: 'ACCOUNT',
    items: [
      {
        title: 'Profile',
        description: 'View and edit your profile',
        icon: 'person-circle',
        route: '/(app)/(tabs)/profile',
        color: '#475569',
      },
    ],
  },
];

export default function MoreScreen() {
  const router = useRouter();
  const { agent } = useAuth();

  return (
    <Screen>
      {/* Agent card */}
      <Card mode="outlined" style={styles.agentCard}>
        <Card.Content style={styles.agentContent}>
          <View style={styles.agentAvatar}>
            <Ionicons name="person" size={32} color="#fff" />
          </View>
          <View style={styles.agentInfo}>
            <Text variant="titleMedium" style={styles.agentName}>{agent?.name ?? '—'}</Text>
            <Text variant="bodySmall" style={styles.agentMeta}>
              {[agent?.agentCode, agent?.branch, agent?.club].filter(Boolean).join(' · ')}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Menu sections */}
      {MENU_SECTIONS.map((section) => (
        <View key={section.section}>
          <Text style={styles.sectionLabel}>{section.section}</Text>
          <Card mode="outlined" style={styles.card}>
            {section.items.map((item, idx) => (
              <React.Fragment key={item.title}>
                {idx > 0 && <Divider />}
                <List.Item
                  title={item.title}
                  description={item.description}
                  left={() => (
                    <View style={[styles.iconBox, { backgroundColor: item.color + '18' }]}>
                      <Ionicons name={item.icon} size={22} color={item.color} />
                    </View>
                  )}
                  right={() => (
                    <Ionicons name="chevron-forward" size={18} color="#94a3b8" style={styles.chevron} />
                  )}
                  onPress={() => router.push(item.route as any)}
                  style={styles.listItem}
                  titleStyle={styles.listTitle}
                  descriptionStyle={styles.listDesc}
                />
              </React.Fragment>
            ))}
          </Card>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  agentCard: { backgroundColor: '#1a3c5e', borderRadius: 16, marginBottom: 20, borderColor: '#1a3c5e' },
  agentContent: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16 },
  agentAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  agentInfo: { flex: 1 },
  agentName: { fontWeight: '700', color: '#fff' },
  agentMeta: { color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  sectionLabel: {
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 4,
  },
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 16 },
  listItem: { paddingVertical: 6 },
  listTitle: { fontWeight: '600', color: '#0d2137', fontSize: 15 },
  listDesc: { fontSize: 12, color: '#64748b' },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginLeft: 4,
    marginRight: 4,
  },
  chevron: { alignSelf: 'center' },
});
