import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}

export default function StatCard({ title, value, subtitle, color = '#1a3c5e' }: Props) {
  return (
    <Card style={styles.card} mode="outlined">
      <Card.Content style={styles.content}>
        <Text variant="labelSmall" style={styles.label}>{title}</Text>
        <Text variant="headlineSmall" style={[styles.value, { color }]} numberOfLines={1} adjustsFontSizeToFit>
          {String(value)}
        </Text>
        {subtitle && <Text variant="labelSmall" style={styles.sub}>{subtitle}</Text>}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, backgroundColor: '#fff' },
  content: { paddingVertical: 12, paddingHorizontal: 14 },
  label: { color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  value: { fontWeight: '800', lineHeight: 32 },
  sub: { color: '#94a3b8', marginTop: 2 },
});
