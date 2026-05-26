import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '../../api/authApi';
import { useAuthStore } from '../../store/authStore';

export function AuthInitializer() {
  const { accessToken, user, setUser, logout } = useAuthStore();

  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
    enabled: Boolean(accessToken && !user),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (meQuery.data?.data) setUser(meQuery.data.data);
  }, [meQuery.data, setUser]);

  useEffect(() => {
    if (meQuery.isError) logout();
  }, [meQuery.isError, logout]);

  return null;
}
