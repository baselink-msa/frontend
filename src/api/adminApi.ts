import { mockApi } from '../mocks/mockApi';
import type {
  AdminFaqRequest,
  AdminGameRequest,
  AdminGameSeatsRequest,
  AdminMenuRequest,
  AdminSeatRequest,
  AdminSeatSectionRequest,
  WaitingRoomPolicyRequest,
} from '../types/admin';
import type { ApiResponse } from '../types/common';
import { apiClient, USE_MOCK } from './client';

const post = async <TRequest, TResponse = unknown>(
  url: string,
  request: TRequest,
): Promise<ApiResponse<TResponse>> => {
  const { data } = await apiClient.post<ApiResponse<TResponse>>(url, request);
  return data;
};

export const adminApi = {
  createGame: (request: AdminGameRequest) =>
    USE_MOCK ? mockApi.admin.createGame(request) : post('/admin/games', request),
  createSeatSection: (request: AdminSeatSectionRequest) =>
    USE_MOCK ? mockApi.admin.createSeatSection(request) : post('/admin/seat-sections', request),
  createSeat: (request: AdminSeatRequest) =>
    USE_MOCK ? mockApi.admin.createSeat(request) : post('/admin/seats', request),
  createGameSeats: (gameId: number, request: AdminGameSeatsRequest) =>
    USE_MOCK ? mockApi.admin.createGameSeats(gameId, request) : post(`/admin/games/${gameId}/seats`, request),
  updateWaitingPolicy: async (gameId: number, request: WaitingRoomPolicyRequest) => {
    if (USE_MOCK) return mockApi.admin.updateWaitingPolicy(gameId, request);
    const { data } = await apiClient.put<ApiResponse<unknown>>(
      `/admin/games/${gameId}/waiting-room-policy`,
      request,
    );
    return data;
  },
  createMenu: (request: AdminMenuRequest) =>
    USE_MOCK ? mockApi.admin.createMenu(request) : post('/admin/menus', request),
  createFaq: (request: AdminFaqRequest) =>
    USE_MOCK ? mockApi.admin.createFaq(request) : post('/admin/faqs', request),
};
