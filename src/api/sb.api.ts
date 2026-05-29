import apiClient from '@/lib/axios';
import { SB, CreateSBRequest, MarkSBPaidRequest } from '@/types/sb.types';

export interface SBListParams {
  year?: string;
  unpaidOnly?: boolean;
}

export const sbApi = {
  list: async (params: SBListParams = {}): Promise<SB[]> => {
    const res = await apiClient.get<SB[]>('/sb', { params });
    return res.data;
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
