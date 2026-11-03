# 환경변수 및 소셜 로그인 설정 가이드

## 1. Dear Choco 전용 Supabase 프로젝트 생성

현재 다른 서비스에서 사용 중인 프로젝트와 DB를 섞지 마세요.
Supabase 대시보드에서 **새 프로젝트**를 만든 다음 다음 사항을 설정하세요.

1. 새 프로젝트의 SQL Editor에서 `supabase/schema.sql` 전문을 **한 번 실행**합니다.
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

## 3. Kakao 로그인

1. Kakao Developers에서 애플리케이션을 만들고 **카카오 로그인 ON**을 설정합니다.
2. REST API 키(Client ID)와 카카오 로그인 Client Secret을 준비합니다.
3. Kakao 로그인 Redirect URI에 다음 주소를 등록합니다.
   - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
4. Supabase의 Kakao Provider에 REST API 키와 Client Secret을 등록합니다.
5. 필요에 따라 프로필 닉네임/이미지 동의를 설정합니다.
6. 카카오에서 이메일 동의를 사용하지 않는 경우 Supabase Kakao 설정의
   **Allow users without an email** 여부를 확인합니다.

Kakao REST API 키와 Client Secret도 Supabase의 Provider 설정에만 입력합니다.

## 4. 배포 조건

- HTTPS가 설정된 실제 도메인 필요
- 정적 호스팅 서버에서 모든 앱 경로를 `/index.html`로 재작성하는 **SPA fallback** 필요
- 필요한 환경변수 두 개를 **빌드 시점**에 주입해야 합니다.
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
