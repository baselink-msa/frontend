export type AdminGameRequest = {
  homeTeamName: string;
  awayTeamName: string;
  stadiumId: number;
  gameStartTime: string;
  ticketOpenTime: string;
};

export type AdminSeatSectionRequest = {
  stadiumId: number;
  sectionName: string;
  price: number;
};

export type AdminSeatRequest = {
  stadiumId: number;
  sectionId: number;
  seatRow: string;
  seatNumber: string;
};

export type AdminGameSeatsRequest = {
  seatIds: number[];
  price: number;
};

export type WaitingRoomPolicyRequest = {
  maxEnterPerMinute: number;
  tokenTtlSeconds: number;
  enabled: boolean;
};

export type WaitingRoomPolicyResponse = WaitingRoomPolicyRequest & {
  gameId: number;
};

export type AdminMenuRequest = {
  name: string;
  price: number;
  available: boolean;
};

export type AdminFaqRequest = {
  category: string;
  question: string;
  answer: string;
  enabled: boolean;
};
