export type WaitingStatus = 'WAITING' | 'ALLOWED' | 'EXPIRED';

export type WaitingEnterRequest = {
  clientRequestId: string;
};

export type WaitingRoomState = {
  gameId: number;
  userId: number;
  status: WaitingStatus;
  position: number;
  peopleAhead: number;
  estimatedWaitSeconds: number;
  canEnter?: boolean;
};

export type TicketAccessToken = {
  ticketAccessToken: string;
  expiresIn: number;
  expiresAt: string;
};
