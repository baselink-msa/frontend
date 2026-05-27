import { mockApi } from '../mocks/mockApi';
import type { ApiResponse } from '../types/common';
import type { MyTicket, ReservationCreated, ReservationDetail, ReservationRequest } from '../types/ticket';
import { apiClient, toApiResponse, USE_MOCK } from './client';

type BackendReservation = {
  reservationId: number;
  userId: number;
  gameId: number;
  seatId: number;
  status: ReservationCreated['status'];
  lockId: string;
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
};

const cacheReservation = (reservation: BackendReservation) => {
  const detail: ReservationDetail = {
    reservationId: reservation.reservationId,
    gameId: reservation.gameId,
    seatId: reservation.seatId,
    seatName: `seat-${reservation.seatId}`,
    status: reservation.status,
    createdAt: reservation.createdAt,
    updatedAt: reservation.updatedAt,
  };

  sessionStorage.setItem(`reservation:${reservation.reservationId}`, JSON.stringify(detail));
  return detail;
};

const getCachedReservation = (reservationId: number): ReservationDetail | null => {
  const raw = sessionStorage.getItem(`reservation:${reservationId}`);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as ReservationDetail;
  } catch {
    return null;
  }
};

export const ticketApi = {
  createReservation: async (
    request: ReservationRequest,
  ): Promise<ApiResponse<ReservationCreated>> => {
    if (USE_MOCK) return mockApi.tickets.reserve(request);
    const { data } = await apiClient.post<BackendReservation>('/tickets/reserve', null, {
      params: {
        gameId: request.gameId,
        seatId: request.seatId,
        lockId: request.lockId,
      },
    });
    const detail = cacheReservation(data);
    return toApiResponse(
      {
        reservationId: detail.reservationId,
        gameId: detail.gameId,
        seatId: detail.seatId,
        status: detail.status,
      },
      '예매 요청이 접수되었습니다.',
    );
  },
  getReservation: async (reservationId: number): Promise<ApiResponse<ReservationDetail>> => {
    if (USE_MOCK) return mockApi.tickets.detail(reservationId);
    const { data } = await apiClient.get<BackendReservation>(`/tickets/${reservationId}`);
    const detail = cacheReservation(data);
    return toApiResponse(detail);
  },
  getMyTickets: async (): Promise<ApiResponse<MyTicket[]>> => {
    if (USE_MOCK) return mockApi.tickets.my();
    const { data } = await apiClient.get<BackendReservation[]>('/tickets/my');
    return toApiResponse(
      data.map((r) => ({
        reservationId: r.reservationId,
        gameId: r.gameId,
        homeTeamName: '',
        awayTeamName: '',
        gameStartTime: r.createdAt,
        seatName: `seat-${r.seatId}`,
        status: r.status,
      })),
    );
  },

  confirmReservation: async (reservationId: number): Promise<ApiResponse<ReservationDetail>> => {
    const { data } = await apiClient.post<BackendReservation>(`/tickets/${reservationId}/confirm`);
    const detail = cacheReservation(data);
    return toApiResponse(detail, '예매가 확정되었습니다.');
  },

  cancelReservation: async (reservationId: number): Promise<ApiResponse<ReservationDetail>> => {
    const { data } = await apiClient.post<BackendReservation>(`/tickets/${reservationId}/cancel`);
    const detail = cacheReservation(data);
    return toApiResponse(detail, '예매가 취소되었습니다.');
  },
};
