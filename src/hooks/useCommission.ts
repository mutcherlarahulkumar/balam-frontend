import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commissionApi, CommissionListParams } from '@/api/commission.api';
import { CreateCommissionRequest } from '@/types/commission.types';

export const COMMISSION_KEYS = {
  all: ['commission'] as const,
  list: (params: CommissionListParams) => ['commission', 'list', params] as const,
  summary: ['commission', 'summary'] as const,
  calculate: (policyNo: number, year: number) =>
    ['commission', 'calculate', policyNo, year] as const,
};

export function useCommissions(params: CommissionListParams = {}) {
  return useQuery({
    queryKey: COMMISSION_KEYS.list(params),
    queryFn: () => commissionApi.list(params),
  });
}

export function useCommissionSummary() {
  return useQuery({
    queryKey: COMMISSION_KEYS.summary,
    queryFn: () => commissionApi.getSummary(),
  });
}

export function useCommissionCalculate(policyNo: number, year = 1) {
  return useQuery({
    queryKey: COMMISSION_KEYS.calculate(policyNo, year),
    queryFn: () => commissionApi.calculate(policyNo, year),
    enabled: !!policyNo,
  });
}

export function useCreateCommission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCommissionRequest) => commissionApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: COMMISSION_KEYS.all }),
  });
}
