import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ticketApi } from '../api/ticketApi';
import { seatLockApi } from '../api/seatLockApi';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Loading } from '../components/common/Loading';
import { StatusBadge } from '../components/common/StatusBadge';
import { useReservationStore } from '../store/reservationStore';
import { formatDateTime } from '../utils/date';
import { useState } from 'react';

export function ReservationResultPage() {
  const { reservationId = '0' } = useParams();
  const numericReservationId = Number(reservationId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { selectedGame, selectedSeat, lockId, resetReservationFlow } = useReservationStore();
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['reservation', numericReservationId],
    queryFn: () => ticketApi.getReservation(numericReservationId),
    refetchInterval: false,
  });

  const confirmMutation = useMutation({
    mutationFn: () => ticketApi.confirmReservation(numericReservationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservation', numericReservationId] });
      setError('');
    },
    onError: (err) => setError(err.message),
  });

  const cancelMutation = useMutation({
    mutationFn: () => ticketApi.cancelReservation(numericReservationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservation', numericReservationId] });
      resetReservationFlow();
      setError('');
    },
    onError: (err) => setError(err.message),
  });

  const goBackMutation = useMutation({
    mutationFn: async () => {
      // 좌석 잠금 해제
      if (selectedSeat && lockId && selectedGame) {
        await seatLockApi.releaseLock({
          gameId: selectedGame.gameId,
          seatId: selectedSeat.seatId,
          lockId,
        });
      }
      // 예매 취소
      await ticketApi.cancelReservation(numericReservationId);
      resetReservationFlow();
    },
    onSuccess: () => {
      if (selectedGame) navigate(`/games/${selectedGame.gameId}/seats`);
      else navigate('/games');
    },
    onError: (err) => setError(err.message),
  });

  if (isLoading) return <Loading label="예매 정보를 확인하는 중입니다." />;
  const reservation = data?.data;
  const isPending = reservation?.status === 'PENDING';
  const isConfirmed = reservation?.status === 'CONFIRMED';
  const isCanceled = reservation?.status === 'CANCELED';
  const isFailed = reservation?.status === 'FAILED';

  return (
    <section className="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-8 shadow-soft">
      <ErrorMessage message={error} />

      <div className="text-center">
        <p className="text-sm font-bold text-blue-700">예매</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          {isConfirmed ? '🎉 예매 완료' : isCanceled ? '예매 취소됨' : isFailed ? '예매 실패' : '예매 확인'}
        </h1>
        <div className="mt-4">
          <StatusBadge status={reservation?.status ?? 'PENDING'} />
        </div>
      </div>

      {isPending ? (
        <div className="mt-6 rounded-lg bg-amber-50 border border-amber-200 p-4 text-center">
          <p className="text-sm font-semibold text-amber-800">
            좌석이 잠금되었습니다. 아래 버튼으로 예매를 확정하거나 취소할 수 있습니다.
          </p>
        </div>
      ) : null}

      {reservation ? (
        <dl className="mt-6 grid gap-3 text-left sm:grid-cols-2">
          <Info label="예매 번호" value={String(reservation.reservationId)} />
          <Info label="좌석" value={reservation.seatName} />
          <Info label="생성 시간" value={formatDateTime(reservation.createdAt)} />
          <Info label="상태" value={reservation.status} />
        </dl>
      ) : null}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {isPending ? (
          <>
            <button
              type="button"
              onClick={() => confirmMutation.mutate()}
              disabled={confirmMutation.isPending}
              className="rounded-md bg-blue-700 px-6 py-3 font-bold text-white hover:bg-blue-800 disabled:opacity-50"
            >
              {confirmMutation.isPending ? '확정 중...' : '예매 확정'}
            </button>
            <button
              type="button"
              onClick={() => goBackMutation.mutate()}
              disabled={goBackMutation.isPending}
              className="rounded-md border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {goBackMutation.isPending ? '처리 중...' : '좌석 다시 선택'}
            </button>
            <button
              type="button"
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
              className="rounded-md border border-red-200 bg-red-50 px-5 py-3 font-bold text-red-700 hover:bg-red-100 disabled:opacity-50"
            >
              {cancelMutation.isPending ? '취소 중...' : '예매 취소'}
            </button>
          </>
        ) : null}

        {isConfirmed ? (
          <>
            <Link
              to="/my-tickets"
              className="rounded-md bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800"
            >
              내 예매 보기
            </Link>
            <Link
              to="/orders"
              className="rounded-md border border-blue-200 bg-blue-50 px-5 py-3 font-bold text-blue-800 hover:bg-blue-100"
            >
              주류 주문하기
            </Link>
          </>
        ) : null}

        {(isCanceled || isFailed) ? (
          <Link
            to="/games"
            className="rounded-md bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800"
          >
            경기 목록으로
          </Link>
        ) : null}
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <dt className="text-xs font-bold text-slate-500">{label}</dt>
      <dd className="mt-1 font-semibold text-slate-950">{value}</dd>
    </div>
  );
}
