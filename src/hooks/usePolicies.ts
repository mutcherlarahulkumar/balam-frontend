import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { policiesApi } from '@/api/policies.api';
import {
  CreatePolicyRequest,
  UpdatePolicyRequest,
  PolicyFilters,
} from '@/types/policy.types';

export const POLICY_KEYS = {
  all: ['policies'] as const,
  list: (params: PolicyFilters) => ['policies', 'list', params] as const,
  detail: (no: number) => ['policies', 'detail', no] as const,
};

export function usePolicies(params: PolicyFilters = {}) {
  return useQuery({
    queryKey: POLICY_KEYS.list(params),
    queryFn: () => policiesApi.list(params),
  });
}

export function usePolicy(policyNo: number) {
  return useQuery({
    queryKey: POLICY_KEYS.detail(policyNo),
    queryFn: () => policiesApi.getByNo(policyNo),
    enabled: !!policyNo,
  });
}

export function useCreatePolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePolicyRequest) => policiesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: POLICY_KEYS.all }),
  });
}

export function useUpdatePolicy(policyNo: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePolicyRequest) => policiesApi.update(policyNo, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: POLICY_KEYS.all });
      qc.invalidateQueries({ queryKey: POLICY_KEYS.detail(policyNo) });
    },
  });
}
