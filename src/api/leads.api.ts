import apiClient from '@/lib/axios';
import { Lead, CreateLeadRequest } from '@/types/lead.types';

export const leadsApi = {
  list: async (): Promise<Lead[]> => {
    const res = await apiClient.get<Lead[]>('/leads');
    return res.data;
  },
  create: async (data: CreateLeadRequest): Promise<Lead> => {
    const res = await apiClient.post<Lead>('/leads', data);
    return res.data;
  },
};
