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
  serverTimeEpochMillis?: number;
  nextCheckAfterSeconds?: number;
  policyMaxEnterPerMinute?: number;
  currentReadyPodCount?: number;
  projectedReadyPodCount?: number;
  effectiveEnterPerMinute?: number;
  projectedEnterPerMinute?: number;
  currentMinuteRemainingSlots?: number;
  canEnter?: boolean;
};

export type TicketAccessToken = {
  ticketAccessToken: string;
  expiresIn: number;
  expiresAt: string;
};
