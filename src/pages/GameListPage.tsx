import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Filter, Search } from 'lucide-react';
import { gameApi } from '../api/gameApi';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Loading } from '../components/common/Loading';
import { GameCard } from '../components/games/GameCard';
import type { GameStatus, GameSummary } from '../types/game';

const statusLabels: Record<GameStatus, string> = {
  SCHEDULED: '예정',
  TICKET_OPEN: '예매중',
  SOLD_OUT: '매진',
  CLOSED: '종료',
};

export function GameListPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['games'],
    queryFn: gameApi.getGames,
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<GameStatus | ''>('');
  const [stadiumFilter, setStadiumFilter] = useState('');

  const games = data?.data ?? [];

  const stadiums = useMemo(() => {
    const set = new Set(games.map((g) => g.stadiumName));
    return Array.from(set).sort();
  }, [games]);

  const filtered = useMemo(() => {
    let result: GameSummary[] = games;

    if (statusFilter) {
      result = result.filter((g) => g.status === statusFilter);
    }
    if (stadiumFilter) {
      result = result.filter((g) => g.stadiumName === stadiumFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (g) =>
          g.homeTeamName.toLowerCase().includes(q) ||
          g.awayTeamName.toLowerCase().includes(q) ||
          g.stadiumName.toLowerCase().includes(q),
      );
    }

    return result;
  }, [games, statusFilter, stadiumFilter, search]);

  const activeFilterCount = [statusFilter, stadiumFilter, search.trim()].filter(Boolean).length;

  if (isLoading) return <Loading label="경기 목록을 불러오는 중입니다." />;

  return (
    <section>
      <div className="mb-6 flex flex-col gap-2">
        <p className="text-sm font-bold text-blue-700">CloudFront → API Gateway → EKS</p>
        <h1 className="text-3xl font-bold text-slate-950">경기 목록</h1>
        <p className="max-w-3xl text-slate-600">
          정적 프론트엔드에서 Mock API 또는 실제 백엔드 API로 전환해 대기열, 좌석 잠금, SQS 기반
          비동기 예매 흐름을 시연합니다.
        </p>
      </div>

      <ErrorMessage message={error?.message} />

      {/* 필터 바 */}
      <div className="mb-5 rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <Filter size={16} />
            필터
            {activeFilterCount > 0 ? (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
                {activeFilterCount}
              </span>
            ) : null}
          </div>

          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="팀명 또는 구장 검색"
              className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm"
            />
          </div>

          <select
            value={stadiumFilter}
            onChange={(e) => setStadiumFilter(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">전체 구장</option>
            {stadiums.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as GameStatus | '')}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">전체 상태</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          {activeFilterCount > 0 ? (
            <button
              type="button"
              onClick={() => { setSearch(''); setStatusFilter(''); setStadiumFilter(''); }}
              className="rounded-md border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              초기화
            </button>
          ) : null}
        </div>
      </div>

      {/* 결과 요약 */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-600">
          총 <span className="font-bold text-slate-900">{filtered.length}</span>개 경기
          {filtered.length !== games.length ? ` (전체 ${games.length}개 중)` : ''}
        </p>
      </div>

      {/* 경기 카드 그리드 */}
      {filtered.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((game) => <GameCard key={game.gameId} game={game} />)}
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-6 py-12 text-center">
          <p className="text-sm font-semibold text-slate-500">
            {games.length === 0 ? '등록된 경기가 없습니다.' : '조건에 맞는 경기가 없습니다.'}
          </p>
          {activeFilterCount > 0 ? (
            <button
              type="button"
              onClick={() => { setSearch(''); setStatusFilter(''); setStadiumFilter(''); }}
              className="mt-3 text-sm font-bold text-blue-700 hover:underline"
            >
              필터 초기화
            </button>
          ) : null}
        </div>
      )}
    </section>
  );
}
