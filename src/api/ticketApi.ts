import { mockApi } from '../mocks/mockApi';
import type { ApiResponse } from '../types/common';
import type { MyTicket, ReservationCreated, ReservationDetail, ReservationRequest } from '../types/ticket';
import { apiClient, USE_MOCK } from './client';

export const ticketApi = {
  createReservation: async (
    request: ReservationRequest,
  ): Promise<ApiResponse<ReservationCreated>> => {
    if (USE_MOCK) return mockApi.tickets.reserve(request);
    const { data } = await apiClient.post<ApiResponse<ReservationCreated>>(
      '/tickets/reservations',
      request,
    );
    return data;
  },
  getReservation: async (reservationId: number): Promise<ApiResponse<ReservationDetail>> => {
    if (USE_MOCK) return mockApi.tickets.detail(reservationId);
    const { data } = await apiClient.get<ApiResponse<ReservationDetail>>(
      `/tickets/reservations/${reservationId}`,
    );
    return data;
  },
  getMyTickets: async (): Promise<ApiResponse<MyTicket[]>> => {
    if (USE_MOCK) return mockApi.tickets.my();
    const { data } = await apiClient.get<ApiResponse<MyTicket[]>>('/tickets/my');
    return data;
  },
};
