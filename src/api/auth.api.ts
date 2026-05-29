import apiClient from '@/lib/axios';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ChangePasswordRequest,
  RefreshResponse,
} from '@/types/auth.types';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await apiClient.post<LoginResponse>('/auth/login', data);
    return res.data;
  },
  register: async (data: RegisterRequest): Promise<void> => {
    await apiClient.post('/auth/register', data);
  },
  refresh: async (): Promise<RefreshResponse> => {
    const res = await apiClient.post<RefreshResponse>('/auth/refresh');
    return res.data;
  },
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.post('/auth/change-password', data);
  },
};
