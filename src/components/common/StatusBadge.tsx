import React from 'react';
import { StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { PolicyStatus, FUPStatus } from '@/types/common.types';

const POLICY_STATUS: Record<string, { label: string; bg: string; text: string }> = {
  IF: { label: 'In Force', bg: '#dcfce7', text: '#15803d' },
  LA: { label: 'Lapsed', bg: '#fee2e2', text: '#dc2626' },
  PU: { label: 'Paid Up', bg: '#fef3c7', text: '#b45309' },
  SU: { label: 'Surrendered', bg: '#f1f5f9', text: '#475569' },
  MA: { label: 'Matured', bg: '#e0e7ff', text: '#4338ca' },
  CL: { label: 'Claim', bg: '#fdf4ff', text: '#7c3aed' },
  EX: { label: 'Expired', bg: '#f1f5f9', text: '#64748b' },
};

const FUP_STATUS: Record<string, { label: string; bg: string; text: string }> = {
  PAID: { label: 'Paid', bg: '#dcfce7', text: '#15803d' },
  DUE: { label: 'Due', bg: '#fef3c7', text: '#b45309' },
  OVERDUE: { label: 'Overdue', bg: '#fee2e2', text: '#dc2626' },
  LAPSED: { label: 'Lapsed', bg: '#fef2f2', text: '#991b1b' },
};

export function PolicyStatusBadge({ status }: { status: PolicyStatus }) {
  const cfg = POLICY_STATUS[status] ?? { label: status, bg: '#f1f5f9', text: '#475569' };
  return (
    <Chip compact style={[styles.chip, { backgroundColor: cfg.bg }]} textStyle={{ color: cfg.text, fontSize: 11 }}>
      {cfg.label}
    </Chip>
  );
}

export function FUPStatusBadge({ status }: { status: FUPStatus }) {
  const cfg = FUP_STATUS[status] ?? { label: status, bg: '#f1f5f9', text: '#475569' };
  return (
    <Chip compact style={[styles.chip, { backgroundColor: cfg.bg }]} textStyle={{ color: cfg.text, fontSize: 11 }}>
      {cfg.label}
    </Chip>
  );
}

const styles = StyleSheet.create({
  chip: { height: 24, justifyContent: 'center' },
});
