import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/adminApi';
import { chatbotApi } from '../api/chatbotApi';
import { gameApi } from '../api/gameApi';
import { orderApi } from '../api/orderApi';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Loading } from '../components/common/Loading';
import type { GameSummary } from '../types/game';
import { formatDateTime } from '../utils/date';
import { formatCurrency } from '../utils/format';

type FormStatus = {
  success?: string;
  error?: string;
};

type AdminTab = 'games' | 'seats' | 'operations' | 'content' | 'lists';

const adminTabs: { id: AdminTab; label: string }[] = [
  { id: 'games', label: '경기/구장' },
  { id: 'seats', label: '좌석' },
  { id: 'operations', label: '운영' },
  { id: 'content', label: '메뉴/FAQ' },
  { id: 'lists', label: '조회/API' },
];

const teams = [
  'KIA Tigers',
  'LG Twins',
  'Doosan Bears',
  'Samsung Lions',
  'Lotte Giants',
  'SSG Landers',
  'KT Wiz',
  'Hanwha Eagles',
  'NC Dinos',
  'Kiwoom Heroes',
];

const stadiums = [
  { stadiumId: 1, name: '광주-KIA 챔피언스 필드' },
  { stadiumId: 2, name: '잠실야구장' },
  { stadiumId: 3, name: '대구 삼성 라이온즈 파크' },
  { stadiumId: 4, name: '사직야구장' },
  { stadiumId: 5, name: '인천 SSG 랜더스필드' },
];

const sectionNames = ['1루 내야석', '3루 내야석', '중앙 테이블석', '외야석', '응원석'];
const faqCategories = ['RULE', 'TERM', 'TICKET', 'STADIUM', 'ORDER'];
const gameStatuses = ['SCHEDULED', 'TICKET_OPEN', 'SOLD_OUT', 'CLOSED'];

const requiredAdminApis = [
  '구장 등록/수정/삭제 API',
  '팀 등록/수정/삭제 API',
  '경기 수정/상태 변경/삭제 API',
  '좌석 구역 수정/삭제 API',
  '좌석 조회/수정/삭제 API',
  '경기 좌석 조회/가격 변경/삭제 API',
  '메뉴 수정/삭제 API',
  'FAQ 수정/삭제 API',
  '관리자 사용자 권한 부여/회수 API',
];

const defaultDateTimeLocal = (hourOffset: number) => {
  const date = new Date(Date.now() + hourOffset * 60 * 60 * 1000);
  const timezoneOffset = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
};

const toLocalDateTime = (value: string) => `${value}:00`;

export function AdminPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<FormStatus>({});
  const [activeTab, setActiveTab] = useState<AdminTab>('games');

  const gamesQuery = useQuery({ queryKey: ['admin', 'games'], queryFn: gameApi.getGames });
  const menusQuery = useQuery({ queryKey: ['admin', 'menus'], queryFn: orderApi.getMenus });
  const faqsQuery = useQuery({ queryKey: ['admin', 'faqs'], queryFn: chatbotApi.getFaqs });

  const refreshAdminQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['admin'] });
    queryClient.invalidateQueries({ queryKey: ['games'] });
    queryClient.invalidateQueries({ queryKey: ['menus'] });
    queryClient.invalidateQueries({ queryKey: ['faqs'] });
  };

  const handleStatus = (nextStatus: FormStatus) => {
    setStatus(nextStatus);
    if (nextStatus.success) refreshAdminQueries();
  };

  return (
    <section>
      <div className="mb-6">
        <p className="text-sm font-bold text-blue-700">Admin Console</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">관리자 페이지</h1>
        <p className="mt-2 text-slate-600">
          경기, 좌석, 대기열 정책, 메뉴, FAQ를 등록하고 현재 데이터를 조회합니다.
        </p>
      </div>
      {status.success ? (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
          {status.success}
        </div>
      ) : null}
      <ErrorMessage message={status.error} />

      <div className="mb-5 overflow-x-auto border-b border-slate-200">
        <div className="flex min-w-max gap-1">
          {adminTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 px-4 py-3 text-sm font-bold transition ${
                activeTab === tab.id
                  ? 'border-blue-700 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'games' ? (
        <TabPanel title="경기/구장 관리" description="구장 정보를 확인하고 경기 일정을 등록합니다.">
          <div className="grid gap-5 xl:grid-cols-2">
            <StadiumAdminPanel />
            <GameCreatePanel onStatus={handleStatus} />
          </div>
        </TabPanel>
      ) : null}

      {activeTab === 'seats' ? (
        <TabPanel title="좌석 관리" description="구역, 좌석, 경기별 판매 좌석을 관리합니다.">
          <SeatAdminPanel games={gamesQuery.data?.data ?? []} onStatus={handleStatus} />
        </TabPanel>
      ) : null}

      {activeTab === 'operations' ? (
        <TabPanel title="운영 관리" description="대기열 정책과 경기 상태, 관리자 권한 같은 운영 액션을 관리합니다.">
          <div className="grid gap-5 xl:grid-cols-2">
            <WaitingPolicyPanel games={gamesQuery.data?.data ?? []} onStatus={handleStatus} />
            <AdminOperationPanel games={gamesQuery.data?.data ?? []} />
          </div>
        </TabPanel>
      ) : null}

      {activeTab === 'content' ? (
        <TabPanel title="메뉴/FAQ 관리" description="주문 메뉴와 챗봇 FAQ 콘텐츠를 등록합니다.">
          <div className="grid gap-5 xl:grid-cols-2">
            <MenuCreatePanel onStatus={handleStatus} />
            <FaqCreatePanel onStatus={handleStatus} />
          </div>
        </TabPanel>
      ) : null}

      {activeTab === 'lists' ? (
        <TabPanel title="조회 및 API 필요 목록" description="현재 조회 가능한 데이터와 추가로 필요한 백엔드 API를 확인합니다.">
          <div className="grid gap-5 xl:grid-cols-3">
            <GameListPanel games={gamesQuery.data?.data ?? []} isLoading={gamesQuery.isLoading} />
            <MenuListPanel menus={menusQuery.data?.data ?? []} isLoading={menusQuery.isLoading} />
            <FaqListPanel faqs={faqsQuery.data?.data ?? []} isLoading={faqsQuery.isLoading} />
          </div>
          <div className="mt-5">
            <AdminApiRoadmapPanel />
          </div>
        </TabPanel>
      ) : null}
    </section>
  );
}

function TabPanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-black text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
      {children}
    </div>
  );
}

function StadiumAdminPanel() {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState(20000);

  return (
    <Panel title="구장 관리" description="경기 등록에 사용할 구장 정보를 관리합니다.">
      <div className="grid gap-5">
        <form className="grid gap-3">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_140px]">
            <TextField label="구장명" value={name} onChange={setName} placeholder="서울 잠실야구장" />
            <TextField label="지역" value={location} onChange={setLocation} placeholder="서울 송파구" />
            <NumberField label="수용 인원" value={capacity} onChange={setCapacity} min={1} />
          </div>
          <DisabledAction label="구장 등록 API 필요" />
        </form>
        <div className="space-y-3 border-t border-slate-100 pt-5">
          {stadiums.map((stadium) => (
            <AdminListItem
              key={stadium.stadiumId}
              title={stadium.name}
              description={`구장 ID ${stadium.stadiumId}`}
              actionLabel="수정/삭제 API 필요"
            />
          ))}
        </div>
      </div>
    </Panel>
  );
}

function GameCreatePanel({ onStatus }: { onStatus: (status: FormStatus) => void }) {
  const [homeTeamName, setHomeTeamName] = useState(teams[0]);
  const [awayTeamName, setAwayTeamName] = useState(teams[1]);
  const [stadiumId, setStadiumId] = useState(stadiums[0].stadiumId);
  const [gameStartTime, setGameStartTime] = useState(defaultDateTimeLocal(72));
  const [ticketOpenTime, setTicketOpenTime] = useState(defaultDateTimeLocal(24));

  const mutation = useMutation({
    mutationFn: () => {
      if (homeTeamName === awayTeamName) throw new Error('홈팀과 원정팀은 다르게 선택해야 합니다.');
      return adminApi.createGame({
        homeTeamName,
        awayTeamName,
        stadiumId,
        gameStartTime: toLocalDateTime(gameStartTime),
        ticketOpenTime: toLocalDateTime(ticketOpenTime),
      });
    },
    onSuccess: (response) => onStatus({ success: response.message ?? '경기가 등록되었습니다.' }),
    onError: (err) => onStatus({ error: err.message ?? '경기 등록에 실패했습니다.' }),
  });

  return (
    <Panel title="경기 등록" description="팀, 구장, 경기 시작 시간과 예매 오픈 시간을 선택합니다.">
      <form onSubmit={(event) => submit(event, mutation.mutate)} className="grid gap-4">
        <div className="grid gap-3 md:grid-cols-2">
          <SelectField label="홈팀" value={homeTeamName} onChange={setHomeTeamName} options={teams} />
          <SelectField label="원정팀" value={awayTeamName} onChange={setAwayTeamName} options={teams} />
        </div>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">구장</span>
          <select
            value={stadiumId}
            onChange={(event) => setStadiumId(Number(event.target.value))}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            {stadiums.map((stadium) => (
              <option key={stadium.stadiumId} value={stadium.stadiumId}>
                {stadium.name}
              </option>
            ))}
          </select>
        </label>
        <div className="grid gap-3 md:grid-cols-2">
          <DateTimeField label="경기 시작" value={gameStartTime} onChange={setGameStartTime} />
          <DateTimeField label="예매 오픈" value={ticketOpenTime} onChange={setTicketOpenTime} />
        </div>
        <SubmitButton label="경기 등록" isPending={mutation.isPending} />
      </form>
    </Panel>
  );
}

function SeatAdminPanel({
  games,
  onStatus,
}: {
  games: GameSummary[];
  onStatus: (status: FormStatus) => void;
}) {
  const [stadiumId, setStadiumId] = useState(stadiums[0].stadiumId);
  const [sectionName, setSectionName] = useState(sectionNames[0]);
  const [price, setPrice] = useState(30000);
  const [seatRow, setSeatRow] = useState('A');
  const [seatStart, setSeatStart] = useState(1);
  const [seatEnd, setSeatEnd] = useState(10);
  const [gameId, setGameId] = useState<number | ''>('');
  const [seatIds, setSeatIds] = useState('');
  const [gameSeatPrice, setGameSeatPrice] = useState(30000);

  const selectedGame = games.find((game) => game.gameId === gameId);
  const seatSectionsQuery = useQuery({
    queryKey: ['admin', 'seat-sections', gameId],
    queryFn: () => gameApi.getSeatSections(Number(gameId)),
    enabled: Boolean(gameId),
  });

  const createSectionMutation = useMutation({
    mutationFn: () => adminApi.createSeatSection({ stadiumId, sectionName, price }),
    onSuccess: (response) => onStatus({ success: response.message ?? '좌석 구역이 등록되었습니다.' }),
    onError: (err) => onStatus({ error: err.message ?? '좌석 구역 등록에 실패했습니다.' }),
  });

  const createSeatsMutation = useMutation({
    mutationFn: async () => {
      const sectionId = seatSectionsQuery.data?.data.find((section) => section.sectionName === sectionName)?.sectionId;
      if (!sectionId) throw new Error('좌석 구역을 먼저 등록하거나 조회 가능한 구역을 선택해 주세요.');
      const numbers = Array.from({ length: seatEnd - seatStart + 1 }, (_, index) => seatStart + index);
      for (const seatNumber of numbers) {
        await adminApi.createSeat({
          stadiumId,
          sectionId,
          seatRow,
          seatNumber: String(seatNumber),
        });
      }
      return { message: `${numbers.length}개 좌석이 등록되었습니다.` };
    },
    onSuccess: (response) => onStatus({ success: response.message }),
    onError: (err) => onStatus({ error: err.message ?? '좌석 등록에 실패했습니다.' }),
  });

  const createGameSeatsMutation = useMutation({
    mutationFn: () => {
      if (!gameId) throw new Error('경기를 선택해 주세요.');
      const parsedSeatIds = seatIds
        .split(',')
        .map((item) => Number(item.trim()))
        .filter(Boolean);
      if (!parsedSeatIds.length) throw new Error('좌석 ID를 1개 이상 입력해 주세요.');
      return adminApi.createGameSeats(gameId, { seatIds: parsedSeatIds, price: gameSeatPrice });
    },
    onSuccess: (response) => onStatus({ success: response.message ?? '경기 좌석이 생성되었습니다.' }),
    onError: (err) => onStatus({ error: err.message ?? '경기 좌석 생성에 실패했습니다.' }),
  });

  return (
    <Panel title="좌석 관리" description="구역을 만들고, 연속 좌석과 경기별 판매 좌석을 등록합니다.">
      <div className="grid gap-5">
        <form onSubmit={(event) => submit(event, createSectionMutation.mutate)} className="grid gap-3">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">구장</span>
              <select
                value={stadiumId}
                onChange={(event) => setStadiumId(Number(event.target.value))}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                {stadiums.map((stadium) => (
                  <option key={stadium.stadiumId} value={stadium.stadiumId}>
                    {stadium.name}
                  </option>
                ))}
              </select>
            </label>
            <SelectField label="구역명" value={sectionName} onChange={setSectionName} options={sectionNames} />
            <NumberField label="구역 기본 가격" value={price} onChange={setPrice} min={0} step={1000} />
          </div>
          <SubmitButton label="좌석 구역 등록" isPending={createSectionMutation.isPending} />
        </form>

        <form onSubmit={(event) => submit(event, createSeatsMutation.mutate)} className="grid gap-3 border-t border-slate-100 pt-5">
          <div className="grid gap-3 md:grid-cols-4">
            <SelectField label="구역 선택" value={sectionName} onChange={setSectionName} options={sectionNames} />
            <TextField label="열" value={seatRow} onChange={setSeatRow} />
            <NumberField label="시작 번호" value={seatStart} onChange={setSeatStart} min={1} />
            <NumberField label="끝 번호" value={seatEnd} onChange={setSeatEnd} min={seatStart} />
          </div>
          <SubmitButton label="연속 좌석 등록" isPending={createSeatsMutation.isPending} />
        </form>

        <form onSubmit={(event) => submit(event, createGameSeatsMutation.mutate)} className="grid gap-3 border-t border-slate-100 pt-5">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">경기</span>
            <select
              value={gameId}
              onChange={(event) => setGameId(event.target.value ? Number(event.target.value) : '')}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">경기를 선택하세요</option>
              {games.map((game) => (
                <option key={game.gameId} value={game.gameId}>
                  #{game.gameId} {game.homeTeamName} vs {game.awayTeamName}
                </option>
              ))}
            </select>
          </label>
          {selectedGame ? (
            <p className="text-xs font-semibold text-slate-500">
              {selectedGame.stadiumName} · {formatDateTime(selectedGame.gameStartTime)}
            </p>
          ) : null}
          <div className="grid gap-3 md:grid-cols-[1fr_160px]">
            <TextField label="좌석 ID 목록" value={seatIds} onChange={setSeatIds} placeholder="1001,1002,1003" />
            <NumberField label="판매 가격" value={gameSeatPrice} onChange={setGameSeatPrice} min={0} step={1000} />
          </div>
          <SubmitButton label="경기 좌석 생성" isPending={createGameSeatsMutation.isPending} />
        </form>
      </div>
    </Panel>
  );
}

function WaitingPolicyPanel({
  games,
  onStatus,
}: {
  games: GameSummary[];
  onStatus: (status: FormStatus) => void;
}) {
  const [gameId, setGameId] = useState<number | ''>('');
  const [maxEnterPerMinute, setMaxEnterPerMinute] = useState(100);
  const [tokenTtlSeconds, setTokenTtlSeconds] = useState(300);
  const [enabled, setEnabled] = useState(true);

  const mutation = useMutation({
    mutationFn: () => {
      if (!gameId) throw new Error('경기를 선택해 주세요.');
      return adminApi.updateWaitingPolicy(gameId, { maxEnterPerMinute, tokenTtlSeconds, enabled });
    },
    onSuccess: (response) => onStatus({ success: response.message ?? '대기열 정책이 저장되었습니다.' }),
    onError: (err) => onStatus({ error: err.message ?? '대기열 정책 저장에 실패했습니다.' }),
  });

  return (
    <Panel title="대기열 정책" description="경기별 분당 입장 수와 대기열 토큰 TTL을 설정합니다.">
      <form onSubmit={(event) => submit(event, mutation.mutate)} className="grid gap-4">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">경기</span>
          <select
            value={gameId}
            onChange={(event) => setGameId(event.target.value ? Number(event.target.value) : '')}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">경기를 선택하세요</option>
            {games.map((game) => (
              <option key={game.gameId} value={game.gameId}>
                #{game.gameId} {game.homeTeamName} vs {game.awayTeamName}
              </option>
            ))}
          </select>
        </label>
        <div className="grid gap-3 md:grid-cols-3">
          <NumberField label="분당 입장 수" value={maxEnterPerMinute} onChange={setMaxEnterPerMinute} min={1} />
          <NumberField label="토큰 TTL 초" value={tokenTtlSeconds} onChange={setTokenTtlSeconds} min={60} />
          <label className="flex items-end gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
            <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />
            대기열 활성화
          </label>
        </div>
        <SubmitButton label="정책 저장" isPending={mutation.isPending} />
      </form>
    </Panel>
  );
}

function AdminOperationPanel({ games }: { games: GameSummary[] }) {
  const [gameId, setGameId] = useState<number | ''>('');
  const [status, setStatus] = useState(gameStatuses[0]);

  return (
    <Panel title="운영 액션" description="상태 변경, 삭제, 권한 관리처럼 운영 중 필요한 액션입니다.">
      <div className="grid gap-5">
        <div className="grid gap-3">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">경기 선택</span>
            <select
              value={gameId}
              onChange={(event) => setGameId(event.target.value ? Number(event.target.value) : '')}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">경기를 선택하세요</option>
              {games.map((game) => (
                <option key={game.gameId} value={game.gameId}>
                  #{game.gameId} {game.homeTeamName} vs {game.awayTeamName}
                </option>
              ))}
            </select>
          </label>
          <SelectField label="변경할 경기 상태" value={status} onChange={setStatus} options={gameStatuses} />
          <div className="flex flex-wrap gap-2">
            <DisabledAction label="경기 상태 변경 API 필요" />
            <DisabledAction label="경기 삭제 API 필요" danger />
          </div>
        </div>

        <div className="grid gap-3 border-t border-slate-100 pt-5">
          <p className="text-sm font-bold text-slate-950">관리자 권한</p>
          <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
            <input
              type="email"
              placeholder="admin@example.com"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <DisabledAction label="권한 부여 API 필요" />
            <DisabledAction label="권한 회수 API 필요" danger />
          </div>
        </div>

        <div className="grid gap-3 border-t border-slate-100 pt-5">
          <p className="text-sm font-bold text-slate-950">데이터 삭제</p>
          <div className="flex flex-wrap gap-2">
            <DisabledAction label="좌석 삭제 API 필요" danger />
            <DisabledAction label="경기 좌석 삭제 API 필요" danger />
            <DisabledAction label="메뉴 삭제 API 필요" danger />
            <DisabledAction label="FAQ 삭제 API 필요" danger />
          </div>
        </div>
      </div>
    </Panel>
  );
}

function AdminApiRoadmapPanel() {
  return (
    <Panel title="추가 백엔드 API 필요 목록" description="아래 API가 생기면 현재 화면의 준비중 액션을 바로 연결할 수 있습니다.">
      <ul className="grid gap-2">
        {requiredAdminApis.map((item) => (
          <li key={item} className="rounded-md bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">
            {item}
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function MenuCreatePanel({ onStatus }: { onStatus: (status: FormStatus) => void }) {
  const [name, setName] = useState('생맥주');
  const [price, setPrice] = useState(6000);
  const [available, setAvailable] = useState(true);

  const mutation = useMutation({
    mutationFn: () => adminApi.createMenu({ name, price, available }),
    onSuccess: (response) => onStatus({ success: response.message ?? '메뉴가 등록되었습니다.' }),
    onError: (err) => onStatus({ error: err.message ?? '메뉴 등록에 실패했습니다.' }),
  });

  return (
    <Panel title="메뉴 등록" description="야구장 주문 메뉴와 판매 상태를 등록합니다.">
      <form onSubmit={(event) => submit(event, mutation.mutate)} className="grid gap-4">
        <div className="grid gap-3 md:grid-cols-[1fr_160px_120px]">
          <TextField label="메뉴명" value={name} onChange={setName} />
          <NumberField label="가격" value={price} onChange={setPrice} min={0} step={500} />
          <label className="flex items-end gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
            <input type="checkbox" checked={available} onChange={(event) => setAvailable(event.target.checked)} />
            판매중
          </label>
        </div>
        <SubmitButton label="메뉴 등록" isPending={mutation.isPending} />
      </form>
    </Panel>
  );
}

function FaqCreatePanel({ onStatus }: { onStatus: (status: FormStatus) => void }) {
  const [category, setCategory] = useState(faqCategories[0]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [enabled, setEnabled] = useState(true);

  const mutation = useMutation({
    mutationFn: () => adminApi.createFaq({ category, question, answer, enabled }),
    onSuccess: (response) => onStatus({ success: response.message ?? 'FAQ가 등록되었습니다.' }),
    onError: (err) => onStatus({ error: err.message ?? 'FAQ 등록에 실패했습니다.' }),
  });

  return (
    <Panel title="FAQ 등록" description="챗봇에서 사용할 질문과 답변을 등록합니다.">
      <form onSubmit={(event) => submit(event, mutation.mutate)} className="grid gap-4">
        <div className="grid gap-3 md:grid-cols-[180px_1fr]">
          <SelectField label="카테고리" value={category} onChange={setCategory} options={faqCategories} />
          <TextField label="질문" value={question} onChange={setQuestion} placeholder="병살타가 뭐야?" />
        </div>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">답변</span>
          <textarea
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            className="mt-1 min-h-28 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            required
          />
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />
          챗봇 노출
        </label>
        <SubmitButton label="FAQ 등록" isPending={mutation.isPending} />
      </form>
    </Panel>
  );
}

function GameListPanel({ games, isLoading }: { games: GameSummary[]; isLoading: boolean }) {
  return (
    <Panel title="경기 조회" description="등록된 경기 목록입니다.">
      {isLoading ? <Loading label="경기 목록을 불러오는 중입니다." /> : null}
      <div className="space-y-3">
        {games.map((game) => (
          <AdminListItem
            key={game.gameId}
            title={`${game.homeTeamName} vs ${game.awayTeamName}`}
            description={`${game.stadiumName} · ${formatDateTime(game.gameStartTime)}`}
          />
        ))}
        {!isLoading && !games.length ? <EmptyText label="등록된 경기가 없습니다." /> : null}
      </div>
    </Panel>
  );
}

function MenuListPanel({
  menus,
  isLoading,
}: {
  menus: { menuId: number; name: string; price: number; available: boolean }[];
  isLoading: boolean;
}) {
  return (
    <Panel title="메뉴 조회" description="현재 주문 화면에 노출되는 메뉴입니다.">
      {isLoading ? <Loading label="메뉴를 불러오는 중입니다." /> : null}
      <div className="space-y-3">
        {menus.map((menu) => (
          <AdminListItem
            key={menu.menuId}
            title={menu.name}
            description={`${formatCurrency(menu.price)} · ${menu.available ? '판매중' : '품절'}`}
          />
        ))}
        {!isLoading && !menus.length ? <EmptyText label="등록된 메뉴가 없습니다." /> : null}
      </div>
    </Panel>
  );
}

function FaqListPanel({
  faqs,
  isLoading,
}: {
  faqs: { faqId: number; category: string; question: string; enabled: boolean }[];
  isLoading: boolean;
}) {
  return (
    <Panel title="FAQ 조회" description="챗봇 FAQ 목록입니다.">
      {isLoading ? <Loading label="FAQ를 불러오는 중입니다." /> : null}
      <div className="space-y-3">
        {faqs.map((faq) => (
          <AdminListItem
            key={faq.faqId}
            title={faq.question}
            description={`${faq.category} · ${faq.enabled ? '노출' : '숨김'}`}
          />
        ))}
        {!isLoading && !faqs.length ? <EmptyText label="등록된 FAQ가 없습니다." /> : null}
      </div>
    </Panel>
  );
}

function AdminListItem({
  title,
  description,
  actionLabel = '삭제 API 필요',
}: {
  title: string;
  description: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-slate-950">{title}</p>
        <p className="mt-1 truncate text-xs text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        disabled
        title="백엔드 API가 추가되면 연결할 수 있습니다."
        className="shrink-0 rounded-md border border-slate-200 px-3 py-2 text-xs font-bold text-slate-400"
      >
        {actionLabel}
      </button>
    </div>
  );
}

function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
      {children}
    </section>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        required
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  step,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  step?: number;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        required
      />
    </label>
  );
}

function DateTimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        type="datetime-local"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        required
      />
    </label>
  );
}

function SubmitButton({ label, isPending }: { label: string; isPending: boolean }) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className="w-fit rounded-md bg-blue-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-60"
    >
      {isPending ? '처리 중' : label}
    </button>
  );
}

function DisabledAction({ label, danger = false }: { label: string; danger?: boolean }) {
  return (
    <button
      type="button"
      disabled
      className={`w-fit rounded-md border px-3 py-2 text-xs font-bold ${
        danger
          ? 'border-red-100 bg-red-50 text-red-300'
          : 'border-slate-200 bg-slate-50 text-slate-400'
      }`}
    >
      {label}
    </button>
  );
}

function EmptyText({ label }: { label: string }) {
  return <p className="rounded-md bg-slate-50 px-3 py-4 text-sm text-slate-500">{label}</p>;
}

function submit(event: FormEvent, mutate: () => void) {
  event.preventDefault();
  mutate();
}
