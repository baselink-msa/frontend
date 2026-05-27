# BaseLink Frontend

야구장 통합 관람 플랫폼 BaseLink의 프론트엔드입니다.
S3 + CloudFront로 정적 배포되며, EKS 백엔드 API와 연동합니다.

## 기술 스택

- React 18 + TypeScript
- Vite (빌드)
- TanStack Query (서버 상태 관리)
- Zustand (클라이언트 상태)
- Tailwind CSS (스타일링)
- React Router v6 (라우팅)
- Axios (HTTP 클라이언트)
- Lucide React (아이콘)

## 실행 방법

```bash
npm install
npm run dev      # 개발 서버 (http://localhost:5173)
npm run build    # 프로덕션 빌드 (dist/)
```

## 환경변수

```bash
# .env (로컬 개발)
VITE_API_BASE_URL=/api
VITE_USE_MOCK=false

# .env.production (프로덕션 빌드)
VITE_API_BASE_URL=/api
VITE_USE_MOCK=false
```

`VITE_USE_MOCK=true`로 설정하면 백엔드 없이 Mock 데이터로 시연 가능합니다.

## 배포

S3 + CloudFront로 배포됩니다.

```bash
# 빌드 → S3 업로드 → CloudFront 캐시 무효화
npm run build
aws s3 sync dist/ s3://baselink-frontend-740831361032-ap-northeast-2 --delete
aws cloudfront create-invalidation --distribution-id E1L0BJIJOTT0R6 --paths "/*"
```

CloudFront 구성:
- 기본 origin: S3 (정적 파일)
- `/api/*` behavior: EKS ALB origin (백엔드 API)
- 403/404 → `/index.html` fallback (SPA 라우팅)

## 주요 페이지

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/` | 홈 | 슬라이드 배너, 추천 경기, 퀵 링크 |
| `/login` | 로그인 | 이메일/비밀번호 |
| `/signup` | 회원가입 | |
| `/games` | 경기 목록 | 카드/리스트/날짜별 뷰, 구장·상태 필터, 검색 |
| `/games/:id` | 경기 상세 | 예매 오픈 카운트다운, 대기열 입장 |
| `/games/:id/waiting-room` | 대기열 | 순번 폴링, 입장 토큰 발급 |
| `/games/:id/seats` | 좌석 선택 | 야구장 배치도 UI, 구역별 좌석 |
| `/reservations/:id` | 예매 확인 | 확정/취소/좌석 다시 선택 |
| `/my-tickets` | 내 예매 | 예매 목록, 취소/좌석 변경 |
| `/orders` | 주류 주문 | 메뉴 선택, 주문 생성 |
| `/chatbot` | FAQ 챗봇 | FAQ + AI 답변 |
| `/admin` | 관리자 | 구장/경기/좌석/메뉴/FAQ CRUD |

## 백엔드 API 연동

| API 경로 | 백엔드 서비스 | 포트 |
|----------|-------------|------|
| `/api/auth` | auth-service | 8081 |
| `/api/games` | game-service | 8082 |
| `/api/admin` | admin-service | 8083 |
| `/api/waiting-room` | waiting-room-service | 8084 |
| `/api/chatbot` | ai-chatbot-service | 8000 |
| `/api/orders` | order-service | 8001 |
| `/api/seats/locks` | seat-lock-service | 8086 |
| `/api/tickets` | ticket-service | 8087 |

## 예매 흐름

1. 경기 목록 → 경기 상세 → "예매하기" 클릭
2. 대기열 진입 → 순번 대기 → 입장 토큰 발급
3. 좌석 선택 (야구장 배치도) → "예매 요청" 클릭
4. 예매 확인 페이지 → "예매 확정" 또는 "좌석 다시 선택" 또는 "취소"
5. 확정 시 좌석이 SOLD로 변경, 내 예매에서 확인 가능

## 프로젝트 구조

```
src/
├── api/          # 도메인별 API 클라이언트 (axios)
├── components/   # 공통 UI, 경기 카드, 좌석 그리드, 채팅
├── mocks/        # Mock API (시연용)
├── pages/        # 라우팅 페이지
├── store/        # Zustand 전역 상태 (auth, reservation)
├── types/        # TypeScript 타입 정의
└── utils/        # 날짜 포맷, 통화 포맷 등 유틸
```

## 인프라 정보

- AWS 계정: `740831361032`
- 리전: `ap-northeast-2` (서울)
- S3 버킷: `baselink-frontend-740831361032-ap-northeast-2`
- CloudFront: `E1L0BJIJOTT0R6` (`d1z20dvak4bl13.cloudfront.net`)
- EKS 클러스터: `baselink-dev`
- 네임스페이스: `baselink-dev`
