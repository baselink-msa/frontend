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
  createdAt: string;
  updatedAt: string;
};

export type MyTicket = {
  reservationId: number;
  gameId: number;
  homeTeamName: string;
  awayTeamName: string;
  gameStartTime: string;
  seatName: string;
  status: ReservationStatus;
};
