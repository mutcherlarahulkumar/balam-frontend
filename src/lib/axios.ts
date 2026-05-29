import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://balam-ozwd.onrender.com/v1';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('balam_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('balam_token');
      localStorage.removeItem('balam_agent');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Network error or CORS block — no response object
    if (!error.response) {
      error.message = 'Cannot reach the server. Check your internet connection.';
    }

    return Promise.reject(error);
  },
);

export default apiClient;
