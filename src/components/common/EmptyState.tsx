import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Icon } from 'react-native-paper';

interface Props {
  title: string;
  message?: string;
  icon?: string;
  action?: { label: string; onPress: () => void };
}

export default function EmptyState({ title, message, icon = 'inbox-outline', action }: Props) {
  return (
    <View style={styles.root}>
      <Icon source={icon} size={56} color="#94a3b8" />
      <Text variant="titleMedium" style={styles.title}>{title}</Text>
      {message && <Text variant="bodyMedium" style={styles.sub}>{message}</Text>}
      {action && (
        <Button mode="contained" onPress={action.onPress} style={styles.btn}>{action.label}</Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 12 },
  title: { fontWeight: '700', color: '#334155' },
  sub: { color: '#64748b', textAlign: 'center' },
  btn: { marginTop: 8 },
});
