import { FormEvent, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { ErrorMessage } from '../components/common/ErrorMessage';

export function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const signupMutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: () => {
      navigate('/login', {
        replace: true,
        state: { email, message: '회원가입이 완료되었습니다. 로그인해 주세요.' },
      });
    },
    onError: (err) => setError(err.message || '회원가입에 실패했습니다.'),
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    if (password !== confirmPassword) {
      setError('비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    signupMutation.mutate({ name, email, password });
  };

  return (
    <section className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-soft">
      <h1 className="text-2xl font-bold text-slate-950">회원가입</h1>
      <p className="mt-2 text-sm text-slate-600">BaseLink에서 경기 예매와 관람 서비스를 이용하세요.</p>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">이름</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-600 focus:outline-none"
            required
          />
        </label>
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
            minLength={8}
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">비밀번호 확인</span>
          <input
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-600 focus:outline-none"
            type="password"
            minLength={8}
            required
          />
        </label>
        <ErrorMessage message={error} />
        <button
          type="submit"
          disabled={signupMutation.isPending}
          className="w-full rounded-md bg-blue-700 px-4 py-3 font-bold text-white hover:bg-blue-800 disabled:opacity-60"
        >
          {signupMutation.isPending ? '가입 중' : '회원가입'}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-600">
        이미 계정이 있나요?{' '}
        <Link to="/login" className="font-bold text-blue-700 hover:text-blue-800">
          로그인
        </Link>
      </p>
    </section>
  );
}
