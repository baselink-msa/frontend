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

  const rows = (sectionSeats: GameSeat[]) => {
    const rowMap = new Map<string, GameSeat[]>();
    for (const seat of sectionSeats) {
      if (!rowMap.has(seat.seatRow)) rowMap.set(seat.seatRow, []);
      rowMap.get(seat.seatRow)!.push(seat);
    }
    // Sort seats within each row by seatNumber
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
    <div className="space-y-4">
      {/* 필드 표시 */}
      <div className="relative mx-auto w-full max-w-2xl">
        <div className="mx-auto h-16 w-3/4 rounded-b-[100%] bg-gradient-to-b from-green-600 to-green-700 flex items-center justify-center shadow-inner">
          <span className="text-sm font-bold text-white tracking-widest">⚾ FIELD</span>
        </div>
      </div>

      {/* 구역별 좌석 배치 */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sections.map((section) => (
          <div
            key={section.sectionId}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">{section.sectionName}</h3>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
                ₩{section.price.toLocaleString()}
              </span>
            </div>
            <div className="space-y-1">
              {rows(section.seats).map(([rowName, rowSeats]) => (
                <div key={rowName} className="flex items-center gap-1">
                  <span className="w-5 text-center text-[10px] font-bold text-slate-400">
                    {rowName}
                  </span>
                  <div className="flex flex-1 gap-0.5">
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
            <div className="mt-2 text-[10px] text-slate-400">
              {section.seats.filter((s) => s.status === 'AVAILABLE').length}/{section.seats.length}석 예매 가능
            </div>
          </div>
        ))}
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap justify-center gap-4 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded border border-blue-200 bg-blue-50" />
          예매 가능
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded border border-blue-700 bg-blue-700" />
          선택됨
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded border border-amber-300 bg-amber-100" />
          잠금 중
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded border border-slate-300 bg-slate-200" />
          판매 완료
        </span>
      </div>
    </div>
  );
}
