# 환경변수 및 소셜 로그인 설정 가이드

## 1. Dear Choco 전용 Supabase 프로젝트 생성

현재 다른 서비스에서 사용 중인 프로젝트와 DB를 섞지 마세요.
Supabase 대시보드에서 **새 프로젝트**를 만든 다음 다음 사항을 설정하세요.

1. 새 프로젝트라면 SQL Editor에서 `supabase/schema.sql` 전문을 **한 번 실행**합니다.
   기존 Dear Choco 프로젝트 `lrpehigfvwddizepghnc`에는 2026-11-03에 이미 적용되었습니다.
   중복 실행하지 마세요.
2. `Authentication → Providers`에서 **Google, Kakao**를 활성화합니다.
3. `Authentication → URL Configuration`에서 실제 서비스 도메인을 Site URL로 지정합니다.
4. 아래 프론트엔드 콜백을 `Redirect URLs` 허용 목록에 넣습니다.
   - 로컬: `http://localhost:5173/auth/callback`
   - 서비스: `https://YOUR_DOMAIN/auth/callback`
5. Vite 개발 서버 또는 배포 환경에 `.env.local`의 공개 설정을 넣습니다.

### 프론트엔드 환경변수

| 키 | 값 출처 | 비고 |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL | 공개 가능한 URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase Publishable API Key | 브라우저용 공개 키 |

`.env.example`을 `.env.local`로 복사해서 값을 입력하세요.
**`service_role`, `secret` 키는 클라이언트 환경변수에 절대 넣지 마세요.**

## 2. Google 로그인

1. Google Cloud Console에서 OAuth 동의 화면과 웹 OAuth 클라이언트를 만듭니다.
2. Google의 `Authorized redirect URIs`에 다음 주소를 등록합니다.
   - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
3. 발급받은 Client ID와 Client Secret을 **Supabase의 Google Provider 설정**에 입력합니다.
4. 실제 배포 도메인과 로컬 허용 URL이 Supabase `Redirect URLs`에 있는지 확인합니다.

Google Client Secret은 `.env.local`의 `VITE_*`에 입력하지 않습니다.

## 3. Kakao 로그인 (이메일 권한 없는 커스텀 OIDC)

1. Kakao Developers에서 **카카오 로그인과 OpenID Connect**를 활성화합니다.
2. 닉네임·프로필 사진 동의를 허용하고 이메일 권한은 요청하지 않습니다.
3. Kakao 로그인 Redirect URI는 앱의 콜백으로 등록합니다.
   - 로컬: `http://localhost:5173/auth/callback`
   - 서비스: `https://YOUR_DOMAIN/auth/callback`
4. 공개 REST API 키를 클라이언트 `.env.local`의 `VITE_KAKAO_REST_API_KEY`에 넣습니다.
5. `supabase/functions/kakao-token/index.ts` Edge Function을 배포하고
   해당 함수에 아래 서버 측 Secret을 설정합니다.
   - `KAKAO_REST_API_KEY`: 카카오 REST API 키
   - `KAKAO_CLIENT_SECRET`: 카카오 Client Secret
   - `KAKAO_ALLOWED_ORIGINS`: 허용할 앱 Origin을 쉼표로 구분
     (로컬: `http://localhost:5173`; 배포 시에는 실제 HTTPS Origin 추가)
6. Supabase Kakao Provider에서 **Allow users without an email**을 활성화합니다.
7. 프론트엔드는 카카오 `id_token`을 `signInWithIdToken`에 전달해 Supabase 세션을 만듭니다.

`KAKAO_CLIENT_SECRET`을 `VITE_*`나 Git 저장소에 넣지 마세요.
기본 Supabase 카카오 OAuth가 아닌 별도의 코드 교환 방식이므로
카카오의 Redirect URI를 Supabase Callback URL로 바꾸지 마세요.

## 4. 배포 조건

- HTTPS가 설정된 실제 도메인 필요
- 정적 호스팅 서버에서 모든 앱 경로를 `/index.html`로 재작성하는 **SPA fallback** 필요
- 필요한 공개 환경변수(`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`,
  `VITE_KAKAO_REST_API_KEY`)를 **빌드 시점**에 주입해야 합니다.
- 카카오 Edge Function의 `KAKAO_ALLOWED_ORIGINS`에도 실제 서비스 Origin을 추가해야 합니다.
- Vite는 빌드된 HTML·JS·CSS 파일을 생성합니다. `npm run build` 결과물인 `dist`를 배포하세요.
- OAuth 실패 시 Provider 설정, Supabase Redirect URLs, 브라우저 네트워크 로그를 확인하세요.

## 5. 최초 동작 점검 순서

1. 카카오 계정으로 로그인 후 캘린더 생성, 친구용 링크 복사
2. 다른 계정으로 친구용 링크에 접근해 날짜 선택, 로그인, 메시지 작성
3. 캘린더 주인으로 지정 날짜 열람
4. 미래 날짜를 열 때 메시지 개수도 보이지 않는지 확인
5. 12월 25일 이후에 신규 메시지 작성이 막히는지 검증
6. 영문 모드와 모바일 화면에서 같은 경로를 반복 검증

공식 참고: [Google 로그인](https://supabase.com/docs/guides/auth/social-sign-in/auth-google),
[Kakao 로그인](https://supabase.com/docs/guides/auth/social-sign-in/auth-kakao),
[Supabase URL 구성](https://supabase.com/docs/guides/auth/redirect-urls).
