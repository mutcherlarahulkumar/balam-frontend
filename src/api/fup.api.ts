import apiClient from '@/lib/axios';
import { FUPDueItem, UpdateFUPRequest, MultipleDue, FUPHistory } from '@/types/fup.types';

export interface FUPDueParams {
  month?: string;
  overdueDays?: number;
}

export const fupApi = {
  getDue: async (params: FUPDueParams = {}): Promise<{ data: FUPDueItem[] }> => {
    const res = await apiClient.get<{ data: FUPDueItem[] }>('/fup/due', { params });
    return res.data;
  },
  updateFUP: async (data: UpdateFUPRequest): Promise<void> => {
    await apiClient.post('/fup/update', data);
  },
  getHistory: async (
    policyNo: number,
  ): Promise<{ policyNo: number; history: FUPHistory[] }> => {
    const res =
      await apiClient.get<{ policyNo: number; history: FUPHistory[] }>(
        `/fup/history/${policyNo}`,
      );
    return res.data;
  },
  getMultipleDue: async (
    policyNo: number,
  ): Promise<{ policyNo: number; dues: MultipleDue[] }> => {
    const res =
      await apiClient.get<{ policyNo: number; dues: MultipleDue[] }>(
        `/fup/multipledue/${policyNo}`,
      );
    return res.data;
  },
};
