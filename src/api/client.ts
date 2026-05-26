import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../store/authStore';
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

const getFriendlyApiErrorMessage = (error: AxiosError<{ error?: { message?: string }; message?: string }>) => {
  const status = error.response?.status;
  const serverMessage = error.response?.data?.error?.message ?? error.response?.data?.message;

  if (!error.response) {
    return '서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.';
  }

  if (status === 400) return serverMessage ?? '입력한 정보를 다시 확인해 주세요.';
  if (status === 401) return '로그인이 필요합니다. 다시 로그인해 주세요.';
  if (status === 403) return '접근 권한이 없습니다.';
  if (status === 404) return '요청한 정보를 찾을 수 없습니다.';
  if (status === 409) return serverMessage ?? '현재 요청을 처리할 수 없습니다. 상태를 다시 확인해 주세요.';
  if (status && status >= 500) return '서버에서 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.';

  return serverMessage ?? error.message ?? '요청 처리 중 오류가 발생했습니다.';
};

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
  (error: AxiosError<{ error?: { message?: string }; message?: string }>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('auth-storage');
      useAuthStore.getState().logout();
    }
    return Promise.reject(new Error(getFriendlyApiErrorMessage(error)));
  },
);
