import type { GameStatus, GameSummary } from '../types/game';

type GameSchedule = Pick<GameSummary, 'gameStartTime' | 'ticketOpenTime' | 'status'>;

export const isGamePast = (game: Pick<GameSchedule, 'gameStartTime'>, now = Date.now()) =>
  new Date(game.gameStartTime).getTime() <= now;

export const getEffectiveGameStatus = (game: GameSchedule, now = Date.now()): GameStatus => {
  if (game.status === 'CANCELED') return 'CANCELED';
  if (game.status === 'FINISHED') return 'CLOSED';
  if (isGamePast(game, now)) return 'CLOSED';
  if (game.status === 'SCHEDULED' && new Date(game.ticketOpenTime).getTime() <= now) {
    return 'TICKET_OPEN';
  }
  return game.status;
};

export const isGameTicketOpen = (game: GameSchedule, now = Date.now()) =>
  getEffectiveGameStatus(game, now) === 'TICKET_OPEN';
