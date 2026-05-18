import type { UserRole } from './common';

export type User = {
  userId: number;
  email: string;
  name: string;
  role: UserRole;
  status?: 'ACTIVE' | 'INACTIVE';
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  user: User;
};
