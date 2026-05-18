import type { AdminFaqRequest, AdminGameRequest, AdminGameSeatsRequest, AdminMenuRequest, AdminSeatRequest, AdminSeatSectionRequest, WaitingRoomPolicyRequest } from '../types/admin';
import type { LoginRequest, LoginResponse, SignupRequest, SignupResponse, User } from '../types/auth';
import type { ChatbotAnswer, ChatbotRequest, Faq } from '../types/chatbot';
import type { ApiResponse } from '../types/common';
import type { GameDetail, GameSummary, SeatSection } from '../types/game';
import type { Menu, Order, OrderRequest } from '../types/order';
import type { GameSeat, SeatLock, SeatLockRequest, SeatStatus } from '../types/seat';
import type { MyTicket, ReservationCreated, ReservationDetail, ReservationRequest } from '../types/ticket';
import type { TicketAccessToken, WaitingEnterRequest, WaitingRoomState } from '../types/waitingRoom';
import { createMockSeats, faqs, games, gameSummaries, menus, mockAdmin, mockUser, seatSections } from './mockData';

const delay = (ms = 250) => new Promise((resolve) => window.setTimeout(resolve, ms));
const ok = async <T>(data: T, message = '요청이 성공했습니다.'): Promise<ApiResponse<T>> => {
  await delay();
  return { success: true, data, message };
};

const seatsByGame = new Map<number, GameSeat[]>();
const waitingByGame = new Map<number, WaitingRoomState>();
const reservationChecks = new Map<number, number>();
const reservations = new Map<number, ReservationDetail>();
const myTickets: MyTicket[] = [];
let reservationSequence = 10;
let orderSequence = 20;
let userSequence = 3;
const registeredUsers = new Map<string, { user: User; password: string }>();

const getSeats = (gameId: number) => {
  if (!seatsByGame.has(gameId)) seatsByGame.set(gameId, createMockSeats(gameId));
  return seatsByGame.get(gameId) ?? [];
};

export const mockApi = {
  auth: {
    login: async (request: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
      await delay();
      const registeredUser = registeredUsers.get(request.email);
      const user =
        registeredUser?.user ?? (request.email === 'admin@example.com' ? mockAdmin : mockUser);
      const expectedPassword = registeredUser?.password ?? 'password1234';
      if (request.password !== expectedPassword) {
        throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
      }
      return {
        success: true,
        data: { accessToken: `mock-access-token-${user.role.toLowerCase()}`, user },
        message: '로그인 성공',
      };
    },
    signup: async (request: SignupRequest): Promise<ApiResponse<SignupResponse>> => {
      await delay();
      if (request.password.length < 8) {
        throw new Error('비밀번호는 8자 이상이어야 합니다.');
      }
      if (
        request.email === mockUser.email ||
        request.email === mockAdmin.email ||
        registeredUsers.has(request.email)
      ) {
        throw new Error('이미 가입된 이메일입니다.');
      }
      const user: User = {
        userId: userSequence++,
        email: request.email,
        name: request.name,
        role: 'USER',
        status: 'ACTIVE',
      };
      registeredUsers.set(request.email, { user, password: request.password });
      return {
        success: true,
        data: { accessToken: `mock-access-token-user-${user.userId}`, user },
        message: '회원가입 성공',
      };
    },
    me: (): Promise<ApiResponse<User>> => ok(mockUser),
  },
  games: {
    list: (): Promise<ApiResponse<GameSummary[]>> => ok(gameSummaries),
    detail: (gameId: number): Promise<ApiResponse<GameDetail>> => {
      const game = games.find((item) => item.gameId === gameId);
      if (!game) throw new Error('경기를 찾을 수 없습니다.');
      return ok(game);
    },
    sections: (): Promise<ApiResponse<SeatSection[]>> => ok(seatSections),
    seats: (
      gameId: number,
      params?: { sectionId?: number; status?: SeatStatus },
    ): Promise<ApiResponse<GameSeat[]>> => {
      const filtered = getSeats(gameId).filter((seat) => {
        const sectionMatched = params?.sectionId ? seat.sectionId === params.sectionId : true;
        const statusMatched = params?.status ? seat.status === params.status : true;
        return sectionMatched && statusMatched;
      });
      return ok(filtered);
    },
  },
  waitingRoom: {
    enter: (gameId: number, _request: WaitingEnterRequest): Promise<ApiResponse<WaitingRoomState>> => {
      const state: WaitingRoomState = {
        gameId,
        userId: 1,
        status: 'WAITING',
        position: 300,
        peopleAhead: 299,
        estimatedWaitSeconds: 180,
        canEnter: false,
      };
      waitingByGame.set(gameId, state);
      return ok(state, '대기열에 등록되었습니다.');
    },
    status: (gameId: number): Promise<ApiResponse<WaitingRoomState>> => {
      const previous = waitingByGame.get(gameId);
      const nextPosition = Math.max((previous?.position ?? 300) - 85, 0);
      const state: WaitingRoomState = {
        gameId,
        userId: 1,
        status: nextPosition === 0 ? 'ALLOWED' : 'WAITING',
        position: nextPosition,
        peopleAhead: Math.max(nextPosition - 1, 0),
        estimatedWaitSeconds: Math.ceil(nextPosition / 5),
        canEnter: nextPosition === 0,
      };
      waitingByGame.set(gameId, state);
      return ok(state);
    },
    issueToken: (gameId: number): Promise<ApiResponse<TicketAccessToken>> =>
      ok(
        {
          ticketAccessToken: `mock-ticket-token-${gameId}-${Date.now()}`,
          expiresIn: 300,
          expiresAt: new Date(Date.now() + 300_000).toISOString(),
        },
        '좌석 선택 화면에 입장할 수 있습니다.',
      ),
  },
  seatLocks: {
    create: (request: SeatLockRequest): Promise<ApiResponse<SeatLock>> => {
      const seat = getSeats(request.gameId).find((item) => item.seatId === request.seatId);
      if (!seat) throw new Error('좌석을 찾을 수 없습니다.');
      if (seat.status === 'SOLD') throw new Error('이미 판매된 좌석입니다.');
      if (seat.status === 'LOCKED') throw new Error('이미 잠긴 좌석입니다.');
      seat.status = 'LOCKED';
      return ok(
        {
          lockId: `lock-${request.gameId}-${request.seatId}-${Date.now()}`,
          gameId: request.gameId,
          seatId: request.seatId,
          userId: 1,
          status: 'LOCKED',
          expiresIn: 300,
          expiresAt: new Date(Date.now() + 300_000).toISOString(),
        },
        '좌석이 임시 잠금되었습니다.',
      );
    },
    release: async (_lockId: string): Promise<void> => {
      await delay(120);
    },
  },
  tickets: {
    reserve: (request: ReservationRequest): Promise<ApiResponse<ReservationCreated>> => {
      const reservationId = reservationSequence++;
      const seat = getSeats(request.gameId).find((item) => item.seatId === request.seatId);
      if (!seat) throw new Error('좌석을 찾을 수 없습니다.');
      const now = new Date().toISOString();
      const detail: ReservationDetail = {
        reservationId,
        gameId: request.gameId,
        seatId: request.seatId,
        seatName: `${seat.seatRow}-${seat.seatNumber}`,
        status: 'PENDING',
        createdAt: now,
        updatedAt: now,
      };
      reservations.set(reservationId, detail);
      reservationChecks.set(reservationId, 0);
      return ok(
        {
          reservationId,
          gameId: request.gameId,
          seatId: request.seatId,
          status: 'PENDING',
        },
        '예매 요청이 접수되었습니다.',
      );
    },
    detail: (reservationId: number): Promise<ApiResponse<ReservationDetail>> => {
      const detail = reservations.get(reservationId);
      if (!detail) throw new Error('예매 정보를 찾을 수 없습니다.');
      const checks = (reservationChecks.get(reservationId) ?? 0) + 1;
      reservationChecks.set(reservationId, checks);
      if (checks >= 3 && detail.status === 'PENDING') {
        detail.status = 'CONFIRMED';
        detail.updatedAt = new Date().toISOString();
        const game = gameSummaries.find((item) => item.gameId === detail.gameId);
        if (game && !myTickets.some((ticket) => ticket.reservationId === reservationId)) {
          myTickets.push({
            reservationId,
            gameId: detail.gameId,
            homeTeamName: game.homeTeamName,
            awayTeamName: game.awayTeamName,
            gameStartTime: game.gameStartTime,
            seatName: detail.seatName,
            status: 'CONFIRMED',
          });
        }
      }
      return ok(detail);
    },
    my: (): Promise<ApiResponse<MyTicket[]>> =>
      ok([
        ...myTickets,
        {
          reservationId: 1,
          gameId: 1,
          homeTeamName: 'KIA Tigers',
          awayTeamName: 'LG Twins',
          gameStartTime: '2026-06-01T18:30:00+09:00',
          seatName: 'A-1',
          status: 'CONFIRMED',
        },
      ]),
  },
  orders: {
    menus: (): Promise<ApiResponse<Menu[]>> => ok(menus),
    create: (request: OrderRequest): Promise<ApiResponse<Order>> => {
      const totalPrice = request.items.reduce((total, item) => {
        const menu = menus.find((entry) => entry.menuId === item.menuId);
        return total + (menu?.price ?? 0) * item.quantity;
      }, 0);
      return ok({ orderId: orderSequence++, status: 'ORDERED', totalPrice }, '주문이 생성되었습니다.');
    },
  },
  chatbot: {
    faqs: (): Promise<ApiResponse<Faq[]>> => ok(faqs),
    send: (request: ChatbotRequest): Promise<ApiResponse<ChatbotAnswer>> => {
      const faq = faqs.find((item) => request.message.includes(item.question.replace('?', '')));
      return ok({
        answer: faq?.answer ?? '등록된 FAQ에서 정확한 답변을 찾지 못했습니다. 운영자에게 문의해주세요.',
        source: faq ? 'FAQ' : 'FALLBACK',
        cached: Boolean(faq),
      });
    },
  },
  admin: {
    createGame: (request: AdminGameRequest) => ok({ id: Date.now(), ...request }, '경기가 등록되었습니다.'),
    createSeatSection: (request: AdminSeatSectionRequest) =>
      ok({ id: Date.now(), ...request }, '좌석 구역이 등록되었습니다.'),
    createSeat: (request: AdminSeatRequest) => ok({ id: Date.now(), ...request }, '좌석이 등록되었습니다.'),
    createGameSeats: (gameId: number, request: AdminGameSeatsRequest) =>
      ok({ gameId, ...request }, '경기 좌석이 생성되었습니다.'),
    updateWaitingPolicy: (gameId: number, request: WaitingRoomPolicyRequest) =>
      ok({ gameId, ...request }, '대기열 정책이 저장되었습니다.'),
    createMenu: (request: AdminMenuRequest) => ok({ id: Date.now(), ...request }, '메뉴가 등록되었습니다.'),
    createFaq: (request: AdminFaqRequest) => ok({ id: Date.now(), ...request }, 'FAQ가 등록되었습니다.'),
  },
};
