import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Filter, Grid3X3, List, MapPin, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { gameApi } from '../api/gameApi';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Loading } from '../components/common/Loading';
import { StatusBadge } from '../components/common/StatusBadge';
import { GameCard } from '../components/games/GameCard';
import type { GameStatus, GameSummary } from '../types/game';
import { formatDateTime } from '../utils/date';

const statusLabels: Record<GameStatus, string> = {
  SCHEDULED: '예정',
  TICKET_OPEN: '예매중',
  SOLD_OUT: '매진',
  CLOSED: '종료',
};

type ViewMode = 'grid' | 'list' | 'date';

export function GameListPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['games'],
    queryFn: gameApi.getGames,
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<GameStatus | ''>('');
  const [stadiumFilter, setStadiumFilter] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

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

  // 날짜별 그룹핑
  const dateGroups = useMemo(() => {
    const map = new Map<string, GameSummary[]>();
    for (const game of filtered) {
      const dateKey = game.gameStartTime.slice(0, 10); // YYYY-MM-DD
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(game);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const activeFilterCount = [statusFilter, stadiumFilter, search.trim()].filter(Boolean).length;

  if (isLoading) return <Loading label="경기 목록을 불러오는 중입니다." />;

  return (
    <section>
      <div className="mb-6 flex flex-col gap-2">
        <p className="text-sm font-bold text-blue-700">BaseLink</p>
        <h1 className="text-3xl font-bold text-slate-950">경기 목록</h1>
        <p className="max-w-3xl text-slate-600">
          예매 가능한 경기를 확인하고 좌석을 선택하세요.
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

          <div className="relative flex-1 min-w-[180px]">
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

          {/* 뷰 모드 토글 */}
          <div className="flex rounded-md border border-slate-200 overflow-hidden ml-auto">
            <ViewButton active={viewMode === 'grid'} onClick={() => setViewMode('grid')} title="카드">
              <Grid3X3 size={14} />
            </ViewButton>
            <ViewButton active={viewMode === 'list'} onClick={() => setViewMode('list')} title="리스트">
              <List size={14} />
            </ViewButton>
            <ViewButton active={viewMode === 'date'} onClick={() => setViewMode('date')} title="날짜별">
              <CalendarDays size={14} />
            </ViewButton>
          </div>
        </div>
      </div>

      {/* 결과 요약 */}
      <div className="mb-4">
        <p className="text-sm text-slate-600">
          총 <span className="font-bold text-slate-900">{filtered.length}</span>개 경기
          {filtered.length !== games.length ? ` (전체 ${games.length}개 중)` : ''}
        </p>
      </div>

      {/* 경기 표시 */}
      {filtered.length === 0 ? (
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
      ) : viewMode === 'grid' ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((game) => <GameCard key={game.gameId} game={game} />)}
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-2">
          {filtered.map((game) => <GameListItem key={game.gameId} game={game} />)}
        </div>
      ) : (
        <div className="space-y-6">
          {dateGroups.map(([date, dateGames]) => (
            <div key={date}>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700">
                <CalendarDays size={14} />
                {formatDateLabel(date)}
              </h3>
              <div className="space-y-2">
                {dateGames.map((game) => <GameListItem key={game.gameId} game={game} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function GameListItem({ game }: { game: GameSummary }) {
  const effectiveStatus =
    game.status === 'SCHEDULED' && new Date(game.ticketOpenTime).getTime() <= Date.now()
      ? 'TICKET_OPEN'
      : game.status;

  return (
    <Link
      to={`/games/${game.gameId}`}
      className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-soft hover:border-blue-200 hover:bg-blue-50/30 transition"
    >
      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-950 truncate">
          {game.homeTeamName} vs {game.awayTeamName}
        </p>
        <p className="mt-1 flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><MapPin size={12} />{game.stadiumName}</span>
          <span className="flex items-center gap-1"><CalendarDays size={12} />{formatDateTime(game.gameStartTime)}</span>
        </p>
      </div>
      <StatusBadge status={effectiveStatus} />
    </Link>
  );
}

function ViewButton({ active, onClick, title, children }: { active: boolean; onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`px-2.5 py-2 text-xs transition ${active ? 'bg-blue-700 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
    >
      {children}
    </button>
  );
}

function formatDateLabel(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00');
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = days[date.getDay()];
  return `${month}월 ${day}일 (${dayOfWeek})`;
}
