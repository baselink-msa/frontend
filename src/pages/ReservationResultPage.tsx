import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ticketApi } from '../api/ticketApi';
import { seatLockApi } from '../api/seatLockApi';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Loading } from '../components/common/Loading';
import { StatusBadge } from '../components/common/StatusBadge';
import { useReservationStore } from '../store/reservationStore';
import { formatDateTime } from '../utils/date';

export function ReservationResultPage() {
  const { reservationId = '0' } = useParams();
  const numericReservationId = Number(reservationId);
  const navigate = useNavigate();
  const { selectedGame, selectedSeat, lockId, resetReservationFlow } = useReservationStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['reservation', numericReservationId],
    queryFn: () => ticketApi.getReservation(numericReservationId),
    refetchInterval: (query) => (query.state.data?.data.status === 'PENDING' ? 2000 : false),
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      // 좌석 잠금 해제
      if (selectedSeat && lockId && selectedGame) {
        await seatLockApi.releaseLock({
          gameId: selectedGame.gameId,
          seatId: selectedSeat.seatId,
          lockId,
        });
      }
      resetReservationFlow();
    },
    onSuccess: () => {
      if (selectedGame) {
        navigate(`/games/${selectedGame.gameId}/seats`);
      } else {
        navigate('/games');
      }
    },
  });

  if (isLoading) return <Loading label="예매 결과를 확인하는 중입니다." />;
  const reservation = data?.data;
  const isPending = reservation?.status === 'PENDING';
  const isConfirmed = reservation?.status === 'CONFIRMED';
  const isFailed = reservation?.status === 'FAILED';

  return (
    <section className="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-8 text-center shadow-soft">
      <ErrorMessage message={error?.message} />
      <p className="text-sm font-bold text-blue-700">Reservation</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-950">
        {isConfirmed
          ? '🎉 예매 완료'
          : isFailed
            ? '예매 실패'
            : '예매 처리 중...'}
      </h1>
      <div className="mt-4">
        <StatusBadge status={reservation?.status ?? 'PENDING'} />
      </div>

      {isPending ? (
        <div className="mt-6 rounded-lg bg-amber-50 border border-amber-200 p-4">
          <p className="text-sm font-semibold text-amber-800">
            좌석이 잠금되었습니다. 예매 확정을 기다리는 중입니다...
          </p>
          <p className="mt-1 text-xs text-amber-600">
            보통 몇 초 내에 자동으로 확정됩니다.
          </p>
        </div>
      ) : null}

      {reservation ? (
        <dl className="mt-8 grid gap-4 text-left sm:grid-cols-2">
          <Info label="예매 번호" value={String(reservation.reservationId)} />
          <Info label="좌석" value={reservation.seatName} />
          <Info label="생성 시간" value={formatDateTime(reservation.createdAt)} />
          <Info label="상태" value={reservation.status} />
        </dl>
      ) : null}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {isPending ? (
          <button
            type="button"
            onClick={() => cancelMutation.mutate()}
            disabled={cancelMutation.isPending}
            className="rounded-md border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {cancelMutation.isPending ? '취소 중...' : '좌석 다시 선택'}
          </button>
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

        {isFailed ? (
          <button
            type="button"
            onClick={() => {
              resetReservationFlow();
              if (selectedGame) navigate(`/games/${selectedGame.gameId}/seats`);
              else navigate('/games');
            }}
            className="rounded-md bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800"
          >
            다시 시도
          </button>
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
