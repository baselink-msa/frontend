type StatusBadgeProps = {
  status: string;
};

const statusLabels: Record<string, string> = {
  SCHEDULED: '예정',
  TICKET_OPEN: '예매중',
  SOLD_OUT: '매진',
  CLOSED: '종료',
  FINISHED: '종료',
  CANCELED: '취소',
  CONFIRMED: '확정',
  PENDING: '처리중',
  FAILED: '실패',
  AVAILABLE: '가능',
  LOCKED: '잠금',
  SOLD: '판매완료',
  WAITING: '대기중',
  ALLOWED: '입장가능',
  ORDERED: '주문완료',
  DELIVERING: '배달중',
  ACTIVE: '활성',
};

const getClassName = (status: string) => {
  if (['CONFIRMED', 'TICKET_OPEN', 'AVAILABLE', 'ACTIVE', 'ORDERED', 'ALLOWED'].includes(status)) {
    return 'bg-green-50 text-green-700 border-green-200';
  }
  if (['PENDING', 'WAITING', 'SCHEDULED', 'LOCKED', 'DELIVERING'].includes(status)) {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }
  if (['FAILED', 'EXPIRED', 'CLOSED', 'FINISHED', 'CANCELED', 'SOLD_OUT'].includes(status)) {
    return 'bg-red-50 text-red-700 border-red-200';
  }
  return 'bg-slate-100 text-slate-600 border-slate-200';
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const label = statusLabels[status] ?? status;
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getClassName(status)}`}>
      {label}
    </span>
  );
}
