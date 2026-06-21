import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Divider } from 'react-native-paper';

export default function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.root}>
      <Text variant="labelSmall" style={styles.label}>{title.toUpperCase()}</Text>
      <Divider style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { marginBottom: 12 },
  label: { color: '#64748b', letterSpacing: 1, marginBottom: 6 },
  divider: {},
});
