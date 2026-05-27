import { CalendarDays, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { GameSummary } from '../../types/game';
import { formatDateTime } from '../../utils/date';
import { StatusBadge } from '../common/StatusBadge';

type GameCardProps = {
  game: GameSummary;
};

export function GameCard({ game }: GameCardProps) {
  // 예매 오픈 시간이 지났으면 프론트에서 상태를 보정
  const effectiveStatus =
    game.status === 'SCHEDULED' && new Date(game.ticketOpenTime).getTime() <= Date.now()
      ? 'TICKET_OPEN'
      : game.status;

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-blue-700">{game.stadiumName}</p>
          <h2 className="mt-2 text-xl font-bold text-slate-950">
            {game.homeTeamName} vs {game.awayTeamName}
          </h2>
        </div>
        <StatusBadge status={effectiveStatus} />
      </div>
      <div className="mt-5 space-y-2 text-sm text-slate-600">
        <p className="flex items-center gap-2">
          <CalendarDays size={16} />
          경기 시작 {formatDateTime(game.gameStartTime)}
        </p>
        <p className="flex items-center gap-2">
          <MapPin size={16} />
          예매 오픈 {formatDateTime(game.ticketOpenTime)}
        </p>
      </div>
      <Link
        to={`/games/${game.gameId}`}
        className="mt-5 inline-flex w-full justify-center rounded-md bg-blue-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-800"
      >
        경기 상세
      </Link>
    </article>
  );
}
