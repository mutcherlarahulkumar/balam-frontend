import apiClient from '@/lib/axios';
import { AgentPublic, UpdateProfileRequest } from '@/types/agent.types';

export const agentApi = {
  getProfile: async (): Promise<AgentPublic> => {
    const res = await apiClient.get<AgentPublic>('/agent/profile');
    return res.data;
  },
  updateProfile: async (data: UpdateProfileRequest): Promise<AgentPublic> => {
    const res = await apiClient.put<AgentPublic>('/agent/profile', data);
    return res.data;
  },
};
