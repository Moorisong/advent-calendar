#!/usr/bin/env bash
set -Eeuo pipefail

# 실제 서비스 페이지 배포 스크립트 (https://advent-calendar.harooo.co.kr)
# Mac에서 검증·빌드 후 내부망(in) / 외부망(out)을 자동 감지해 dist/ 만 동기화합니다.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

for tool in node npm ssh rsync; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    echo "[advent-deploy:PROD] 필수 도구가 설치되어 있지 않습니다: $tool" >&2
    exit 1
  fi
done

CONFIG="$ROOT/.env.deploy.local"
if [[ -f "$CONFIG" ]]; then
  # shellcheck disable=SC1090
  source "$CONFIG"
fi

DEPLOY_ENV="production"
DEPLOY_SSH_TARGET="${DEPLOY_SSH_TARGET:-auto}"
DEPLOY_REMOTE_DIR="${DEPLOY_PROD_REMOTE_DIR:-/home/ksh/srv/advent-calendar/dist}"
DEPLOY_SERVICE_URL="${DEPLOY_PROD_SERVICE_URL:-https://advent-calendar.harooo.co.kr/}"
DEPLOY_SSH_PORT="${DEPLOY_SSH_PORT:-}"

if [[ "$DEPLOY_SSH_TARGET" == "auto" || -z "$DEPLOY_SSH_TARGET" ]]; then
  echo "[advent-deploy:PROD] 네트워크 환경 감지 중 (내부망 in vs 외부망 out)..."
  if ssh -o BatchMode=yes -o ConnectTimeout=2 in "true" >/dev/null 2>&1; then
    DEPLOY_SSH_TARGET="in"
    echo "[advent-deploy:PROD] 내부망(집 안) 감지됨 -> SSH 타겟: in (192.168.0.6)"
  elif ssh -o BatchMode=yes -o ConnectTimeout=4 out "true" >/dev/null 2>&1; then
    DEPLOY_SSH_TARGET="out"
    echo "[advent-deploy:PROD] 외부망(집 밖) 감지됨 -> SSH 타겟: out (125.190.25.48:8193)"
  else
    echo "[advent-deploy:PROD] 내부망(in) 및 외부망(out) SSH 연결에 모두 실패했습니다." >&2
    exit 1
  fi
else
  echo "[advent-deploy:PROD] 지정된 SSH 타겟 사용: $DEPLOY_SSH_TARGET"
fi

if [[ ! "$DEPLOY_SSH_TARGET" =~ ^[A-Za-z0-9._@:-]+$ \
  || ! "$DEPLOY_REMOTE_DIR" =~ ^/home/ksh/srv/[A-Za-z0-9._/-]+$ ]]; then
  echo "[advent-deploy:PROD] 안전하지 않은 배포 경로 설정입니다: $DEPLOY_SSH_TARGET:$DEPLOY_REMOTE_DIR" >&2
  exit 1
fi

echo "[advent-deploy:PROD] 로컬 보안/라우팅 검증 및 빌드 실행 중 (mode: $DEPLOY_ENV)..."
node --test \
  tests/routes.test.mjs \
  tests/html.test.mjs \
  tests/page-policy.test.mjs \
  tests/sql-policies.test.mjs \
  tests/retention-banner.test.mjs \
  tests/timezones.test.mjs
npx vite build --mode "$DEPLOY_ENV"
test -s dist/index.html

if find dist -type f \( \
  -name '*.map' -o -name '.env*' -o -name '*.ts' -o -name '*.tsx' -o -name '*.sql' -o -name '*.sh' \
\) | grep -q .; then
  echo "[advent-deploy:PROD] dist/ 내부에 노출 금지 파일이 발견되어 배포를 중단합니다." >&2
  exit 1
fi

ssh_opts=("-o" "BatchMode=yes")
ssh_cmd="ssh"
if [[ -n "$DEPLOY_SSH_PORT" ]]; then
  ssh_opts+=("-p" "$DEPLOY_SSH_PORT")
  ssh_cmd="ssh -p $DEPLOY_SSH_PORT"
fi

echo "[advent-deploy:PROD] 원격 디렉터리 확인 중: $DEPLOY_SSH_TARGET:$DEPLOY_REMOTE_DIR"
ssh "${ssh_opts[@]}" -o ConnectTimeout=10 "$DEPLOY_SSH_TARGET" \
  "mkdir -p '$DEPLOY_REMOTE_DIR' && test -d '$DEPLOY_REMOTE_DIR' && test -w '$DEPLOY_REMOTE_DIR'"

echo "[advent-deploy:PROD] dist/ 정적 파일 동기화 중..."
rsync -avz --delete --delay-updates --partial-dir=.rsync-partial \
  -e "$ssh_cmd" "$ROOT/dist/" "$DEPLOY_SSH_TARGET:$DEPLOY_REMOTE_DIR/"

ssh "${ssh_opts[@]}" "$DEPLOY_SSH_TARGET" "test -s '$DEPLOY_REMOTE_DIR/index.html'"

echo "========================================================"
echo " [advent-deploy:PROD] 배포 완료!"
echo " - 접속 방식: $DEPLOY_SSH_TARGET"
echo " - 원격 경로: $DEPLOY_REMOTE_DIR"
echo " - 서비스 URL: $DEPLOY_SERVICE_URL"
echo "========================================================"
