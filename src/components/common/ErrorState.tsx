import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Icon } from 'react-native-paper';

interface Props { onRetry?: () => void }

export default function ErrorState({ onRetry }: Props) {
  return (
    <View style={styles.root}>
      <Icon source="alert-circle-outline" size={48} color="#ba1a1a" />
      <Text variant="titleMedium" style={styles.title}>Something went wrong</Text>
      <Text variant="bodyMedium" style={styles.sub}>Could not load data. Check your connection.</Text>
      {onRetry && <Button mode="contained" onPress={onRetry} style={styles.btn}>Try Again</Button>}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 12 },
  title: { fontWeight: '700' },
  sub: { color: '#555', textAlign: 'center' },
  btn: { marginTop: 8 },
});
