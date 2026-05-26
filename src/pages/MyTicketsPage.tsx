import { useQuery } from '@tanstack/react-query';
import { ticketApi } from '../api/ticketApi';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Loading } from '../components/common/Loading';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatDateTime } from '../utils/date';

export function MyTicketsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['my-tickets'],
    queryFn: ticketApi.getMyTickets,
  });

  if (isLoading) return <Loading label="내 예매 목록을 불러오는 중입니다." />;

  return (
    <section>
      <h1 className="text-3xl font-bold text-slate-950">내 예매</h1>
      <div className="mt-5">
        <ErrorMessage message={error?.message} />
      </div>
      <div className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">경기</th>
              <th className="px-4 py-3">경기 시간</th>
              <th className="px-4 py-3">좌석</th>
              <th className="px-4 py-3">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data?.data.length ? data.data.map((ticket) => (
              <tr key={ticket.reservationId}>
                <td className="px-4 py-4 font-semibold text-slate-950">
                  {ticket.homeTeamName} vs {ticket.awayTeamName}
                </td>
                <td className="px-4 py-4 text-slate-600">{formatDateTime(ticket.gameStartTime)}</td>
                <td className="px-4 py-4 text-slate-600">{ticket.seatName}</td>
                <td className="px-4 py-4">
                  <StatusBadge status={ticket.status} />
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                  아직 예매 내역이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
