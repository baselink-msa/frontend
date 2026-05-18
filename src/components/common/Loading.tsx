type LoadingProps = {
  label?: string;
};

export function Loading({ label = '불러오는 중입니다.' }: LoadingProps) {
  return (
    <div className="flex min-h-48 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      <span className="ml-3 text-sm font-medium">{label}</span>
    </div>
  );
}
