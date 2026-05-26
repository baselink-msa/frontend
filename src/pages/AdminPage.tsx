import { FormEvent, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { adminApi } from '../api/adminApi';
import { ErrorMessage } from '../components/common/ErrorMessage';

type FormStatus = {
  success?: string;
  error?: string;
};

export function AdminPage() {
  const [status, setStatus] = useState<FormStatus>({});

  return (
    <section>
      <div className="mb-6">
        <p className="text-sm font-bold text-blue-700">Admin Console</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">관리자 최소 화면</h1>
        <p className="mt-2 text-slate-600">
          경기, 좌석, 대기열 정책, 메뉴, FAQ 등록 API를 시연하기 위한 폼입니다.
        </p>
      </div>
      {status.success ? (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
          {status.success}
        </div>
      ) : null}
      <ErrorMessage message={status.error} />
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <AdminForm
          title="경기 등록"
          fields={[
            ['homeTeamName', '홈 팀', 'KIA Tigers'],
            ['awayTeamName', '원정 팀', 'LG Twins'],
            ['stadiumId', '구장 ID', '1'],
            ['gameStartTime', '경기 시작', '2026-06-01T18:30:00+09:00'],
            ['ticketOpenTime', '예매 오픈', '2026-05-25T14:00:00+09:00'],
          ]}
          onSubmit={(values) =>
            adminApi.createGame({
              homeTeamName: values.homeTeamName,
              awayTeamName: values.awayTeamName,
              stadiumId: Number(values.stadiumId),
              gameStartTime: values.gameStartTime,
              ticketOpenTime: values.ticketOpenTime,
            })
          }
          onStatus={setStatus}
        />
        <AdminForm
          title="좌석 구역 등록"
          fields={[
            ['stadiumId', '구장 ID', '1'],
            ['sectionName', '구역명', '1루 내야석'],
            ['price', '가격', '30000'],
          ]}
          onSubmit={(values) =>
            adminApi.createSeatSection({
              stadiumId: Number(values.stadiumId),
              sectionName: values.sectionName,
              price: Number(values.price),
            })
          }
          onStatus={setStatus}
        />
        <AdminForm
          title="좌석 등록"
          fields={[
            ['stadiumId', '구장 ID', '1'],
            ['sectionId', '구역 ID', '1'],
            ['seatRow', '열', 'A'],
            ['seatNumber', '번호', '1'],
          ]}
          onSubmit={(values) =>
            adminApi.createSeat({
              stadiumId: Number(values.stadiumId),
              sectionId: Number(values.sectionId),
              seatRow: values.seatRow,
              seatNumber: values.seatNumber,
            })
          }
          onStatus={setStatus}
        />
        <AdminForm
          title="경기 좌석 생성"
          fields={[
            ['gameId', '경기 ID', '1'],
            ['seatIds', '좌석 IDs', '1001,1002,1003'],
            ['price', '가격', '30000'],
          ]}
          onSubmit={(values) =>
            adminApi.createGameSeats(Number(values.gameId), {
              seatIds: values.seatIds.split(',').map((item) => Number(item.trim())),
              price: Number(values.price),
            })
          }
          onStatus={setStatus}
        />
        <AdminForm
          title="대기열 정책 설정"
          fields={[
            ['gameId', '경기 ID', '1'],
            ['maxEnterPerMinute', '분당 입장 수', '100'],
            ['tokenTtlSeconds', '토큰 TTL', '300'],
            ['enabled', '활성화', 'true'],
          ]}
          onSubmit={(values) =>
            adminApi.updateWaitingPolicy(Number(values.gameId), {
              maxEnterPerMinute: Number(values.maxEnterPerMinute),
              tokenTtlSeconds: Number(values.tokenTtlSeconds),
              enabled: values.enabled === 'true',
            })
          }
          onStatus={setStatus}
        />
        <AdminForm
          title="메뉴 등록"
          fields={[
            ['name', '메뉴명', '생맥주'],
            ['price', '가격', '6000'],
            ['available', '판매 여부', 'true'],
          ]}
          onSubmit={(values) =>
            adminApi.createMenu({
              name: values.name,
              price: Number(values.price),
              available: values.available === 'true',
            })
          }
          onStatus={setStatus}
        />
        <AdminForm
          title="FAQ 등록"
          fields={[
            ['category', '카테고리', 'TERM'],
            ['question', '질문', '병살타가 뭐야?'],
            ['answer', '답변', '병살타는 하나의 플레이로 두 명의 주자가 아웃되는 상황입니다.'],
            ['enabled', '활성화', 'true'],
          ]}
          onSubmit={(values) =>
            adminApi.createFaq({
              category: values.category,
              question: values.question,
              answer: values.answer,
              enabled: values.enabled === 'true',
            })
          }
          onStatus={setStatus}
        />
      </div>
    </section>
  );
}

type AdminFormProps = {
  title: string;
  fields: [key: string, label: string, defaultValue: string][];
  onSubmit: (values: Record<string, string>) => Promise<{ message?: string }>;
  onStatus: (status: FormStatus) => void;
};

function AdminForm({ title, fields, onSubmit, onStatus }: AdminFormProps) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(fields.map(([key, , defaultValue]) => [key, defaultValue])),
  );
  const mutation = useMutation({
    mutationFn: () => onSubmit(values),
    onSuccess: (response) => onStatus({ success: response.message ?? '저장되었습니다.' }),
    onError: (err) => onStatus({ error: err.message ?? '저장에 실패했습니다.' }),
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    mutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <h2 className="text-lg font-bold text-slate-950">{title}</h2>
      <div className="mt-4 grid gap-3">
        {fields.map(([key, label]) => (
          <label key={key} className="block">
            <span className="text-sm font-semibold text-slate-700">{label}</span>
            <input
              value={values[key]}
              onChange={(event) => setValues((prev) => ({ ...prev, [key]: event.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
        ))}
      </div>
      <button
        type="submit"
        disabled={mutation.isPending}
        className="mt-5 rounded-md bg-blue-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-60"
      >
        저장
      </button>
    </form>
  );
}
