import React from 'react';
import { ScrollView, View, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

export default function Screen({ children, scroll = true, style, contentStyle }: Props) {
  const Inner = scroll ? ScrollView : View;
  return (
    <SafeAreaView style={[styles.root, style]} edges={['bottom', 'left', 'right']}>
      <Inner
        style={styles.inner}
        contentContainerStyle={scroll ? [styles.content, contentStyle] : undefined}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </Inner>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f0f4f8' },
  inner: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
});
