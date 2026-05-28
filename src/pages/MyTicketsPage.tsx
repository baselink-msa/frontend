import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ticketApi } from '../api/ticketApi';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Loading } from '../components/common/Loading';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatDateTime } from '../utils/date';

const PAGE_SIZE = 5;

export function MyTicketsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useQuery({
    queryKey: ['my-tickets'],
    queryFn: ticketApi.getMyTickets,
  });

  const cancelMutation = useMutation({
    mutationFn: (reservationId: number) => ticketApi.cancelReservation(reservationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-tickets'] }),
  });

  const tickets = data?.data ?? [];
  const totalPages = Math.max(1, Math.ceil(tickets.length / PAGE_SIZE));
  const pageTickets = useMemo(
    () => tickets.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [tickets, page],
  );

  useEffect(() => {
    setPage((value) => Math.min(value, totalPages));
  }, [totalPages]);

  if (isLoading) return <Loading label="내 예매 목록을 불러오는 중입니다." />;

  return (
    <section>
      <h1 className="text-3xl font-bold text-slate-950">내 예매</h1>
      <div className="mt-5">
        <ErrorMessage message={error?.message} />
      </div>
      <div className="mt-5 space-y-3">
        {tickets.length ? pageTickets.map((ticket) => (
          <div key={ticket.reservationId} className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-soft md:flex-row md:items-center">
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold text-slate-950">
                {ticket.homeTeamName && ticket.awayTeamName
                  ? `${ticket.homeTeamName} vs ${ticket.awayTeamName}`
                  : `예매 #${ticket.reservationId}`}
              </p>
              {ticket.stadiumName ? (
                <p className="mt-1 text-sm font-semibold text-slate-600">{ticket.stadiumName}</p>
              ) : null}
              <p className="mt-2 text-sm font-bold text-blue-700">{ticket.seatName}</p>
              <p className="mt-1 text-xs text-slate-500">
                예매 #{ticket.reservationId} · {formatDateTime(ticket.gameStartTime)}
              </p>
            </div>
            <StatusBadge status={ticket.status} />
            <div className="flex flex-wrap gap-2">
              {ticket.status === 'PENDING' ? (
                <Link
                  to={`/reservations/${ticket.reservationId}`}
                  className="rounded-md bg-blue-700 px-3 py-2 text-xs font-bold text-white hover:bg-blue-800"
                >
                  확정하기
                </Link>
              ) : null}
              {ticket.status === 'PENDING' || ticket.status === 'CONFIRMED' ? (
                <>
                  <Link
                    to={`/games/${ticket.gameId}/seats`}
                    state={{ changeReservationId: ticket.reservationId }}
                    className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"
                  >
                    좌석 변경
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('예매를 취소하시겠습니까?')) cancelMutation.mutate(ticket.reservationId);
                    }}
                    disabled={cancelMutation.isPending}
                    className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 disabled:opacity-50"
                  >
                    취소
                  </button>
                </>
              ) : null}
            </div>
          </div>
        )) : (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-6 py-12 text-center">
            <p className="text-sm text-slate-500">아직 예매 내역이 없습니다.</p>
            <Link to="/games" className="mt-3 inline-block text-sm font-bold text-blue-700 hover:underline">
              경기 보러가기
            </Link>
          </div>
        )}
      </div>
      {tickets.length > PAGE_SIZE ? (
        <div className="mt-5 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={page === 1}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 disabled:opacity-40"
          >
            이전
          </button>
          <span className="px-2 text-sm font-semibold text-slate-600">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            disabled={page === totalPages}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 disabled:opacity-40"
          >
            다음
          </button>
        </div>
      ) : null}
    </section>
  );
}
