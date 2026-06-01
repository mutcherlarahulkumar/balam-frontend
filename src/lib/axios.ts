import axios from 'axios';
import { getToken, clearAuth } from './tokenStore';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://balam-ozwd.onrender.com/v1';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let _onUnauthenticated: (() => void) | null = null;

export function registerUnauthHandler(fn: () => void) {
  _onUnauthenticated = fn;
}

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth();
      _onUnauthenticated?.();
    }
    if (!error.response) {
      error.message = 'Cannot reach the server. Check your internet connection.';
    }
    return Promise.reject(error);
  },
);

export default apiClient;
