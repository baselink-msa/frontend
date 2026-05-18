import { mockApi } from '../mocks/mockApi';
import type { ApiResponse } from '../types/common';
import type { GameDetail, GameSummary, SeatSection } from '../types/game';
import type { GameSeat, SeatStatus } from '../types/seat';
import { apiClient, USE_MOCK } from './client';

export const gameApi = {
  getGames: async (): Promise<ApiResponse<GameSummary[]>> => {
    if (USE_MOCK) return mockApi.games.list();
    const { data } = await apiClient.get<ApiResponse<GameSummary[]>>('/games');
    return data;
  },
  getGame: async (gameId: number): Promise<ApiResponse<GameDetail>> => {
    if (USE_MOCK) return mockApi.games.detail(gameId);
    const { data } = await apiClient.get<ApiResponse<GameDetail>>(`/games/${gameId}`);
    return data;
  },
  getSeatSections: async (gameId: number): Promise<ApiResponse<SeatSection[]>> => {
    if (USE_MOCK) return mockApi.games.sections();
    const { data } = await apiClient.get<ApiResponse<SeatSection[]>>(`/games/${gameId}/seat-sections`);
    return data;
  },
  getSeats: async (
    gameId: number,
    params?: { sectionId?: number; status?: SeatStatus },
  ): Promise<ApiResponse<GameSeat[]>> => {
    if (USE_MOCK) return mockApi.games.seats(gameId, params);
    const { data } = await apiClient.get<ApiResponse<GameSeat[]>>(`/games/${gameId}/seats`, {
      params,
    });
    return data;
  },
};
