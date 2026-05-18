import { useState } from 'react';
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

  if (isLoading) return <Loading label="경기 상세를 불러오는 중입니다." />;
  const game = data?.data;

  if (!game) return <ErrorMessage message={queryError?.message ?? '경기 정보를 찾을 수 없습니다.'} />;

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
          <StatusBadge status={game.status} />
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
            disabled={enterMutation.isPending}
            className="w-full rounded-md bg-blue-700 px-5 py-3 text-base font-bold text-white hover:bg-blue-800 disabled:opacity-60 sm:w-auto"
          >
            {enterMutation.isPending ? '대기열 입장 중' : '예매하기'}
          </button>
        </div>
      </div>
      <aside className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-950">시연 흐름</h2>
        <ol className="mt-4 space-y-3 text-sm text-slate-600">
          <li>1. Redis 대기열에 입장합니다.</li>
          <li>2. polling으로 순번을 확인합니다.</li>
          <li>3. 입장 토큰 발급 후 좌석 선택으로 이동합니다.</li>
          <li>4. 좌석 잠금 후 SQS 비동기 예매 요청을 생성합니다.</li>
        </ol>
      </aside>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <dt className="text-xs font-bold uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 font-semibold text-slate-900">{value}</dd>
    </div>
  );
}
