import apiClient from '@/lib/axios';
import {
  Commission,
  CreateCommissionRequest,
  CommissionSummary,
  CommissionCalculateResponse,
} from '@/types/commission.types';

export interface CommissionListParams {
  year?: number;
  month?: number;
}

export const commissionApi = {
  list: async (params: CommissionListParams = {}): Promise<Commission[]> => {
    const res = await apiClient.get<{ data: Commission[] }>('/commission', { params });
    return res.data.data;
  },
  create: async (data: CreateCommissionRequest): Promise<Commission> => {
    const res = await apiClient.post<Commission>('/commission', data);
    return res.data;
  },
  getSummary: async (): Promise<CommissionSummary> => {
    const res = await apiClient.get<CommissionSummary>('/commission/summary');
    return res.data;
  },
  calculate: async (policyNo: number, year = 1): Promise<CommissionCalculateResponse> => {
    const res = await apiClient.get<CommissionCalculateResponse>('/commission/calculate', {
      params: { policyNo, year },
    });
    return res.data;
  },
};
