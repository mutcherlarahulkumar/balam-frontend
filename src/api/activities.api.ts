import apiClient from '@/lib/axios';
import { Activity, CreateActivityRequest } from '@/types/activity.types';

export const activitiesApi = {
  list: async (clientId?: number): Promise<Activity[]> => {
    const params = clientId ? { clientId } : {};
    const res = await apiClient.get<Activity[]>('/activities', { params });
    return res.data;
  },
  create: async (data: CreateActivityRequest): Promise<Activity> => {
    const res = await apiClient.post<Activity>('/activities', data);
    return res.data;
  },
  getToday: async (): Promise<Activity[]> => {
    const res = await apiClient.get<Activity[]>('/activities/today');
    return res.data;
  },
};
