import type { User } from '../types/auth';

export const isAdminUser = (user: User | null) => String(user?.role ?? '').includes('ADMIN');
