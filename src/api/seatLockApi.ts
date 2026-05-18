import { mockApi } from '../mocks/mockApi';
import type { ApiResponse } from '../types/common';
import type { SeatLock, SeatLockRequest } from '../types/seat';
import { apiClient, USE_MOCK } from './client';

export const seatLockApi = {
  createLock: async (request: SeatLockRequest): Promise<ApiResponse<SeatLock>> => {
    if (USE_MOCK) return mockApi.seatLocks.create(request);
    const { data } = await apiClient.post<ApiResponse<SeatLock>>('/seats/locks', request);
    return data;
  },
  releaseLock: async (lockId: string): Promise<void> => {
    if (USE_MOCK) return mockApi.seatLocks.release(lockId);
    await apiClient.delete(`/seats/locks/${lockId}`);
  },
};
