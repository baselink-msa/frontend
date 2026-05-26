import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { isAdminUser } from '../../utils/auth';
import { Loading } from './Loading';

type GuardProps = {
  children: ReactNode;
};

export function RequireAuth({ children }: GuardProps) {
  const location = useLocation();
  const accessToken = useAuthStore((state) => state.accessToken);

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

export function RequireAdmin({ children }: GuardProps) {
  const location = useLocation();
  const { accessToken, user } = useAuthStore();

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!user) {
    return <Loading label="권한 정보를 확인하는 중입니다." />;
  }

  if (!isAdminUser(user)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export function PublicOnly({ children }: GuardProps) {
  const accessToken = useAuthStore((state) => state.accessToken);

  if (accessToken) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
