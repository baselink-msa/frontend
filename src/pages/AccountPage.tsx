import { useMutation } from '@tanstack/react-query';
import { ShieldAlert, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { useAuthStore } from '../store/authStore';

export function AccountPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const withdrawMutation = useMutation({
    mutationFn: authApi.withdraw,
    onSuccess: () => {
      logout();
      navigate('/login', { replace: true });
    },
  });

  const handleWithdraw = () => {
    const confirmed = confirm('회원탈퇴 시 예매 내역과 주문 내역이 함께 삭제됩니다. 탈퇴하시겠습니까?');
    if (confirmed) withdrawMutation.mutate();
  };

  return (
    <section className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold text-slate-950">내 계정</h1>

      <div className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <p className="text-sm font-semibold text-slate-500">로그인 정보</p>
        <dl className="mt-4 grid gap-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="font-semibold text-slate-500">이름</dt>
            <dd className="font-bold text-slate-900">{user?.name ?? '-'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="font-semibold text-slate-500">이메일</dt>
            <dd className="font-bold text-slate-900">{user?.email ?? '-'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="font-semibold text-slate-500">권한</dt>
            <dd className="font-bold text-slate-900">{user?.role ?? '-'}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-5">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 text-red-700" size={22} />
          <div className="flex-1">
            <h2 className="text-lg font-bold text-red-800">회원탈퇴</h2>
            <p className="mt-2 text-sm leading-6 text-red-700">
              탈퇴하면 계정 정보와 함께 예매 내역, 주문 내역이 삭제됩니다. 삭제된 데이터는 복구할 수 없습니다.
            </p>
            <div className="mt-4">
              <ErrorMessage message={withdrawMutation.error?.message} />
            </div>
            <button
              type="button"
              onClick={handleWithdraw}
              disabled={withdrawMutation.isPending}
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-red-700 px-4 py-2 text-sm font-bold text-white hover:bg-red-800 disabled:opacity-50"
            >
              <Trash2 size={16} />
              {withdrawMutation.isPending ? '탈퇴 처리 중' : '회원탈퇴'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
