import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameDetail } from '../types/game';
import type { GameSeat } from '../types/seat';

type ReservationState = {
  selectedGame: GameDetail | null;
  ticketAccessToken: string | null;
  selectedSeat: GameSeat | null;
  lockId: string | null;
  setSelectedGame: (game: GameDetail | null) => void;
  setTicketAccessToken: (token: string | null) => void;
  setSelectedSeat: (seat: GameSeat | null, lockId?: string | null) => void;
  resetReservationFlow: () => void;
};

export const useReservationStore = create<ReservationState>()(
  persist(
    (set) => ({
      selectedGame: null,
      ticketAccessToken: null,
      selectedSeat: null,
      lockId: null,
      setSelectedGame: (selectedGame) => set({ selectedGame }),
      setTicketAccessToken: (ticketAccessToken) => set({ ticketAccessToken }),
      setSelectedSeat: (selectedSeat, lockId = null) => set({ selectedSeat, lockId }),
      resetReservationFlow: () =>
        set({ ticketAccessToken: null, selectedSeat: null, lockId: null }),
    }),
    {
      name: 'reservation-storage',
    },
  ),
);
