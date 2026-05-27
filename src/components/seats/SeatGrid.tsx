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

// 구역 배치 순서 (야구장 기준: 위에서 아래로)
const sectionOrder = ['중앙 테이블석', '1루 내야석', '3루 내야석', '외야석', '응원석'];

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
    const arr = Array.from(map.values());
    arr.sort((a, b) => {
      const ai = sectionOrder.indexOf(a.sectionName);
      const bi = sectionOrder.indexOf(b.sectionName);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
    return arr;
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

  // 구역 분류
  const centerSection = sections.find((s) => s.sectionName === '중앙 테이블석');
  const firstBase = sections.find((s) => s.sectionName === '1루 내야석');
  const thirdBase = sections.find((s) => s.sectionName === '3루 내야석');
  const outfield = sections.find((s) => s.sectionName === '외야석');
  const cheering = sections.find((s) => s.sectionName === '응원석');

  return (
    <div className="space-y-3">
      {/* 야구장 레이아웃 */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-green-50 to-white p-4 md:p-6">

        {/* 외야석 (상단 호 형태) */}
        {outfield ? (
          <div className="mb-4">
            <SectionBlock section={outfield} selectedSeatId={selectedSeatId} onSelect={onSelect} getRows={getRows} curved />
          </div>
        ) : null}

        {/* 필드 + 내야 */}
        <div className="relative mx-auto mb-4 max-w-lg">
          {/* 다이아몬드 필드 */}
          <div className="mx-auto w-40 h-40 md:w-48 md:h-48 relative">
            <div className="absolute inset-0 rotate-45 rounded-md bg-gradient-to-br from-green-400 to-green-600 shadow-lg" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className="text-2xl">⚾</span>
                <p className="text-[10px] font-bold text-white drop-shadow">FIELD</p>
              </div>
            </div>
            {/* 베이스 표시 */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-sm rotate-45 shadow" />
            <div className="absolute top-1/2 right-1 -translate-y-1/2 w-3 h-3 bg-white rounded-sm rotate-45 shadow" />
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-sm rotate-45 shadow" />
            <div className="absolute top-1/2 left-1 -translate-y-1/2 w-3 h-3 bg-white rounded-sm rotate-45 shadow" />
          </div>
        </div>

        {/* 내야석 (1루 / 3루 좌우 배치) */}
        <div className="grid gap-3 md:grid-cols-2 mb-4">
          {thirdBase ? (
            <SectionBlock section={thirdBase} selectedSeatId={selectedSeatId} onSelect={onSelect} getRows={getRows} />
          ) : null}
          {firstBase ? (
            <SectionBlock section={firstBase} selectedSeatId={selectedSeatId} onSelect={onSelect} getRows={getRows} />
          ) : null}
        </div>

        {/* 중앙 테이블석 (홈플레이트 뒤) */}
        {centerSection ? (
          <div className="mb-4">
            <SectionBlock section={centerSection} selectedSeatId={selectedSeatId} onSelect={onSelect} getRows={getRows} highlight />
          </div>
        ) : null}

        {/* 응원석 (하단) */}
        {cheering ? (
          <SectionBlock section={cheering} selectedSeatId={selectedSeatId} onSelect={onSelect} getRows={getRows} />
        ) : null}
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

function SectionBlock({
  section,
  selectedSeatId,
  onSelect,
  getRows,
  curved = false,
  highlight = false,
}: {
  section: SectionGroup;
  selectedSeatId?: number;
  onSelect: (seat: GameSeat) => void;
  getRows: (seats: GameSeat[]) => [string, GameSeat[]][];
  curved?: boolean;
  highlight?: boolean;
}) {
  const available = section.seats.filter((s) => s.status === 'AVAILABLE').length;
  const bgClass = highlight
    ? 'bg-amber-50 border-amber-200'
    : 'bg-white border-slate-200';

  return (
    <div className={`rounded-xl border p-3 ${bgClass} ${curved ? 'rounded-t-[40px]' : ''}`}>
      <div className="mb-2 flex items-center justify-between px-1">
        <h3 className="text-xs font-bold text-slate-800">{section.sectionName}</h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500">{available}/{section.seats.length}</span>
          <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
            ₩{section.price.toLocaleString()}
          </span>
        </div>
      </div>
      <div className="space-y-1">
        {getRows(section.seats).map(([rowName, rowSeats]) => (
          <div key={rowName} className="flex items-center gap-1">
            <span className="w-4 shrink-0 text-center text-[9px] font-bold text-slate-400">
              {rowName}
            </span>
            <div className="flex gap-[3px] justify-center flex-1">
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
}
