import { mockApi } from '../mocks/mockApi';
import type {
  AdminFaqRequest,
  AdminGameRequest,
  AdminGameSeatsRequest,
  AdminMenuRequest,
  AdminSeatRequest,
  AdminSeatSectionRequest,
  WaitingRoomPolicyRequest,
  WaitingRoomPolicyResponse,
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

const put = async <TRequest, TResponse = unknown>(
  url: string,
  request: TRequest,
): Promise<ApiResponse<TResponse>> => {
  const { data } = await apiClient.put<ApiResponse<TResponse>>(url, request);
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
  getWaitingPolicy: async (gameId: number) => {
    if (USE_MOCK) return mockApi.admin.getWaitingPolicy(gameId);
    const { data } = await apiClient.get<ApiResponse<WaitingRoomPolicyResponse>>(
      `/admin/games/${gameId}/waiting-room-policy`,
    );
    return data;
  },
  updateWaitingPolicy: async (gameId: number, request: WaitingRoomPolicyRequest) => {
    if (USE_MOCK) return mockApi.admin.updateWaitingPolicy(gameId, request);
    const { data } = await apiClient.put<ApiResponse<WaitingRoomPolicyResponse>>(
      `/admin/games/${gameId}/waiting-room-policy`,
      request,
    );
    return data;
  },
  createMenu: (request: AdminMenuRequest) =>
    USE_MOCK ? mockApi.admin.createMenu(request) : post('/admin/menus', request),
  createFaq: (request: AdminFaqRequest) =>
    USE_MOCK ? mockApi.admin.createFaq(request) : post('/admin/faqs', request),

  // ===== 경기 수정/상태 변경/삭제 =====
  updateGame: (gameId: number, request: AdminGameRequest) =>
    put(`/admin/games/${gameId}`, request),
  changeGameStatus: async (gameId: number, status: string) => {
    const { data } = await apiClient.patch<ApiResponse<unknown>>(
      `/admin/games/${gameId}/status`,
      { status },
    );
    return data;
  },
  deleteGame: async (gameId: number) => {
    await apiClient.delete(`/admin/games/${gameId}`);
  },

  // ===== 좌석 구역 수정/삭제 =====
  updateSeatSection: (sectionId: number, request: AdminSeatSectionRequest) =>
    put(`/admin/seat-sections/${sectionId}`, request),
  deleteSeatSection: async (sectionId: number) => {
    await apiClient.delete(`/admin/seat-sections/${sectionId}`);
  },

  // ===== 좌석 조회/수정/삭제 =====
  getSeats: async (stadiumId: number) => {
    const { data } = await apiClient.get<ApiResponse<unknown[]>>('/admin/seats', { params: { stadiumId } });
    return data;
  },
  updateSeat: (seatId: number, request: AdminSeatRequest) =>
    put(`/admin/seats/${seatId}`, request),
  deleteSeat: async (seatId: number) => {
    await apiClient.delete(`/admin/seats/${seatId}`);
  },

  // ===== 경기 좌석 조회/가격 변경/삭제 =====
  getGameSeats: async (gameId: number) => {
    const { data } = await apiClient.get<ApiResponse<unknown[]>>(`/admin/games/${gameId}/seats`);
    return data;
  },
  updateGameSeatPrice: async (gameSeatId: number, price: number) => {
    const { data } = await apiClient.patch<ApiResponse<unknown>>(
      `/admin/game-seats/${gameSeatId}/price`,
      { price },
    );
    return data;
  },
  deleteGameSeat: async (gameSeatId: number) => {
    await apiClient.delete(`/admin/game-seats/${gameSeatId}`);
  },

  // ===== 메뉴 수정/삭제 =====
  updateMenu: (menuId: number, request: AdminMenuRequest) =>
    put(`/admin/menus/${menuId}`, request),
  deleteMenu: async (menuId: number) => {
    await apiClient.delete(`/admin/menus/${menuId}`);
  },

  // ===== FAQ 수정/삭제 =====
  updateFaq: (faqId: number, request: AdminFaqRequest) =>
    put(`/admin/faqs/${faqId}`, request),
  deleteFaq: async (faqId: number) => {
    await apiClient.delete(`/admin/faqs/${faqId}`);
  },

  // ===== 구장 조회/등록/삭제 =====
  getStadiums: async () => {
    const { data } = await apiClient.get<ApiResponse<{ stadiumId: number; name: string; location: string; capacity: number }[]>>('/admin/stadiums');
    return data;
  },
  createStadium: async (request: { name: string; location: string; capacity: number }) => {
    const { data } = await apiClient.post<ApiResponse<unknown>>('/admin/stadiums', request);
    return data;
  },
  deleteStadium: async (stadiumId: number) => {
    await apiClient.delete(`/admin/stadiums/${stadiumId}`);
  },
};
