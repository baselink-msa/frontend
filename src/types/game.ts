export type GameStatus = 'SCHEDULED' | 'TICKET_OPEN' | 'SOLD_OUT' | 'CLOSED' | 'FINISHED' | 'CANCELED';

export type Stadium = {
  stadiumId: number;
  name: string;
  location: string;
  capacity: number;
};

export type GameSummary = {
  gameId: number;
  homeTeamName: string;
  awayTeamName: string;
  stadiumName: string;
  gameStartTime: string;
  ticketOpenTime: string;
  status: GameStatus;
};

export type GameDetail = Omit<GameSummary, 'stadiumName'> & {
  stadium: Stadium;
};

export type SeatSection = {
  sectionId: number;
  sectionName: string;
  price: number;
};
