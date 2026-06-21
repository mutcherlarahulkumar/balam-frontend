import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Text,
  Card,
  Button,
  TextInput,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { useMutation } from '@tanstack/react-query';
import Screen from '@/components/common/Screen';
import apiClient from '@/lib/axios';
import { useToast } from '@/hooks/useToast';
import { GSTCalculateResponse } from '@/types/gst.types';
import { formatCurrency } from '@/utils/currency';

export default function GSTScreen() {
  const toast = useToast();
  const [policyNo, setPolicyNo] = useState('');
  const [result, setResult] = useState<GSTCalculateResponse | null>(null);

  const gstMutation = useMutation({
    mutationFn: async (no: number) => {
      const res = await apiClient.get<GSTCalculateResponse>('/gst/calculate', {
        params: { policyNo: no },
      });
      return res.data;
    },
    onSuccess: (data) => {
      setResult(data);
    },
    onError: () => {
      toast.error('Failed to calculate GST. Check the policy number.');
      setResult(null);
    },
  });

  function handleCalculate() {
    const no = parseInt(policyNo, 10);
    if (!policyNo.trim() || isNaN(no) || no < 100000000) {
      toast.error('Enter a valid 9-digit policy number');
      return;
    }
    setResult(null);
    gstMutation.mutate(no);
  }

  return (
    <Screen>
      <Text variant="headlineSmall" style={styles.heading}>GST Calculator</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Enter a policy number to calculate GST on the premium.
      </Text>

      <Card style={styles.searchCard} mode="outlined">
        <Card.Content>
          <TextInput
            label="Policy Number"
            mode="outlined"
            keyboardType="numeric"
            placeholder="Enter 9-digit policy number"
            value={policyNo}
            onChangeText={setPolicyNo}
            style={styles.input}
          />
          <Button
            mode="contained"
            onPress={handleCalculate}
            loading={gstMutation.isPending}
            disabled={gstMutation.isPending}
            style={styles.calcButton}
            contentStyle={styles.calcButtonContent}
          >
            Calculate GST
          </Button>
        </Card.Content>
      </Card>

      {gstMutation.isPending && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#1a3c5e" />
          <Text variant="bodyMedium" style={styles.loaderText}>Calculating...</Text>
        </View>
      )}

      {result && !gstMutation.isPending && (
        <Card style={styles.resultCard} mode="outlined">
          <Card.Title
            title="GST Calculation Result"
            titleStyle={styles.resultTitle}
          />
          <Card.Content>
            <View style={styles.resultRow}>
              <Text variant="labelMedium" style={styles.resultLabel}>Policy No</Text>
              <Text variant="bodyMedium" style={styles.resultValue}>{result.policyNo}</Text>
            </View>
            <Divider style={styles.divider} />

            <View style={styles.resultRow}>
              <Text variant="labelMedium" style={styles.resultLabel}>Plan</Text>
              <Text variant="bodyMedium" style={styles.resultValue}>
                {result.planNo} · {result.planType}
              </Text>
            </View>
            <Divider style={styles.divider} />

            <View style={styles.resultRow}>
              <Text variant="labelMedium" style={styles.resultLabel}>Base Premium</Text>
              <Text variant="bodyMedium" style={styles.resultValue}>
                {formatCurrency(result.basePremium)}
              </Text>
            </View>
            <Divider style={styles.divider} />

            <View style={styles.resultRow}>
              <Text variant="labelMedium" style={styles.resultLabel}>GST Rate</Text>
              <Text variant="bodyMedium" style={styles.resultValue}>{result.gstRate}%</Text>
            </View>
            <Divider style={styles.divider} />

            <View style={styles.resultRow}>
              <Text variant="labelMedium" style={styles.resultLabel}>GST Amount</Text>
              <Text variant="bodyMedium" style={[styles.resultValue, styles.gstAmount]}>
                {formatCurrency(result.gstAmount)}
              </Text>
            </View>
            <Divider style={styles.divider} />

            <View style={[styles.resultRow, styles.totalRow]}>
              <Text variant="titleSmall" style={styles.totalLabel}>Total Premium</Text>
              <Text variant="titleMedium" style={styles.totalValue}>
                {formatCurrency(result.totalPremium)}
              </Text>
            </View>

            {!!result.regulation && (
              <>
                <Divider style={styles.divider} />
                <Text variant="bodySmall" style={styles.regulation}>
                  Regulation: {result.regulation}
                </Text>
              </>
            )}
            {!!result.historicalNote && (
              <Text variant="bodySmall" style={styles.note}>
                Note: {result.historicalNote}
              </Text>
            )}
          </Card.Content>
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { fontWeight: '800', color: '#0d2137', marginBottom: 4 },
  subtitle: { color: '#64748b', marginBottom: 20 },
  searchCard: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 16 },
  input: { marginBottom: 12 },
  calcButton: { backgroundColor: '#1a3c5e' },
  calcButtonContent: { paddingVertical: 4 },
  loaderContainer: { alignItems: 'center', paddingVertical: 32, gap: 12 },
  loaderText: { color: '#64748b' },
  resultCard: { backgroundColor: '#fff', borderRadius: 12 },
  resultTitle: { fontWeight: '700', color: '#1a3c5e' },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  resultLabel: { color: '#64748b', flex: 1 },
  resultValue: { color: '#1e293b', fontWeight: '600', textAlign: 'right', flex: 1 },
  gstAmount: { color: '#b45309' },
  totalRow: { paddingVertical: 8, marginTop: 4 },
  totalLabel: { color: '#1a3c5e', fontWeight: '700' },
  totalValue: { color: '#15803d', fontWeight: '800' },
  divider: { marginVertical: 2 },
  regulation: { color: '#64748b', marginTop: 8 },
  note: { color: '#94a3b8', marginTop: 4, fontStyle: 'italic' },
});
