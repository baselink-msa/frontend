export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'FAILED' | 'CANCELED';

export type ReservationRequest = {
  gameId: number;
  seatId: number;
  lockId: string;
  ticketAccessToken: string;
  idempotencyKey: string;
};

export type ReservationCreated = {
  reservationId: number;
  gameId: number;
  seatId: number;
  status: ReservationStatus;
};

export type ReservationDetail = ReservationCreated & {
  seatName: string;
  homeTeamName?: string;
  awayTeamName?: string;
  stadiumName?: string;
  gameStartTime?: string;
  createdAt: string;
  updatedAt: string;
};

export type MyTicket = {
  reservationId: number;
  gameId: number;
  seatId: number;
  lockId?: string;
  homeTeamName: string;
  awayTeamName: string;
  stadiumName?: string;
  gameStartTime: string;
  seatName: string;
  status: ReservationStatus;
};
