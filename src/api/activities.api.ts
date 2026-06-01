import apiClient from '@/lib/axios';
import { Activity, CreateActivityRequest, UpdateActivityRequest } from '@/types/activity.types';

export const activitiesApi = {
  list: async (clientId?: number): Promise<Activity[]> => {
    const params = clientId ? { clientId } : {};
    const res = await apiClient.get<{ data: Activity[] }>('/activities', { params });
    return res.data.data;
  },
  create: async (data: CreateActivityRequest): Promise<Activity> => {
    const res = await apiClient.post<Activity>('/activities', data);
    return res.data;
  },
  update: async (id: number, data: UpdateActivityRequest): Promise<Activity> => {
    const res = await apiClient.put<Activity>(`/activities/${id}`, data);
    return res.data;
  },
  getToday: async (): Promise<Activity[]> => {
    const res = await apiClient.get<{ data: Activity[] }>('/activities/today');
    return res.data.data;
  },
};
