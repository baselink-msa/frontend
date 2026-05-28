import type { GameSeat } from '../types/seat';

export const formatSeatLabel = (seat?: Pick<GameSeat, 'sectionName' | 'seatRow' | 'seatNumber'> | null) => {
  if (!seat) return '좌석 정보 확인 중';
  return `${seat.sectionName} ${seat.seatRow}열 ${seat.seatNumber}번`;
};

export const formatFallbackSeatLabel = (seatName?: string, seatId?: number) => {
  if (seatName && !/^seat-\d+$/i.test(seatName)) return seatName;
  return seatId ? `좌석 #${seatId}` : '좌석 정보 확인 중';
};
