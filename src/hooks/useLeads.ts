import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi } from '@/api/leads.api';
import { CreateLeadRequest } from '@/types/lead.types';

export const LEAD_KEYS = {
  all: ['leads'] as const,
};

export function useLeads() {
  return useQuery({
    queryKey: LEAD_KEYS.all,
    queryFn: () => leadsApi.list(),
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLeadRequest) => leadsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: LEAD_KEYS.all }),
  });
}

export function useUpdateLead(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreateLeadRequest>) => leadsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: LEAD_KEYS.all }),
  });
}
