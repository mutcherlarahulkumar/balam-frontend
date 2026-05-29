import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsApi, ClientListParams } from '@/api/clients.api';
import { CreateClientRequest } from '@/types/client.types';

export const CLIENT_KEYS = {
  all: ['clients'] as const,
  list: (params: ClientListParams) => ['clients', 'list', params] as const,
  detail: (id: number) => ['clients', 'detail', id] as const,
  search: (q: string) => ['clients', 'search', q] as const,
};

export function useClients(params: ClientListParams = {}) {
  return useQuery({
    queryKey: CLIENT_KEYS.list(params),
    queryFn: () => clientsApi.list(params),
  });
}

export function useClient(id: number) {
  return useQuery({
    queryKey: CLIENT_KEYS.detail(id),
    queryFn: () => clientsApi.getById(id),
    enabled: !!id,
  });
}

export function useClientSearch(q: string) {
  return useQuery({
    queryKey: CLIENT_KEYS.search(q),
    queryFn: () => clientsApi.search(q),
    enabled: q.length >= 2,
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClientRequest) => clientsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLIENT_KEYS.all }),
  });
}

export function useUpdateClient(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClientRequest) => clientsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CLIENT_KEYS.all });
      qc.invalidateQueries({ queryKey: CLIENT_KEYS.detail(id) });
    },
  });
}
