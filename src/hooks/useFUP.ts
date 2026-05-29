import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fupApi, FUPDueParams } from '@/api/fup.api';
import { UpdateFUPRequest } from '@/types/fup.types';
import { POLICY_KEYS } from './usePolicies';

export const FUP_KEYS = {
  due: (params: FUPDueParams) => ['fup', 'due', params] as const,
  history: (policyNo: number) => ['fup', 'history', policyNo] as const,
  multipleDue: (policyNo: number) => ['fup', 'multipleDue', policyNo] as const,
};

export function useFUPDue(params: FUPDueParams = {}) {
  return useQuery({
    queryKey: FUP_KEYS.due(params),
    queryFn: () => fupApi.getDue(params),
  });
}

export function useFUPHistory(policyNo: number) {
  return useQuery({
    queryKey: FUP_KEYS.history(policyNo),
    queryFn: () => fupApi.getHistory(policyNo),
    enabled: !!policyNo,
  });
}

export function useMultipleDue(policyNo: number) {
  return useQuery({
    queryKey: FUP_KEYS.multipleDue(policyNo),
    queryFn: () => fupApi.getMultipleDue(policyNo),
    enabled: !!policyNo,
  });
}

export function useUpdateFUP() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateFUPRequest) => fupApi.updateFUP(data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: FUP_KEYS.due({}) });
      qc.invalidateQueries({ queryKey: FUP_KEYS.history(variables.policyNo) });
      qc.invalidateQueries({ queryKey: POLICY_KEYS.detail(variables.policyNo) });
    },
  });
}
