# Advent — 2026 초콜릿 어드벤트 캘린더

**범위:** 2026년 11월 5일~12월 25일, 한국 시간(KST) 기준. 51개 날짜 서랍, 국문·영문,
카카오·구글 로그인, 캘린더 생성 및 링크 공유, 로그인 필수 익명 메시지 작성,
소유자 전용 날짜별 열람을 구현합니다.

## 실행

```bash
cp .env.example .env.local
# .env.local에 본인 전용 Supabase URL과 공개 키 설정
npm install
npm run dev
```

검증: `npm run lint`, `npm test`, `npm run build`.

**중요:** Advent 전용 Supabase 프로젝트에는 2026-11-03에 초기 DB 스키마를 적용했습니다.
다른 프로젝트에 배포할 때는 스키마, Google OAuth, 카카오 OIDC 및 환경변수 설정이 필요합니다.
세팅 상세는 [설정 가이드](spec/SETUP.md)를 확인하세요.

## 화면 및 데이터 흐름

- `/`: 랜딩
- `/login`: 카카오·구글 OAuth 로그인
- `/auth/callback`: OAuth PKCE 코드 교환 및 원래 작업 복귀
- `/create`: 닉네임 입력 후 로그인 계정 소유의 캘린더 생성
- `/c/:slug/created`: 생성 완료, 친구용·관리자용 링크
- `/c/:slug`: 친구가 방문하는 공개 캘린더
- `/c/:slug/write?date=YYYY-MM-DD`: 초콜릿 및 익명 메시지 작성
- `/c/:slug/sent?date=YYYY-MM-DD`: 작성 완료
- `/c/:slug/owner`: 캘린더 소유자 화면
- `/c/:slug/read?date=YYYY-MM-DD`: 해당 날짜 메시지 열람(소유자 전용)
- `/c/:slug/empty?date=YYYY-MM-DD`: 메시지가 없는 날짜(소유자 전용)
- `/c/:slug/locked?date=YYYY-MM-DD`: 미래 날짜 잠금(소유자 전용)
- `/c/:slug/tutorial`: 방문자 안내 오버레이

## 저장 및 접근 정책

- 누구나 공개 URL에서 캘린더 이름·서랍을 볼 수 있습니다.
- 캘린더 생성과 메시지 등록은 카카오·구글로 로그인해야 합니다.
- 메시지 작성자의 계정 ID는 저장하지 않습니다. 익명성이 유지됩니다.
- 주인만 날짜가 된 메시지를 읽고, 미래 메시지의 존재·개수는 알 수 없습니다.
- 서버(DB) RLS가 주인 검사와 날짜 잠금을 적용합니다.
- 종료 후에는 메시지를 추가할 수 없지만, 과거 메시지를 열 수 있습니다.
- 한 날짜에 여러 메시지를 남길 수 있습니다.

## 코드 구조

| 디렉터리 | 역할 |
| --- | --- |
| `src/ui` | 원본 시안에 맞춘 재사용 HTML/SVG 화면 및 애니메이션 |
| `src/styles` | 원본 스타일을 순서대로 분리한 CSS |
| `src/core` | 화면 상태, 라우팅, 이벤트, 인증 복귀 |
| `src/data` | Supabase OAuth, 캘린더·메시지 저장소 |
| `src/config` | 운영 날짜·최대 글자 수·초콜릿 목록 |
| `src/utils` | 한국 시간 날짜, 출력 이스케이프, 세션 저장 |
| `supabase/schema.sql` | 테이블, 제약조건, 인덱스, 접근 정책 |
| `tests` | 날짜·URL·HTML 출력·RLS 정의 정적 테스트 |

보안 및 QA 한계는 [보안·검증 가이드](spec/SECURITY.md)를 확인하세요.
원본 참고 시안은 사용자가 제공한 `advent-design(1).html`입니다.

**개발 규칙:** 파일당 최대 300줄, 2칸 들여쓰기, 작은 모듈과 명확한 책임 분리,
설정 상수화, 중복 코드 제거, 문서·테스트 동기화 원칙을 따릅니다.
`dev` 브랜치의 변경 사항은 `npm run lint`, `npm test`, `npm run build`로 확인합니다.
