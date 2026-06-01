import apiClient from '@/lib/axios';
import { Lead, CreateLeadRequest } from '@/types/lead.types';

export const leadsApi = {
  list: async (): Promise<Lead[]> => {
    const res = await apiClient.get<{ data: Lead[] }>('/leads');
    return res.data.data;
  },
  create: async (data: CreateLeadRequest): Promise<Lead> => {
    const res = await apiClient.post<Lead>('/leads', data);
    return res.data;
  },
  update: async (id: number, data: Partial<CreateLeadRequest>): Promise<Lead> => {
    const res = await apiClient.put<Lead>(`/leads/${id}`, data);
    return res.data;
  },
};
