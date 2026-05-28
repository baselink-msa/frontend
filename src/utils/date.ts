const parseDateTime = (value: string) => {
  if (/([zZ]|[+-]\d{2}:?\d{2})$/.test(value)) return new Date(value);
  return new Date(`${value}+09:00`);
};

export const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Seoul',
  }).format(parseDateTime(value));

export const formatSeconds = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remain = seconds % 60;
  return minutes > 0 ? `${minutes}분 ${remain}초` : `${remain}초`;
};
