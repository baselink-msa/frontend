import { mockApi } from '../mocks/mockApi';
import type { ApiResponse } from '../types/common';
import type { LoginRequest, LoginResponse, User } from '../types/auth';
import { apiClient, USE_MOCK } from './client';

export const authApi = {
  login: async (request: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    if (USE_MOCK) return mockApi.auth.login(request);
    const { data } = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', request);
    return data;
  },
  me: async (): Promise<ApiResponse<User>> => {
    if (USE_MOCK) return mockApi.auth.me();
    const { data } = await apiClient.get<ApiResponse<User>>('/auth/me');
    return data;
  },
};
