import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { waitingRoomApi } from '../api/waitingRoomApi';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Loading } from '../components/common/Loading';
import { StatusBadge } from '../components/common/StatusBadge';
import { useReservationStore } from '../store/reservationStore';
import { formatSeconds } from '../utils/date';

export function WaitingRoomPage() {
  const { gameId = '0' } = useParams();
  const numericGameId = Number(gameId);
  const navigate = useNavigate();
  const setTicketAccessToken = useReservationStore((state) => state.setTicketAccessToken);
  const [error, setError] = useState('');
  const [displayedWaitSeconds, setDisplayedWaitSeconds] = useState(0);

  const issueTokenMutation = useMutation({
    mutationFn: () => waitingRoomApi.issueToken(numericGameId),
    onMutate: () => {
      setError('');
    },
    onSuccess: (response) => {
      setTicketAccessToken(response.data.ticketAccessToken, numericGameId);
      navigate(`/games/${numericGameId}/seats`, { replace: true });
    },
    onError: (err) => {
      setError(`${err.message || '대기열 토큰 발급에 실패했습니다.'} 잠시 후 다시 확인합니다.`);
    },
  });

  const statusQuery = useQuery({
    queryKey: ['waiting-room', numericGameId],
    queryFn: () => waitingRoomApi.status(numericGameId),
    refetchInterval: (query) => {
      if (issueTokenMutation.isSuccess) return false;
      const nextCheckAfterSeconds = query.state.data?.data.nextCheckAfterSeconds ?? 3;
      return Math.max(1, nextCheckAfterSeconds) * 1000;
    },
    enabled: Boolean(numericGameId),
  });

  const waitingState = statusQuery.data?.data;

  useEffect(() => {
    if (!waitingState) return;
    const elapsedSeconds = waitingState.serverTimeEpochMillis
      ? Math.floor((Date.now() - waitingState.serverTimeEpochMillis) / 1000)
      : 0;
    setDisplayedWaitSeconds(Math.max(0, (waitingState.estimatedWaitSeconds ?? 0) - elapsedSeconds));
  }, [waitingState?.estimatedWaitSeconds, waitingState?.position, waitingState?.serverTimeEpochMillis]);

  useEffect(() => {
    if (!waitingState || waitingState.canEnter || waitingState.status === 'ALLOWED') {
      setDisplayedWaitSeconds(0);
      return;
    }

    const timer = window.setInterval(() => {
      setDisplayedWaitSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [waitingState?.canEnter, waitingState?.status, waitingState?.position]);

  useEffect(() => {
    if (!waitingState || issueTokenMutation.isPending || issueTokenMutation.isSuccess) return;
    if (waitingState.canEnter || waitingState.status === 'ALLOWED') {
      issueTokenMutation.mutate();
    }
  }, [
    waitingState?.canEnter,
    waitingState?.status,
    issueTokenMutation.isPending,
    issueTokenMutation.isSuccess,
    issueTokenMutation.mutate,
  ]);

  if (statusQuery.isLoading) return <Loading label="대기열 상태를 확인하는 중입니다." />;

  const progress = waitingState ? Math.round(((300 - waitingState.position) / 300) * 100) : 0;

  return (
    <section className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-8 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-blue-700">Waiting Room</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">대기열 상태</h1>
        </div>
        <StatusBadge status={waitingState?.status ?? 'WAITING'} />
      </div>
      <ErrorMessage message={error || statusQuery.error?.message} />
      <div className="mt-8 text-center">
        <p className="text-sm font-semibold text-slate-500">현재 내 순번</p>
        <p className="mt-2 text-7xl font-black text-blue-700">{waitingState?.position ?? '-'}</p>
      </div>
      <div className="mt-8 h-3 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-blue-700 transition-all" style={{ width: `${progress}%` }} />
      </div>
      <dl className="mt-8 grid gap-4 sm:grid-cols-2">
        <Info label="현재 내 앞 대기 인원" value={`${waitingState?.peopleAhead ?? 0}명`} />
        <Info
          label="예상 대기 시간"
          value={waitingState?.canEnter ? '입장 가능' : formatSeconds(displayedWaitSeconds)}
          helper={waitingState?.canEnter ? '좌석 선택 화면으로 이동 중입니다' : waitTimeHelper(displayedWaitSeconds)}
        />
        <Info
          label="현재 입장 처리량"
          value={`${waitingState?.effectiveEnterPerMinute ?? 0}명/분`}
          helper={`Ready Pod ${waitingState?.currentReadyPodCount ?? 0}개 기준`}
        />
        <Info
          label="예상 확장 처리량"
          value={`${waitingState?.projectedEnterPerMinute ?? waitingState?.effectiveEnterPerMinute ?? 0}명/분`}
          helper={`예상 Pod ${waitingState?.projectedReadyPodCount ?? waitingState?.currentReadyPodCount ?? 0}개 기준`}
        />
        <Info
          label="이번 분 남은 입장 슬롯"
          value={`${waitingState?.currentMinuteRemainingSlots ?? 0}명`}
          helper={`정책 상한 ${waitingState?.policyMaxEnterPerMinute ?? 0}명/분`}
        />
      </dl>
      <p className="mt-8 rounded-lg bg-blue-50 px-4 py-3 text-center text-sm font-semibold text-blue-800">
        입장 가능 시 자동으로 좌석 선택 화면으로 이동합니다.
      </p>
    </section>
  );
}

function waitTimeHelper(seconds: number) {
  return seconds <= 0 ? '입장 가능 여부를 확인하는 중입니다' : '서버 처리량 기준으로 보정됩니다';
}

function Info({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 p-4 text-center">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="mt-1 text-xl font-bold text-slate-950">{value}</dd>
      {helper ? <p className="mt-1 text-xs font-semibold text-blue-700">{helper}</p> : null}
    </div>
  );
}
