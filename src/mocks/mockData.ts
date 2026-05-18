import type { User } from '../types/auth';
import type { Faq } from '../types/chatbot';
import type { GameDetail, GameSummary, SeatSection, Stadium } from '../types/game';
import type { Menu } from '../types/order';
import type { GameSeat } from '../types/seat';

export const mockUser: User = {
  userId: 1,
  email: 'user@example.com',
  name: '홍길동',
  role: 'USER',
  status: 'ACTIVE',
};

export const mockAdmin: User = {
  userId: 2,
  email: 'admin@example.com',
  name: '관리자',
  role: 'ADMIN',
  status: 'ACTIVE',
};

export const stadiums: Stadium[] = [
  {
    stadiumId: 1,
    name: '광주-KIA 챔피언스 필드',
    location: '광주광역시',
    capacity: 20500,
  },
  {
    stadiumId: 2,
    name: '잠실야구장',
    location: '서울특별시',
    capacity: 23750,
  },
];

export const games: GameDetail[] = [
  {
    gameId: 1,
    homeTeamName: 'KIA Tigers',
    awayTeamName: 'LG Twins',
    stadium: stadiums[0],
    gameStartTime: '2026-06-01T18:30:00+09:00',
    ticketOpenTime: '2026-05-25T14:00:00+09:00',
    status: 'TICKET_OPEN',
  },
  {
    gameId: 2,
    homeTeamName: 'Doosan Bears',
    awayTeamName: 'Samsung Lions',
    stadium: stadiums[1],
    gameStartTime: '2026-06-02T18:30:00+09:00',
    ticketOpenTime: '2026-05-26T14:00:00+09:00',
    status: 'SCHEDULED',
  },
  {
    gameId: 3,
    homeTeamName: 'LG Twins',
    awayTeamName: 'KT Wiz',
    stadium: stadiums[1],
    gameStartTime: '2026-06-05T17:00:00+09:00',
    ticketOpenTime: '2026-05-28T11:00:00+09:00',
    status: 'TICKET_OPEN',
  },
];

export const gameSummaries: GameSummary[] = games.map(({ stadium, ...game }) => ({
  ...game,
  stadiumName: stadium.name,
}));

export const seatSections: SeatSection[] = [
  { sectionId: 1, sectionName: '1루 내야석', price: 30000 },
  { sectionId: 2, sectionName: '3루 내야석', price: 30000 },
  { sectionId: 3, sectionName: '외야석', price: 18000 },
];

const rows = ['A', 'B', 'C', 'D', 'E'];

export const createMockSeats = (gameId: number): GameSeat[] =>
  seatSections.flatMap((section, sectionIndex) =>
    rows.flatMap((seatRow, rowIndex) =>
      Array.from({ length: 4 }, (_, seatIndex) => {
        const index = sectionIndex * 20 + rowIndex * 4 + seatIndex + 1;
        const sold = index % 13 === 0 || index % 17 === 0;
        return {
          seatId: gameId * 1000 + index,
          gameSeatId: gameId * 5000 + index,
          sectionId: section.sectionId,
          sectionName: section.sectionName,
          seatRow,
          seatNumber: String(seatIndex + 1),
          status: sold ? 'SOLD' : 'AVAILABLE',
          price: section.price,
        };
      }),
    ),
  );

export const menus: Menu[] = [
  { menuId: 1, name: '생맥주', price: 6000, available: true },
  { menuId: 2, name: '치킨 텐더', price: 12000, available: true },
  { menuId: 3, name: '나초 세트', price: 8000, available: true },
];

export const faqs: Faq[] = [
  {
    faqId: 1,
    category: 'TERM',
    question: '병살타가 뭐야?',
    answer: '병살타는 하나의 플레이로 두 명의 주자가 아웃되는 상황입니다.',
    enabled: true,
  },
  {
    faqId: 2,
    category: 'TICKET',
    question: '예매 결과가 PENDING이면 어떻게 하나요?',
    answer: '비동기 예매 처리가 진행 중입니다. 잠시 후 자동으로 결과가 갱신됩니다.',
    enabled: true,
  },
  {
    faqId: 3,
    category: 'QUEUE',
    question: '대기열 순번은 어떻게 줄어드나요?',
    answer: 'Redis 기반 대기열 정책에 따라 입장 가능 인원이 순차적으로 배정됩니다.',
    enabled: true,
  },
  {
    faqId: 4,
    category: 'SEAT',
    question: '좌석 잠금은 얼마나 유지되나요?',
    answer: '좌석 임시 잠금은 기본 5분 동안 유지됩니다.',
    enabled: true,
  },
  {
    faqId: 5,
    category: 'ORDER',
    question: '주류 주문 결제도 가능한가요?',
    answer: '이번 MVP에서는 결제 없이 주문 생성 흐름만 시연합니다.',
    enabled: true,
  },
];
