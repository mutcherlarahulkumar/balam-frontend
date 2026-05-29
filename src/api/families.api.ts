import apiClient from '@/lib/axios';
import { Family, FamilyListItem, CreateFamilyRequest } from '@/types/family.types';
import { PaginatedResponse } from '@/types/common.types';

export interface FamilyListParams {
  search?: string;
  page?: number;
  limit?: number;
}

export const familiesApi = {
  list: async (params: FamilyListParams = {}): Promise<PaginatedResponse<FamilyListItem>> => {
    const res = await apiClient.get<PaginatedResponse<FamilyListItem>>('/families', { params });
    return res.data;
  },
  create: async (data: CreateFamilyRequest): Promise<Family> => {
    const res = await apiClient.post<Family>('/families', data);
    return res.data;
  },
  getByCode: async (familyCode: string): Promise<Family> => {
    const res = await apiClient.get<Family>(`/families/${familyCode}`);
    return res.data;
  },
  update: async (familyCode: string, data: CreateFamilyRequest): Promise<Family> => {
    const res = await apiClient.put<Family>(`/families/${familyCode}`, data);
    return res.data;
  },
};
