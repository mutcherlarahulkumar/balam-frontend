import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sbApi, SBListParams } from '@/api/sb.api';
import { CreateSBRequest, MarkSBPaidRequest } from '@/types/sb.types';

export const SB_KEYS = {
  all: ['sb'] as const,
  list: (params: SBListParams) => ['sb', 'list', params] as const,
};

export function useSBList(params: SBListParams = {}) {
  return useQuery({
    queryKey: SB_KEYS.list(params),
    queryFn: () => sbApi.list(params),
  });
}

export function useCreateSB() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSBRequest) => sbApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: SB_KEYS.all }),
  });
}

export function useMarkSBPaid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: MarkSBPaidRequest }) =>
      sbApi.markPaid(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: SB_KEYS.all }),
  });
}
