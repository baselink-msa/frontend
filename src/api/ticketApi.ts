import { mockApi } from '../mocks/mockApi';
import type { ApiResponse } from '../types/common';
import type { GameDetail } from '../types/game';
import type { GameSeat } from '../types/seat';
import type { MyTicket, ReservationCreated, ReservationDetail, ReservationRequest } from '../types/ticket';
import { formatFallbackSeatLabel, formatSeatLabel } from '../utils/seat';
import { apiClient, toApiResponse, USE_MOCK } from './client';
import { gameApi } from './gameApi';

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

const unwrapApiData = <T>(value: T | ApiResponse<T> | undefined | null): T | null => {
  if (!value) return null;
  if (typeof value === 'object' && 'data' in value) return (value as ApiResponse<T>).data;
  return value as T;
};

const unwrapApiArray = <T>(value: T[] | ApiResponse<T[]> | undefined | null): T[] => {
  const data = unwrapApiData<T[]>(value);
  return Array.isArray(data) ? data : [];
};

const enrichReservation = async (reservation: BackendReservation): Promise<ReservationDetail> => {
  const [gameResponse, seatsResponse] = await Promise.allSettled([
    gameApi.getGame(reservation.gameId),
    gameApi.getSeats(reservation.gameId),
  ]);
  const game = gameResponse.status === 'fulfilled'
    ? unwrapApiData<GameDetail>(gameResponse.value)
    : null;
  const seats = seatsResponse.status === 'fulfilled' ? unwrapApiArray<GameSeat>(seatsResponse.value) : [];
  const seat = seats.find((item) => item.seatId === reservation.seatId);

  const detail: ReservationDetail = {
    reservationId: reservation.reservationId,
    gameId: reservation.gameId,
    seatId: reservation.seatId,
    seatName: seat ? formatSeatLabel(seat) : formatFallbackSeatLabel(undefined, reservation.seatId),
    homeTeamName: game?.homeTeamName,
    awayTeamName: game?.awayTeamName,
    stadiumName: game?.stadium.name,
    gameStartTime: game?.gameStartTime,
    status: reservation.status,
    createdAt: reservation.createdAt,
    updatedAt: reservation.updatedAt,
  };

  sessionStorage.setItem(`reservation:${reservation.reservationId}`, JSON.stringify(detail));
  return detail;
};

const cacheReservation = (reservation: BackendReservation) => {
  const detail: ReservationDetail = {
    reservationId: reservation.reservationId,
    gameId: reservation.gameId,
    seatId: reservation.seatId,
    seatName: formatFallbackSeatLabel(undefined, reservation.seatId),
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
    const detail = await enrichReservation(data);
    return toApiResponse(detail);
  },
  getMyTickets: async (): Promise<ApiResponse<MyTicket[]>> => {
    if (USE_MOCK) return mockApi.tickets.my();
    const { data } = await apiClient.get<BackendReservation[]>('/tickets/my');
    const enriched = await Promise.all(data.map(async (r) => {
      const detail = await enrichReservation(r);
      return {
        reservationId: r.reservationId,
        gameId: r.gameId,
        homeTeamName: detail.homeTeamName ?? '',
        awayTeamName: detail.awayTeamName ?? '',
        stadiumName: detail.stadiumName,
        gameStartTime: detail.gameStartTime ?? r.createdAt,
        seatName: detail.seatName,
        status: r.status,
      };
    }));
    return toApiResponse(enriched);
  },

  confirmReservation: async (reservationId: number): Promise<ApiResponse<ReservationDetail>> => {
    const { data } = await apiClient.post<BackendReservation>(`/tickets/${reservationId}/confirm`);
    const detail = await enrichReservation(data);
    return toApiResponse(detail, '예매가 확정되었습니다.');
  },

  cancelReservation: async (reservationId: number): Promise<ApiResponse<ReservationDetail>> => {
    const { data } = await apiClient.post<BackendReservation>(`/tickets/${reservationId}/cancel`);
    const detail = await enrichReservation(data);
    return toApiResponse(detail, '예매가 취소되었습니다.');
  },
};
