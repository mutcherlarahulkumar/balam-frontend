import apiClient from '@/lib/axios';
import { Plan } from '@/types/plan.types';

export interface PlanListParams {
  type?: string;
  search?: string;
}

export const plansApi = {
  list: async (params: PlanListParams = {}): Promise<{ data: Plan[] }> => {
    const res = await apiClient.get<{ data: Plan[] }>('/plans', { params });
    return res.data;
  },
};
