import { mockApi } from '../mocks/mockApi';
import type { ApiResponse } from '../types/common';
import type { SeatLock, SeatLockRequest } from '../types/seat';
import { apiClient, toApiResponse, USE_MOCK } from './client';

export const seatLockApi = {
  createLock: async (request: SeatLockRequest): Promise<ApiResponse<SeatLock>> => {
    if (USE_MOCK) return mockApi.seatLocks.create(request);
    const { data } = await apiClient.post<Omit<SeatLock, 'expiresAt'>>('/seats/locks', request);
    return toApiResponse(
      {
        ...data,
        expiresAt: new Date(Date.now() + data.expiresIn * 1000).toISOString(),
      },
      '좌석이 임시 잠금되었습니다.',
    );
  },
  releaseLock: async (request: SeatLockRequest & { lockId: string }): Promise<void> => {
    if (USE_MOCK) return mockApi.seatLocks.release(request.lockId);
    await apiClient.delete('/seats/locks', { params: request });
  },
};
