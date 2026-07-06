import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { gameApi } from '../api/gameApi';
import { waitingRoomApi } from '../api/waitingRoomApi';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Loading } from '../components/common/Loading';
import { StatusBadge } from '../components/common/StatusBadge';
import { useReservationStore } from '../store/reservationStore';
import { formatDateTime } from '../utils/date';
import { createClientRequestId } from '../utils/format';

export function GameDetailPage() {
  const { gameId = '0' } = useParams();
  const numericGameId = Number(gameId);
  const navigate = useNavigate();
  const setSelectedGame = useReservationStore((state) => state.setSelectedGame);
  const [error, setError] = useState('');
  const [now, setNow] = useState(() => Date.now());

  const { data, isLoading, error: queryError } = useQuery({
    queryKey: ['game', numericGameId],
    queryFn: () => gameApi.getGame(numericGameId),
    enabled: Boolean(numericGameId),
  });

  const enterMutation = useMutation({
    mutationFn: () =>
      waitingRoomApi.enter(numericGameId, { clientRequestId: createClientRequestId('wr') }),
    onSuccess: () => {
      if (data?.data) setSelectedGame(data.data);
      navigate(`/games/${numericGameId}/waiting-room`);
    },
    onError: (err) => setError(err.message || '대기열 입장에 실패했습니다.'),
  });

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (isLoading) return <Loading label="경기 상세를 불러오는 중입니다." />;
  const game = data?.data;

  if (!game) return <ErrorMessage message={queryError?.message ?? '경기 정보를 찾을 수 없습니다.'} />;

  const ticketOpenTime = new Date(game.ticketOpenTime).getTime();
  const gameStartTime = new Date(game.gameStartTime).getTime();
  const remainingMs = Math.max(ticketOpenTime - now, 0);
  const isGamePast = gameStartTime <= now;
  const effectiveStatus =
    isGamePast
      ? 'CLOSED'
      : game.status === 'SCHEDULED' && remainingMs === 0
      ? 'TICKET_OPEN'
      : game.status;
  const isTicketOpen = !isGamePast && effectiveStatus === 'TICKET_OPEN';
  const countdown = formatCountdown(remainingMs);

  return (
    <section className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-blue-700">경기 상세</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">
              {game.homeTeamName} vs {game.awayTeamName}
            </h1>
          </div>
          <StatusBadge status={effectiveStatus} />
        </div>
        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          <Info label="경기 시작" value={formatDateTime(game.gameStartTime)} />
          <Info label="예매 오픈" value={formatDateTime(game.ticketOpenTime)} />
          <Info label="구장" value={game.stadium.name} />
          <Info label="위치" value={game.stadium.location} />
          <Info label="수용 인원" value={`${game.stadium.capacity.toLocaleString()}명`} />
        </dl>
        <div className="mt-8 space-y-3">
          <ErrorMessage message={error} />
          <button
            type="button"
            onClick={() => enterMutation.mutate()}
            disabled={enterMutation.isPending || !isTicketOpen}
            className="w-full rounded-md bg-blue-700 px-5 py-3 text-base font-bold text-white hover:bg-blue-800 disabled:opacity-60 sm:w-auto"
          >
            {enterMutation.isPending ? '대기열 입장 중' : isTicketOpen ? '예매하기' : isGamePast ? '예매 종료' : '예매 오픈 전'}
          </button>
        </div>
      </div>
      <aside className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-950">티켓 오픈</h2>
        <p className="mt-2 text-sm text-slate-600">{formatDateTime(game.ticketOpenTime)}</p>
        <div className={`mt-5 rounded-lg p-5 text-center ${isTicketOpen ? 'bg-green-50' : isGamePast ? 'bg-slate-100' : 'bg-amber-50'}`}>
          <p className={`text-sm font-bold ${isTicketOpen ? 'text-green-700' : isGamePast ? 'text-slate-600' : 'text-amber-700'}`}>
            {isTicketOpen ? '예매 가능' : isGamePast ? '예매 종료' : '예매 오픈까지'}
          </p>
          <p className={`mt-2 text-3xl font-black ${isTicketOpen ? 'text-green-800' : isGamePast ? 'text-slate-700' : 'text-amber-800'}`}>
            {isTicketOpen ? 'OPEN' : isGamePast ? 'CLOSED' : countdown}
          </p>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          {isGamePast
            ? '경기 시작 시간이 지난 경기는 예매할 수 없습니다.'
            : '티켓 오픈 시간이 지나면 예매 버튼이 자동으로 활성화됩니다.'}
        </p>
      </aside>
    </section>
  );
}

function formatCountdown(milliseconds: number) {
  const totalSeconds = Math.ceil(milliseconds / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const time = [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
  return days > 0 ? `${days}일 ${time}` : time;
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <dt className="text-xs font-bold uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 font-semibold text-slate-900">{value}</dd>
    </div>
  );
}
