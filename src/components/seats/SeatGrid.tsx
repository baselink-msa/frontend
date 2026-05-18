import type { GameSeat } from '../../types/seat';
import { SeatItem } from './SeatItem';

type SeatGridProps = {
  seats: GameSeat[];
  selectedSeatId?: number;
  onSelect: (seat: GameSeat) => void;
};

export function SeatGrid({ seats, selectedSeatId, onSelect }: SeatGridProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="mb-5 rounded-md bg-slate-900 px-4 py-3 text-center text-sm font-bold text-white">
        FIELD
      </div>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12">
        {seats.map((seat) => (
          <SeatItem
            key={seat.gameSeatId}
            seat={seat}
            selected={seat.seatId === selectedSeatId}
            onSelect={onSelect}
          />
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold text-slate-600">
        <span className="inline-flex items-center gap-1">
          <span className="h-3 w-3 rounded border border-blue-200 bg-blue-50" />
          AVAILABLE
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-3 w-3 rounded border border-amber-300 bg-amber-100" />
          LOCKED
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-3 w-3 rounded border border-slate-300 bg-slate-200" />
          SOLD
        </span>
      </div>
    </div>
  );
}
