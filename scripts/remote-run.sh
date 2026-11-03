#!/usr/bin/env bash
# Run commands for this repo on the steven-reid build server (key: stb.pem),
# never on the laptop. Syncs the checkout, then runs the commands read from
# stdin inside the Playwright CI image (Node 24 + browsers).
#   scripts/remote-run.sh <<'CMDS'
#   npm ci || exit 1
#   npm test || exit 1
#   CMDS
# REMOTE_KEY / REMOTE_HOST override the defaults. FETCH="path ..." copies files back.
set -euo pipefail
ROOT=$(cd "$(dirname "$0")/.." && pwd)
KEY=${REMOTE_KEY:-$ROOT/../stb.pem}
HOST=${REMOTE_HOST:-steven-reid@75.46.59.136}
DEST=ngo-impact-lens
SSH="ssh -i $KEY -o ConnectTimeout=15 -o ServerAliveInterval=15 -o ServerAliveCountMax=4"
cat > "$ROOT/.remote-cmds.sh"
trap 'rm -f "$ROOT/.remote-cmds.sh"' EXIT
rsync -az --delete -e "$SSH" --exclude node_modules --exclude .next --exclude test-results \
  --exclude playwright-report --exclude .git --exclude .env.local "$ROOT/" "$HOST:claude-work/$DEST/"
$SSH "$HOST" "timeout ${TIMEOUT:-1200} docker run --rm --init --ipc=host -e CI=1 \
  -v \$HOME/claude-work/$DEST:/work -v $DEST-node-modules:/work/node_modules \
  -v mhai-web-npm-cache:/root/.npm -w /work mhai-web-ci:pw1.64.1 bash .remote-cmds.sh"
for f in ${FETCH:-}; do mkdir -p "$ROOT/$(dirname "$f")"; scp -q -i "$KEY" "$HOST:claude-work/$DEST/$f" "$ROOT/$f"; done
