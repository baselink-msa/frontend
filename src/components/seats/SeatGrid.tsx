import { useMemo } from 'react';
import type { GameSeat } from '../../types/seat';
import { SeatItem } from './SeatItem';

type SeatGridProps = {
  seats: GameSeat[];
  selectedSeatId?: number;
  onSelect: (seat: GameSeat) => void;
};

type SectionGroup = {
  sectionName: string;
  sectionId: number;
  seats: GameSeat[];
  price: number;
};

export function SeatGrid({ seats, selectedSeatId, onSelect }: SeatGridProps) {
  const sections = useMemo(() => {
    const map = new Map<number, SectionGroup>();
    for (const seat of seats) {
      if (!map.has(seat.sectionId)) {
        map.set(seat.sectionId, {
          sectionName: seat.sectionName,
          sectionId: seat.sectionId,
          seats: [],
          price: seat.price,
        });
      }
      map.get(seat.sectionId)!.seats.push(seat);
    }
    return Array.from(map.values());
  }, [seats]);

  const getRows = (sectionSeats: GameSeat[]) => {
    const rowMap = new Map<string, GameSeat[]>();
    for (const seat of sectionSeats) {
      if (!rowMap.has(seat.seatRow)) rowMap.set(seat.seatRow, []);
      rowMap.get(seat.seatRow)!.push(seat);
    }
    for (const arr of rowMap.values()) {
      arr.sort((a, b) => Number(a.seatNumber) - Number(b.seatNumber));
    }
    return Array.from(rowMap.entries()).sort(([a], [b]) => a.localeCompare(b));
  };

  if (!seats.length) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
        <p className="text-sm text-slate-500">이 경기에 등록된 좌석이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* 필드 */}
      <div className="mx-auto w-full max-w-xl">
        <div className="mx-auto h-14 w-4/5 rounded-b-[80px] bg-gradient-to-b from-green-500 to-green-700 flex items-center justify-center">
          <span className="text-xs font-bold text-white tracking-[0.2em]">⚾ FIELD</span>
        </div>
      </div>

      {/* 구역별 좌석 */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sections.map((section) => {
          const available = section.seats.filter((s) => s.status === 'AVAILABLE').length;
          return (
            <div
              key={section.sectionId}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">{section.sectionName}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500">{available}/{section.seats.length}석</span>
                  <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
                    ₩{section.price.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="space-y-1.5">
                {getRows(section.seats).map(([rowName, rowSeats]) => (
                  <div key={rowName} className="flex items-center gap-1.5">
                    <span className="w-4 text-center text-[10px] font-bold text-slate-400">
                      {rowName}
                    </span>
                    <div className="flex gap-1 flex-wrap">
                      {rowSeats.map((seat) => (
                        <SeatItem
                          key={seat.gameSeatId}
                          seat={seat}
                          selected={seat.seatId === selectedSeatId}
                          onSelect={onSelect}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap justify-center gap-4 rounded-lg bg-slate-50 border border-slate-100 px-4 py-3 text-xs font-semibold text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-4 w-4 rounded border border-blue-200 bg-blue-50" />
          예매 가능
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-4 w-4 rounded border-2 border-blue-700 bg-blue-700" />
          선택됨
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-4 w-4 rounded border border-amber-300 bg-amber-100" />
          잠금 중
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-4 w-4 rounded border border-slate-300 bg-slate-200" />
          판매 완료
        </span>
      </div>
    </div>
  );
}
