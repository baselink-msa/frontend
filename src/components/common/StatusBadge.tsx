type StatusBadgeProps = {
  status: string;
};

const getClassName = (status: string) => {
  if (['CONFIRMED', 'TICKET_OPEN', 'AVAILABLE', 'ACTIVE', 'ORDERED', 'ALLOWED'].includes(status)) {
    return 'bg-green-50 text-green-700 border-green-200';
  }
  if (['PENDING', 'WAITING', 'SCHEDULED', 'LOCKED', 'DELIVERING'].includes(status)) {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }
  if (['FAILED', 'EXPIRED', 'CLOSED'].includes(status)) {
    return 'bg-red-50 text-red-700 border-red-200';
  }
  return 'bg-slate-100 text-slate-600 border-slate-200';
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getClassName(status)}`}>
      {status}
    </span>
  );
}
