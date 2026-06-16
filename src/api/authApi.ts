import { mockApi } from '../mocks/mockApi';
import type { ApiResponse } from '../types/common';
import type { LoginRequest, LoginResponse, SignupRequest, SignupResponse, User } from '../types/auth';
import { apiClient, USE_MOCK } from './client';

export const authApi = {
  login: async (request: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    if (USE_MOCK) return mockApi.auth.login(request);
    const { data } = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', request);
    return data;
  },
  signup: async (request: SignupRequest): Promise<ApiResponse<SignupResponse>> => {
    if (USE_MOCK) return mockApi.auth.signup(request);
    const { data } = await apiClient.post<ApiResponse<SignupResponse>>('/auth/signup', request);
    return data;
  },
  me: async (): Promise<ApiResponse<User>> => {
    if (USE_MOCK) return mockApi.auth.me();
    const { data } = await apiClient.get<ApiResponse<User>>('/auth/me');
    return data;
  },
  withdraw: async (): Promise<void> => {
    if (USE_MOCK) {
      await Promise.resolve();
      return;
    }
    await apiClient.delete('/auth/me');
  },
};
