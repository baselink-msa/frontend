import axios from 'axios';
import type { User } from '../types/auth';
import type { ApiResponse } from '../types/common';

export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 10000,
});

const getStoredUser = (): User | null => {
  const raw = localStorage.getItem('auth-storage');
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as { state?: { user?: User | null } };
    return parsed.state?.user ?? null;
  } catch {
    return null;
  }
};

export const toApiResponse = <T>(data: T, message = '요청이 성공했습니다.'): ApiResponse<T> => ({
  success: true,
  data,
  message,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const userId = getStoredUser()?.userId;
  if (userId) {
    config.headers['X-User-Id'] = String(userId);
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('auth-storage');
    }
    const message =
      error.response?.data?.error?.message ??
      error.response?.data?.message ??
      error.message ??
      'API 서버 오류가 발생했습니다.';
    return Promise.reject(new Error(message));
  },
);
