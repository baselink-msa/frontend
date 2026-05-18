import type { GameSeat } from '../../types/seat';

type SeatItemProps = {
  seat: GameSeat;
  selected: boolean;
  onSelect: (seat: GameSeat) => void;
};

export function SeatItem({ seat, selected, onSelect }: SeatItemProps) {
  const disabled = seat.status !== 'AVAILABLE';
  const className = selected
    ? 'border-blue-700 bg-blue-700 text-white ring-2 ring-blue-200'
    : seat.status === 'AVAILABLE'
      ? 'border-blue-200 bg-blue-50 text-blue-900 hover:bg-blue-100'
      : seat.status === 'LOCKED'
        ? 'border-amber-300 bg-amber-100 text-amber-800'
        : 'border-slate-300 bg-slate-200 text-slate-500';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(seat)}
      className={`aspect-square rounded-md border text-xs font-bold transition disabled:cursor-not-allowed ${className}`}
      title={`${seat.sectionName} ${seat.seatRow}-${seat.seatNumber} ${seat.status}`}
    >
      {seat.seatRow}
      {seat.seatNumber}
    </button>
  );
}
