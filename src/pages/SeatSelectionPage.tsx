import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
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
  const { ticketAccessToken, setSelectedSeat } = useReservationStore();
  const changeReservationId = (location.state as { changeReservationId?: number } | null)?.changeReservationId;
  const [sectionId, setSectionId] = useState<number | undefined>();
  const [pickedSeat, setPickedSeat] = useState<GameSeat | null>(null);
  const [error, setError] = useState('');

  const sectionsQuery = useQuery({
    queryKey: ['seat-sections', numericGameId],
    queryFn: () => gameApi.getSeatSections(numericGameId),
  });
  const seatsQuery = useQuery({
    queryKey: ['seats', numericGameId, sectionId],
    queryFn: () => gameApi.getSeats(numericGameId, { sectionId }),
  });

  // 로컬에서 잠금된 좌석 추적 (Redis 잠금이 DB에 반영 안 되므로)
  const [lockedSeatIds, setLockedSeatIds] = useState<Set<number>>(new Set());

  const displaySeats = useMemo(() => {
    const seats = seatsQuery.data?.data ?? [];
    if (lockedSeatIds.size === 0) return seats;
    return seats.map((seat) =>
      lockedSeatIds.has(seat.seatId) ? { ...seat, status: 'LOCKED' as const } : seat,
    );
  }, [seatsQuery.data, lockedSeatIds]);

  // 예매 요청: 잠금 → 예매 한 번에 처리
  const reservationMutation = useMutation({
    mutationFn: async () => {
      if (!pickedSeat) throw new Error('좌석을 선택해 주세요.');
      const accessToken = ticketAccessToken ?? `direct-seat-selection-${numericGameId}-${Date.now()}`;

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
    () => sectionsQuery.data?.data.find((section) => section.sectionId === pickedSeat?.sectionId),
    [sectionsQuery.data, pickedSeat],
  );

  if (sectionsQuery.isLoading || seatsQuery.isLoading) return <Loading label="좌석 정보를 불러오는 중입니다." />;

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold text-blue-700">Seat Selection</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">좌석 선택</h1>
          </div>
          <select
            value={sectionId ?? ''}
            onChange={(event) => setSectionId(event.target.value ? Number(event.target.value) : undefined)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold"
          >
            <option value="">전체 구역</option>
            {sectionsQuery.data?.data.map((section) => (
              <option key={section.sectionId} value={section.sectionId}>
                {section.sectionName}
              </option>
            ))}
          </select>
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
