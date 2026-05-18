import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types/auth';

type AuthState = {
  accessToken: string | null;
  user: User | null;
  setAuth: (accessToken: string, user: User) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: localStorage.getItem('accessToken'),
      user: null,
      setAuth: (accessToken, user) => {
        localStorage.setItem('accessToken', accessToken);
        set({ accessToken, user });
      },
      logout: () => {
        localStorage.removeItem('accessToken');
        set({ accessToken: null, user: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ accessToken: state.accessToken, user: state.user }),
    },
  ),
);
