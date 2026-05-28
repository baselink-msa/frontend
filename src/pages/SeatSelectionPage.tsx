import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { gameApi } from '../api/gameApi';
import { seatLockApi } from '../api/seatLockApi';
import { ticketApi } from '../api/ticketApi';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Loading } from '../components/common/Loading';
import { SeatGrid } from '../components/seats/SeatGrid';
import { useReservationStore } from '../store/reservationStore';
import type { GameSeat } from '../types/seat';
import { formatCurrency } from '../utils/format';

export function SeatSelectionPage() {
  const { gameId = '0' } = useParams();
  const numericGameId = Number(gameId);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { ticketAccessToken, ticketAccessGameId, setSelectedSeat } = useReservationStore();
  const changeReservationId = (location.state as { changeReservationId?: number } | null)?.changeReservationId;
  const hasScopedTicketAccess = Boolean(ticketAccessToken && ticketAccessGameId === numericGameId);
  const [sectionId, setSectionId] = useState<number | undefined>();
  const [pickedSeat, setPickedSeat] = useState<GameSeat | null>(null);
  const [error, setError] = useState('');

  const gameQuery = useQuery({
    queryKey: ['game', numericGameId],
    queryFn: () => gameApi.getGame(numericGameId),
    enabled: Boolean(numericGameId),
  });
  const sectionsQuery = useQuery({
    queryKey: ['seat-sections', numericGameId],
    queryFn: () => gameApi.getSeatSections(numericGameId),
    enabled: Boolean(hasScopedTicketAccess || changeReservationId),
  });
  const seatsQuery = useQuery({
    queryKey: ['seats', numericGameId, sectionId],
    queryFn: () => gameApi.getSeats(numericGameId, { sectionId }),
    enabled: Boolean(hasScopedTicketAccess || changeReservationId),
  });

  // 로컬에서 잠금된 좌석 추적 (Redis 잠금이 DB에 반영 안 되므로)
  const [lockedSeatIds, setLockedSeatIds] = useState<Set<number>>(new Set());

  const displaySeats = useMemo(() => {
    const seats = Array.isArray(seatsQuery.data?.data) ? seatsQuery.data.data : [];
    if (lockedSeatIds.size === 0) return seats;
    return seats.map((seat) =>
      lockedSeatIds.has(seat.seatId) ? { ...seat, status: 'LOCKED' as const } : seat,
    );
  }, [seatsQuery.data, lockedSeatIds]);

  // 예매 요청: 잠금 → 예매 한 번에 처리
  const reservationMutation = useMutation({
    mutationFn: async () => {
      if (!pickedSeat) throw new Error('좌석을 선택해 주세요.');
      if (!hasScopedTicketAccess && !changeReservationId) {
        throw new Error('대기열 입장 후 좌석을 선택할 수 있습니다.');
      }
      const accessToken = hasScopedTicketAccess ? ticketAccessToken! : `seat-change-${numericGameId}-${Date.now()}`;

      // 1. 좌석 잠금
      const lockResponse = await seatLockApi.createLock({
        gameId: numericGameId,
        seatId: pickedSeat.seatId,
      });
      const lockId = lockResponse.data.lockId;

      // 2. 예매 요청
      const result = await ticketApi.createReservation({
        gameId: numericGameId,
        seatId: pickedSeat.seatId,
        lockId,
        ticketAccessToken: accessToken,
        idempotencyKey: `ticket-${numericGameId}-${pickedSeat.seatId}-${Date.now()}`,
      });

      if (changeReservationId) {
        await ticketApi.cancelReservation(changeReservationId);
      }

      // store에 저장
      setSelectedSeat({ ...pickedSeat, status: 'LOCKED' }, lockId);
      setLockedSeatIds((prev) => new Set(prev).add(pickedSeat.seatId));

      return result;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['seats', numericGameId] });
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
      navigate(`/reservations/${response.data.reservationId}`);
    },
    onError: (err) => setError(err.message || '예매 요청에 실패했습니다.'),
  });

  const selectedSection = useMemo(
    () => {
      const sections = Array.isArray(sectionsQuery.data?.data) ? sectionsQuery.data.data : [];
      return sections.find((section) => section.sectionId === pickedSeat?.sectionId);
    },
    [sectionsQuery.data, pickedSeat],
  );

  if (gameQuery.isLoading) return <Loading label="경기 정보를 확인하는 중입니다." />;

  const game = gameQuery.data?.data;
  const ticketOpenTime = game ? new Date(game.ticketOpenTime).getTime() : 0;
  const isTicketOpen = game ? game.status === 'TICKET_OPEN' || ticketOpenTime <= Date.now() : false;
  const hasSeatAccess = Boolean(hasScopedTicketAccess || changeReservationId);

  if (!game) {
    return <BlockedSeatAccess title="경기 정보를 찾을 수 없습니다." description={gameQuery.error?.message ?? '경기 목록에서 다시 선택해 주세요.'} to="/games" label="경기 목록으로" />;
  }

  if (!isTicketOpen) {
    return (
      <BlockedSeatAccess
        title="아직 예매 오픈 전입니다."
        description={`예매 오픈: ${new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Seoul' }).format(new Date(game.ticketOpenTime))}`}
        to={`/games/${numericGameId}`}
        label="경기 상세로"
      />
    );
  }

  if (!hasSeatAccess) {
    return (
      <BlockedSeatAccess
        title="대기열 입장이 필요합니다."
        description="좌석 선택은 예매하기 버튼을 눌러 대기열을 통과한 뒤 이용할 수 있습니다."
        to={`/games/${numericGameId}`}
        label="경기 상세로"
      />
    );
  }

  if (sectionsQuery.isLoading || seatsQuery.isLoading) return <Loading label="좌석 정보를 불러오는 중입니다." />;

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold text-blue-700">Seat Selection</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">좌석 선택</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setLockedSeatIds(new Set());
                seatsQuery.refetch();
              }}
              disabled={seatsQuery.isFetching}
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw size={16} className={seatsQuery.isFetching ? 'animate-spin' : ''} />
              새로고침
            </button>
            <select
              value={sectionId ?? ''}
              onChange={(event) => setSectionId(event.target.value ? Number(event.target.value) : undefined)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold"
            >
              <option value="">전체 구역</option>
              {(Array.isArray(sectionsQuery.data?.data) ? sectionsQuery.data.data : []).map((section) => (
                <option key={section.sectionId} value={section.sectionId}>
                  {section.sectionName}
                </option>
              ))}
            </select>
          </div>
        </div>
        <ErrorMessage message={error || seatsQuery.error?.message} />
        <div className="mt-4">
          <SeatGrid
            seats={displaySeats}
            selectedSeatId={pickedSeat?.seatId}
            onSelect={(seat) => {
              setError('');
              setPickedSeat(seat);
            }}
          />
        </div>
      </div>
      <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-lg font-bold text-slate-950">선택 좌석</h2>
        {pickedSeat ? (
          <div className="mt-4 space-y-3 text-sm">
            <p className="font-semibold text-slate-900">
              {pickedSeat.sectionName} {pickedSeat.seatRow}열 {pickedSeat.seatNumber}번
            </p>
            <p className="text-slate-600">가격 {formatCurrency(selectedSection?.price ?? pickedSeat.price)}</p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">좌석을 선택하면 예매할 수 있습니다.</p>
        )}
        <button
          type="button"
          disabled={!pickedSeat || reservationMutation.isPending}
          onClick={() => reservationMutation.mutate()}
          className="mt-6 w-full rounded-md bg-blue-700 px-4 py-3 font-bold text-white hover:bg-blue-800 disabled:opacity-50"
        >
          {reservationMutation.isPending ? '예매 처리 중...' : '예매 요청'}
        </button>
      </aside>
    </section>
  );
}

function BlockedSeatAccess({ title, description, to, label }: { title: string; description: string; to: string; label: string }) {
  return (
    <section className="mx-auto max-w-xl rounded-lg border border-slate-200 bg-white px-6 py-10 text-center shadow-soft sm:px-10">
      <h1 className="text-2xl font-bold leading-tight text-slate-950">{title}</h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-slate-600">{description}</p>
      <Link
        to={to}
        className="mt-8 inline-flex min-h-11 items-center justify-center rounded-md bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-blue-800"
      >
        {label}
      </Link>
    </section>
  );
}
