import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
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
  const queryClient = useQueryClient();
  const { ticketAccessToken, selectedSeat, lockId, setSelectedSeat } = useReservationStore();
  const [sectionId, setSectionId] = useState<number | undefined>();
  const [error, setError] = useState('');

  const sectionsQuery = useQuery({
    queryKey: ['seat-sections', numericGameId],
    queryFn: () => gameApi.getSeatSections(numericGameId),
  });
  const seatsQuery = useQuery({
    queryKey: ['seats', numericGameId, sectionId],
    queryFn: () => gameApi.getSeats(numericGameId, { sectionId }),
  });

  const lockMutation = useMutation({
    mutationFn: (seat: GameSeat) => seatLockApi.createLock({ gameId: numericGameId, seatId: seat.seatId }),
    onSuccess: (response) => {
      const seat = seatsQuery.data?.data.find((item) => item.seatId === response.data.seatId);
      if (seat) setSelectedSeat({ ...seat, status: 'LOCKED' }, response.data.lockId);
      queryClient.invalidateQueries({ queryKey: ['seats', numericGameId] });
    },
    onError: (err) => setError(err.message || '좌석 잠금에 실패했습니다.'),
  });

  const reservationMutation = useMutation({
    mutationFn: () => {
      if (!selectedSeat || !lockId || !ticketAccessToken) {
        throw new Error('대기열 토큰 또는 좌석 잠금 정보가 없습니다.');
      }
      return ticketApi.createReservation({
        gameId: numericGameId,
        seatId: selectedSeat.seatId,
        lockId,
        ticketAccessToken,
        idempotencyKey: `ticket-1-${numericGameId}-${selectedSeat.seatId}`,
      });
    },
    onSuccess: (response) => navigate(`/reservations/${response.data.reservationId}`),
    onError: (err) => setError(err.message || '예매 요청에 실패했습니다.'),
  });

  const selectedSection = useMemo(
    () => sectionsQuery.data?.data.find((section) => section.sectionId === sectionId),
    [sectionsQuery.data, sectionId],
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
            seats={seatsQuery.data?.data ?? []}
            selectedSeatId={selectedSeat?.seatId}
            onSelect={(seat) => {
              setError('');
              lockMutation.mutate(seat);
            }}
          />
        </div>
      </div>
      <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-lg font-bold text-slate-950">선택 좌석</h2>
        {selectedSeat ? (
          <div className="mt-4 space-y-3 text-sm">
            <p className="font-semibold text-slate-900">
              {selectedSeat.sectionName} {selectedSeat.seatRow}-{selectedSeat.seatNumber}
            </p>
            <p className="text-slate-600">가격 {formatCurrency(selectedSection?.price ?? selectedSeat.price)}</p>
            <p className="text-slate-600">잠금 ID {lockId}</p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">AVAILABLE 좌석을 선택하면 임시 잠금됩니다.</p>
        )}
        <button
          type="button"
          disabled={!selectedSeat || !lockId || reservationMutation.isPending}
          onClick={() => reservationMutation.mutate()}
          className="mt-6 w-full rounded-md bg-blue-700 px-4 py-3 font-bold text-white hover:bg-blue-800 disabled:opacity-50"
        >
          {reservationMutation.isPending ? '예매 요청 중' : '예매 요청'}
        </button>
      </aside>
    </section>
  );
}
