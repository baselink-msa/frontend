import type { GameSeat } from '../../types/seat';

type SeatItemProps = {
  seat: GameSeat;
  selected: boolean;
  onSelect: (seat: GameSeat) => void;
};

export function SeatItem({ seat, selected, onSelect }: SeatItemProps) {
  const disabled = seat.status !== 'AVAILABLE';
  const className = selected
    ? 'border-blue-700 bg-blue-700 text-white ring-1 ring-blue-300'
    : seat.status === 'AVAILABLE'
      ? 'border-blue-200 bg-blue-50 text-blue-900 hover:bg-blue-100 hover:border-blue-400'
      : seat.status === 'LOCKED'
        ? 'border-amber-300 bg-amber-100 text-amber-800'
        : 'border-slate-300 bg-slate-200 text-slate-400';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(seat)}
      className={`flex-1 min-w-[28px] h-7 rounded text-[10px] font-bold border transition disabled:cursor-not-allowed ${className}`}
      title={`${seat.sectionName} ${seat.seatRow}열 ${seat.seatNumber}번 (${seat.status})`}
    >
      {seat.seatNumber}
    </button>
  );
}
