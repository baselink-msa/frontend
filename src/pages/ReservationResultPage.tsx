import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { ticketApi } from '../api/ticketApi';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Loading } from '../components/common/Loading';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatDateTime } from '../utils/date';

export function ReservationResultPage() {
  const { reservationId = '0' } = useParams();
  const numericReservationId = Number(reservationId);
  const { data, isLoading, error } = useQuery({
    queryKey: ['reservation', numericReservationId],
    queryFn: () => ticketApi.getReservation(numericReservationId),
    refetchInterval: (query) => (query.state.data?.data.status === 'PENDING' ? 2500 : false),
  });

  if (isLoading) return <Loading label="예매 결과를 확인하는 중입니다." />;
  const reservation = data?.data;

  return (
    <section className="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-8 text-center shadow-soft">
      <ErrorMessage message={error?.message} />
      <p className="text-sm font-bold text-blue-700">Reservation</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-950">
        {reservation?.status === 'CONFIRMED'
          ? '예매 완료'
          : reservation?.status === 'FAILED'
            ? '예매 실패'
            : '예매 처리 중'}
      </h1>
      <div className="mt-4">
        <StatusBadge status={reservation?.status ?? 'PENDING'} />
      </div>
      {reservation ? (
        <dl className="mt-8 grid gap-4 text-left sm:grid-cols-2">
          <Info label="예매 번호" value={String(reservation.reservationId)} />
          <Info label="좌석" value={reservation.seatName} />
          <Info label="생성 시간" value={formatDateTime(reservation.createdAt)} />
          <Info label="수정 시간" value={formatDateTime(reservation.updatedAt)} />
        </dl>
      ) : null}
      <Link
        to="/my-tickets"
        className="mt-8 inline-flex rounded-md bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800"
      >
        내 예매 보기
      </Link>
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
