import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { familiesApi, FamilyListParams } from '@/api/families.api';
import { CreateFamilyRequest } from '@/types/family.types';

export const FAMILY_KEYS = {
  all: ['families'] as const,
  list: (params: FamilyListParams) => ['families', 'list', params] as const,
  detail: (code: string) => ['families', 'detail', code] as const,
};

export function useFamilies(params: FamilyListParams = {}) {
  return useQuery({
    queryKey: FAMILY_KEYS.list(params),
    queryFn: () => familiesApi.list(params),
  });
}

export function useFamily(familyCode: string) {
  return useQuery({
    queryKey: FAMILY_KEYS.detail(familyCode),
    queryFn: () => familiesApi.getByCode(familyCode),
    enabled: !!familyCode,
  });
}

export function useCreateFamily() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFamilyRequest) => familiesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: FAMILY_KEYS.all }),
  });
}

export function useUpdateFamily(familyCode: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFamilyRequest) => familiesApi.update(familyCode, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FAMILY_KEYS.all });
      qc.invalidateQueries({ queryKey: FAMILY_KEYS.detail(familyCode) });
    },
  });
}
