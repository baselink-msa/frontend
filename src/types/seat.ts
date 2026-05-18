export type SeatStatus = 'AVAILABLE' | 'SOLD' | 'LOCKED';

export type GameSeat = {
  seatId: number;
  gameSeatId: number;
  sectionId: number;
  sectionName: string;
  seatRow: string;
  seatNumber: string;
  status: SeatStatus;
  price: number;
};

export type SeatLockRequest = {
  gameId: number;
  seatId: number;
};

export type SeatLock = {
  lockId: string;
  gameId: number;
  seatId: number;
  userId: number;
  status: 'LOCKED';
  expiresIn: number;
  expiresAt: string;
};
