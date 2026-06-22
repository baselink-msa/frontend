# BaseLink Frontend

야구장 통합 관람 플랫폼 BaseLink의 React 프론트엔드입니다. Vite로 빌드한 정적 파일을 S3 + CloudFront에 배포하고, CloudFront `/api/*` 경로를 통해 EKS 백엔드 API와 연동합니다.

## 기술 스택

- React 18 + TypeScript + Vite
- Tailwind CSS
- React Router v6
- TanStack Query
- Zustand
- Axios
- Lucide React

## 실행

```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
```

개발 서버 기본 주소는 `http://localhost:5173`입니다.

## 환경변수

```bash
VITE_API_BASE_URL=/api
VITE_USE_MOCK=false
```

`VITE_USE_MOCK=true`로 설정하면 일부 화면을 백엔드 없이 Mock 데이터로 시연할 수 있습니다. 현재 배포 기준은 실제 API 연동입니다.

## 주요 화면

| 경로 | 설명 |
| --- | --- |
| `/` | 홈, 추천 경기 동적 로딩 |
| `/login`, `/signup` | 인증 |
| `/account` | 내 계정, 회원탈퇴 |
| `/games` | 경기 목록, 카드/리스트/날짜별 뷰, 구장/상태 필터, 팀명 검색 |
| `/games/:id` | 경기 상세, 예매 오픈 상태 표시, 대기열 진입 |
| `/games/:id/waiting-room` | Redis 대기열 순번 폴링, 예상 대기시간 표시, 입장 토큰 발급 |
| `/games/:id/seats` | 야구장 배치도 기반 좌석 선택, 좌석 선택 슬롯 반납 |
| `/reservations/:id` | 예매 결과, 확정/취소/좌석 다시 선택 |
| `/my-tickets` | 내 예매 목록, 취소, 좌석 변경, 확정하기 |
| `/orders` | 주류 주문 |
| `/chatbot` | FAQ + AI 챗봇 |
| `/admin` | 구장/경기/좌석/메뉴/FAQ CRUD, 경기별 대기열 정책 관리 |

## API 매핑

| API 경로 | 서비스 |
| --- | --- |
| `/api/auth` | auth-service |
| `/api/games` | game-service |
| `/api/admin` | admin-service |
| `/api/waiting-room` | waiting-room-service |
| `/api/seats/locks` | seat-lock-service |
| `/api/tickets` | ticket-service |
| `/api/orders` | order-service |
| `/api/chatbot` | ai-chatbot-service |

## 예매 흐름

1. 경기 목록 또는 홈 추천 경기에서 경기 상세로 이동
2. 예매 오픈 후 대기열 입장
3. 대기열 화면에서 내 순번, 앞 대기 인원, 예상 대기시간, 현재/예상 처리량 확인
4. 입장 가능 상태가 되면 입장 토큰을 발급받고 좌석 선택 화면으로 자동 이동
5. 좌석 화면에서 좌석을 UI로 선택
6. `예매 요청` 클릭 시 좌석 잠금과 예매 생성 수행
7. 예매 결과 화면에서 직접 확정 또는 취소
8. 확정 시 좌석 상태가 `SOLD`, 취소 시 `AVAILABLE`로 변경

좌석 선택 토큰은 예매 완료, 취소, 좌석 선택 페이지 이탈 시 반납해 다음 대기자가 입장할 수 있도록 처리합니다.

## 대기열 정책 관리

관리자 페이지에서 경기별 대기열 정책을 조회/수정할 수 있습니다.

```text
maxEnterPerMinute
-> 정책상 분당 최대 입장 허용 수

tokenTtlSeconds
-> 좌석 선택 입장 토큰 TTL

enabled
-> 대기열 사용 여부
```

사용자 대기열 화면은 서버가 내려주는 Ready Pod 수, 예상 확장 Pod 수, 현재 입장 처리량, 남은 입장 슬롯을 표시합니다.

## 계정 및 테스트 데이터 정리

`/account` 페이지에서 회원탈퇴를 수행할 수 있습니다.

회원탈퇴 시 테스트 계정의 예매 내역과 주문 내역도 함께 삭제되도록 백엔드 API와 연동합니다. k6 회원가입-로그인-예매 시나리오의 테스트 데이터 정리에도 같은 흐름을 사용합니다.

## 배포

```bash
npm run build
aws s3 sync dist/ s3://baselink-frontend-740831361032-ap-northeast-2 --delete
aws cloudfront create-invalidation --distribution-id E1L0BJIJOTT0R6 --paths "/*"
```

CloudFront 구성:

- S3 origin: 정적 프론트엔드
- ALB origin: `/api/*` 백엔드 API
- SPA fallback: 403/404를 `/index.html`로 응답

## 프로젝트 구조

```text
src/
  api/          도메인별 Axios API 클라이언트
  components/   공통 UI, 경기 카드, 좌석/채팅 컴포넌트
  mocks/        Mock API
  pages/        라우트 페이지
  store/        Zustand 상태
  types/        TypeScript 타입
  utils/        포맷/헬퍼 함수
```

## 인프라 정보

- AWS 계정: `740831361032`
- 리전: `ap-northeast-2`
- S3 버킷: `baselink-frontend-740831361032-ap-northeast-2`
- CloudFront 배포 ID: `E1L0BJIJOTT0R6`
- CloudFront 도메인: `d1z20dvak4bl13.cloudfront.net`
- EKS 클러스터: `baselink-dev`
- Kubernetes 네임스페이스: `baselink-dev`

## 남은 개선점

- 주문 페이지에서 예매 없이 직접 경기/좌석을 선택하는 UX 개선
- 좌석 잠금 TTL 만료 후 DB 상태 복구 흐름과 프론트 표시 정합성 보강
- 새로고침/브라우저 종료처럼 비동기 요청이 중단될 수 있는 상황에서 좌석 선택 슬롯 반납을 더 안정적으로 보강
