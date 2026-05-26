import { FormEvent, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { useAuthStore } from '../store/authStore';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      setAuth(response.data.accessToken, response.data.user);
      navigate(from, { replace: true });
    },
    onError: (err) => setError(err.message || '로그인에 실패했습니다.'),
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError('');
    loginMutation.mutate({ email, password });
  };

  return (
    <section className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-soft">
      <h1 className="text-2xl font-bold text-slate-950">로그인</h1>
      <p className="mt-2 text-sm text-slate-600">가입한 이메일과 비밀번호로 로그인하세요.</p>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">이메일</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-600 focus:outline-none"
            type="email"
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">비밀번호</span>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-600 focus:outline-none"
            type="password"
            required
          />
        </label>
        <ErrorMessage message={error} />
        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full rounded-md bg-blue-700 px-4 py-3 font-bold text-white hover:bg-blue-800 disabled:opacity-60"
        >
          {loginMutation.isPending ? '로그인 중' : '로그인'}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-600">
        아직 계정이 없나요?{' '}
        <Link to="/signup" className="font-bold text-blue-700 hover:text-blue-800">
          회원가입
        </Link>
      </p>
    </section>
  );
}
