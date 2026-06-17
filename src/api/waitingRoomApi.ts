import { mockApi } from '../mocks/mockApi';
import type { ApiResponse } from '../types/common';
import type { TicketAccessToken, WaitingEnterRequest, WaitingRoomState } from '../types/waitingRoom';
import { apiClient, USE_MOCK } from './client';

export const waitingRoomApi = {
  enter: async (gameId: number, request: WaitingEnterRequest): Promise<ApiResponse<WaitingRoomState>> => {
    if (USE_MOCK) return mockApi.waitingRoom.enter(gameId, request);
    const { data } = await apiClient.post<ApiResponse<WaitingRoomState>>(
      `/waiting-room/games/${gameId}/enter`,
      request,
    );
    return data;
  },
  status: async (gameId: number): Promise<ApiResponse<WaitingRoomState>> => {
    if (USE_MOCK) return mockApi.waitingRoom.status(gameId);
    const { data } = await apiClient.get<ApiResponse<WaitingRoomState>>(
      `/waiting-room/games/${gameId}/status`,
    );
    return data;
  },
  issueToken: async (gameId: number): Promise<ApiResponse<TicketAccessToken>> => {
    if (USE_MOCK) return mockApi.waitingRoom.issueToken(gameId);
    const { data } = await apiClient.post<ApiResponse<Omit<TicketAccessToken, 'expiresAt'>>>(
      `/waiting-room/games/${gameId}/issue-token`,
    );
    return {
      ...data,
      data: {
        ...data.data,
        expiresAt: new Date(Date.now() + data.data.expiresIn * 1000).toISOString(),
      },
    };
  },
  releaseToken: async (gameId: number, ticketAccessToken: string): Promise<ApiResponse<null>> => {
    if (USE_MOCK) return { success: true, data: null, message: '좌석 선택 슬롯이 반납되었습니다.' };
    const { data } = await apiClient.post<ApiResponse<null>>(
      `/waiting-room/games/${gameId}/release-token`,
      { ticketAccessToken },
    );
    return data;
  },
};
