# BaseLink Frontend

야구장 통합 관람 플랫폼 BaseLink의 발표용 프론트엔드입니다. S3 + CloudFront 정적 배포를 전제로 만들었고, 백엔드가 완성되기 전에도 `VITE_USE_MOCK=true`로 대기열, 좌석 잠금, 비동기 예매, 주문, 챗봇, 관리자 화면을 시연할 수 있습니다.

## 실행 방법

```bash
npm install
npm run dev
npm run build
```

개발 서버는 Vite 기본 주소인 `http://localhost:5173`에서 실행됩니다.

## 환경변수

`.env.example`을 기준으로 `.env`를 만들면 됩니다.

```bash
VITE_API_BASE_URL=/api
VITE_USE_MOCK=false
```

## Mock API 사용

`VITE_USE_MOCK=true`이면 `src/mocks/mockApi.ts`가 응답합니다.

- 로그인: `user@example.com / password1234`
- 관리자: `admin@example.com / password1234`
- 대기열: polling마다 순번이 줄고, 0이 되면 좌석 선택으로 이동합니다.
- 좌석: AVAILABLE 클릭 시 LOCKED 처리되고 `lockId`가 저장됩니다.
- 예매: 생성 직후 `PENDING`, 결과 조회를 몇 번 하면 `CONFIRMED`가 됩니다.

## 실제 API 연동

`VITE_USE_MOCK=false`로 변경하면 `src/api/client.ts`의 Axios instance가 실제 API를 호출합니다. `VITE_API_BASE_URL`은 `/api`까지 포함하는 값을 권장합니다.

예시:

```bash
VITE_API_BASE_URL=/api
VITE_USE_MOCK=false
```

JWT는 로그인 성공 후 `accessToken`을 localStorage에 저장하고, Axios interceptor에서 `Authorization: Bearer {accessToken}` 헤더를 자동으로 붙입니다.
로그인된 사용자의 `userId`는 대기열/좌석잠금/예매 서비스 연동을 위해 `X-User-Id` 헤더로 함께 전송합니다.

로컬 개발 서버에서는 `vite.config.ts`의 proxy가 `/api/...` 요청을 백엔드 MSA 포트로 나눠 보냅니다.

| API | 로컬 백엔드 |
| --- | --- |
| `/api/auth` | `http://localhost:8081` |
| `/api/games` | `http://localhost:8082` |
| `/api/admin` | `http://localhost:8083` |
| `/api/waiting-room` | `http://localhost:8084` |
| `/api/chatbot` | `http://localhost:8000` |
| `/api/orders` | `http://localhost:8001` |
| `/api/seats/locks` | `http://localhost:8086` |
| `/api/tickets` | `http://localhost:8087` |

백엔드 레포를 같은 상위 폴더에 받은 경우:

```bash
cd ../baselink-backend
docker compose up -d
./gradlew :auth-service:bootRun
./gradlew :game-service:bootRun
./gradlew :admin-service:bootRun
./gradlew :waiting-room-service:bootRun
./gradlew :seat-lock-service:bootRun
./gradlew :ticket-service:bootRun
```

주문/챗봇 서비스까지 확인하려면 백엔드 레포에서 별도 터미널로 실행합니다.

```bash
cd ../baselink-backend/order-service
uvicorn main:app --reload --port 8001

cd ../baselink-backend/ai-chatbot-service
uvicorn main:app --reload --port 8000
```

## 주요 구조

- `src/api`: 도메인별 API client
- `src/types`: API 요청/응답 타입
- `src/mocks`: 발표용 Mock 데이터와 동작
- `src/store`: Zustand 전역 상태
- `src/pages`: 라우팅 페이지
- `src/components`: 공통 UI, 경기 카드, 좌석 그리드, 채팅 메시지

## 라우팅

- `/`: 메인 페이지
- `/signup`: 회원가입
- `/games`: 경기 목록
- `/login`: 로그인
- `/games/:gameId`: 경기 상세
- `/games/:gameId/waiting-room`: 대기열
- `/games/:gameId/seats`: 좌석 선택
- `/reservations/:reservationId`: 예매 결과
- `/my-tickets`: 내 예매
- `/orders`: 주류 주문
- `/chatbot`: FAQ 챗봇
- `/admin`: 관리자

## 배포 참고

`npm run build` 결과물은 `dist/`에 생성됩니다. S3 정적 호스팅 또는 CloudFront origin으로 업로드하면 됩니다. React Router의 deep link를 위해 CloudFront/S3에서 403/404 응답을 `/index.html`로 fallback하도록 설정하세요.

### AWS 배포 환경

프로덕션 빌드는 `.env.production`을 사용합니다.

```bash
VITE_API_BASE_URL=/api
VITE_USE_MOCK=false
```

이 설정은 CloudFront에서 `/api/*`를 백엔드 API origin으로 라우팅하는 구성을 전제로 합니다. 예를 들어 기본 origin은 S3 정적 웹, `/api/*` behavior는 EKS 앞단의 ALB 또는 API Gateway로 연결합니다.

AWS CLI로 확인한 현재 상태:

- 계정: `740831361032`
- 리전: `ap-northeast-2`
- EKS 클러스터: `baselink-dev`
- 네임스페이스: `baselink-dev`
- 백엔드 서비스들은 EKS 안에 `ClusterIP`로 배포되어 있음
- 현재 외부 접근 가능한 ALB/NLB/API Gateway/Ingress 주소는 없음

따라서 아직 브라우저/CloudFront에서 직접 호출할 백엔드 URL은 없습니다. 백엔드 외부 진입점이 생기면 둘 중 하나로 배포하면 됩니다.

1. CloudFront `/api/*` behavior를 ALB/API Gateway origin으로 연결하고 `VITE_API_BASE_URL=/api` 유지
2. 별도 API 도메인을 사용하고 `VITE_API_BASE_URL=https://api.example.com/api`로 빌드
