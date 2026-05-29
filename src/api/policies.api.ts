import apiClient from '@/lib/axios';
import {
  PolicyListItem,
  CreatePolicyRequest,
  UpdatePolicyRequest,
  PolicyFilters,
} from '@/types/policy.types';
import { PaginatedResponse } from '@/types/common.types';

export const policiesApi = {
  list: async (params: PolicyFilters = {}): Promise<PaginatedResponse<PolicyListItem>> => {
    const res = await apiClient.get<PaginatedResponse<PolicyListItem>>('/policies', { params });
    return res.data;
  },
  create: async (data: CreatePolicyRequest): Promise<PolicyListItem> => {
    const res = await apiClient.post<PolicyListItem>('/policies', data);
    return res.data;
  },
  getByNo: async (policyNo: number): Promise<PolicyListItem> => {
    const res = await apiClient.get<PolicyListItem>(`/policies/${policyNo}`);
    return res.data;
  },
  update: async (policyNo: number, data: UpdatePolicyRequest): Promise<PolicyListItem> => {
    const res = await apiClient.put<PolicyListItem>(`/policies/${policyNo}`, data);
    return res.data;
  },
};
