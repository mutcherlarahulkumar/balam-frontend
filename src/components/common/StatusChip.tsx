import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { PolicyStatus, FUPStatus } from '@/types/common.types';

const POLICY_STATUS_MAP: Record<PolicyStatus, { label: string; color: ChipProps['color'] }> = {
  IF: { label: 'In Force', color: 'success' },
  LA: { label: 'Lapsed', color: 'error' },
  PU: { label: 'Paid Up', color: 'warning' },
  SU: { label: 'Surrendered', color: 'default' },
  MA: { label: 'Matured', color: 'info' },
  CL: { label: 'Claim', color: 'secondary' },
  EX: { label: 'Extended', color: 'default' },
};

const FUP_STATUS_MAP: Record<FUPStatus, { label: string; color: ChipProps['color'] }> = {
  PAID: { label: 'Paid', color: 'success' },
  DUE: { label: 'Due', color: 'warning' },
  OVERDUE: { label: 'Overdue', color: 'error' },
  LAPSED: { label: 'Lapsed', color: 'error' },
};

interface PolicyStatusChipProps {
  status: PolicyStatus;
  size?: ChipProps['size'];
}

export function PolicyStatusChip({ status, size = 'small' }: PolicyStatusChipProps) {
  const cfg = POLICY_STATUS_MAP[status] ?? { label: status, color: 'default' as const };
  return <Chip label={cfg.label} color={cfg.color} size={size} />;
}

interface FUPStatusChipProps {
  status: FUPStatus;
  size?: ChipProps['size'];
}

export function FUPStatusChip({ status, size = 'small' }: FUPStatusChipProps) {
  const cfg = FUP_STATUS_MAP[status] ?? { label: status, color: 'default' as const };
  return <Chip label={cfg.label} color={cfg.color} size={size} />;
}
