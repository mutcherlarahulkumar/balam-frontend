import apiClient from '@/lib/axios';
import { SB, CreateSBRequest, MarkSBPaidRequest } from '@/types/sb.types';

export interface SBListParams {
  year?: number;
  month?: number;
  unpaidOnly?: boolean;
}

export const sbApi = {
  list: async (params: SBListParams = {}): Promise<SB[]> => {
    const res = await apiClient.get<{ data: SB[] }>('/sb', { params });
    return res.data.data;
  },
  create: async (data: CreateSBRequest): Promise<SB> => {
    const res = await apiClient.post<SB>('/sb', data);
    return res.data;
  },
  markPaid: async (id: number, data: MarkSBPaidRequest): Promise<SB> => {
    const res = await apiClient.put<SB>(`/sb/${id}/mark-paid`, data);
    return res.data;
  },
};
