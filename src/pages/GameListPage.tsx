import { useQuery } from '@tanstack/react-query';
import { gameApi } from '../api/gameApi';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Loading } from '../components/common/Loading';
import { GameCard } from '../components/games/GameCard';

export function GameListPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['games'],
    queryFn: gameApi.getGames,
  });

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
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {data?.data.map((game) => <GameCard key={game.gameId} game={game} />)}
      </div>
    </section>
  );
}
