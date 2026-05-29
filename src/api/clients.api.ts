import apiClient from '@/lib/axios';
import { Client, CreateClientRequest } from '@/types/client.types';
import { PaginatedResponse, ClientType } from '@/types/common.types';

export interface ClientListParams {
  search?: string;
  familyCode?: string;
  clientType?: ClientType;
  page?: number;
  limit?: number;
}

export const clientsApi = {
  list: async (params: ClientListParams = {}): Promise<PaginatedResponse<Client>> => {
    const res = await apiClient.get<PaginatedResponse<Client>>('/clients', { params });
    return res.data;
  },
  create: async (data: CreateClientRequest): Promise<Client> => {
    const res = await apiClient.post<Client>('/clients', data);
    return res.data;
  },
  getById: async (id: number): Promise<Client> => {
    const res = await apiClient.get<Client>(`/clients/${id}`);
    return res.data;
  },
  update: async (id: number, data: CreateClientRequest): Promise<Client> => {
    const res = await apiClient.put<Client>(`/clients/${id}`, data);
    return res.data;
  },
  search: async (q: string): Promise<Client[]> => {
    const res = await apiClient.get<Client[]>('/clients/search', { params: { q } });
    return res.data;
  },
};
