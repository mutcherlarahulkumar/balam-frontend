import apiClient from '@/lib/axios';
import { Family, FamilyListItem, FamilyDetail, CreateFamilyRequest } from '@/types/family.types';
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
  create: async (data: CreateFamilyRequest): Promise<{ message: string; familyCode: string }> => {
    const res = await apiClient.post<{ message: string; familyCode: string }>('/families', data);
    return res.data;
  },
  getByCode: async (familyCode: string): Promise<FamilyDetail> => {
    const res = await apiClient.get<FamilyDetail>(`/families/${familyCode}`);
    return res.data;
  },
  update: async (familyCode: string, data: Omit<CreateFamilyRequest, 'familyCode'>): Promise<{ message: string }> => {
    const res = await apiClient.put<{ message: string }>(`/families/${familyCode}`, data);
    return res.data;
  },
};
