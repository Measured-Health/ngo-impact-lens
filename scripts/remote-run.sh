#!/usr/bin/env bash
# Run commands for this repo on a remote machine over SSH, inside a Docker
# image with Node 24 and Playwright browsers. Keeps heavy builds and browser
# tests off your own computer.
#
# Configure once in .remote.env (gitignored) or the environment:
#   REMOTE_HOST=user@host        SSH destination
#   REMOTE_KEY=/path/to/key.pem  SSH private key
#   REMOTE_IMAGE=...             optional; default: official Playwright image
#
#   scripts/remote-run.sh <<'CMDS'
#   npm ci || exit 1
#   npm test || exit 1
#   CMDS
# TIMEOUT (seconds, default 1200) caps the run. REMOTE_DEST picks another remote
# folder (default ngo-impact-lens), so two runs can go at once. FETCH="path ..." copies files back.
set -euo pipefail
ROOT=$(cd "$(dirname "$0")/.." && pwd)
# shellcheck disable=SC1091
[ -f "$ROOT/.remote.env" ] && . "$ROOT/.remote.env"
HOST=${REMOTE_HOST:?set REMOTE_HOST (user@host) in .remote.env}
KEY=${REMOTE_KEY:?set REMOTE_KEY (path to the SSH key) in .remote.env}
IMAGE=${REMOTE_IMAGE:-mcr.microsoft.com/playwright:v1.64.1-noble}
DEST=${REMOTE_DEST:-ngo-impact-lens}
SSH="ssh -i $KEY -o ConnectTimeout=15 -o ServerAliveInterval=15 -o ServerAliveCountMax=4"
cat > "$ROOT/.remote-cmds.sh"
trap 'rm -f "$ROOT/.remote-cmds.sh"' EXIT
rsync -az --delete -e "$SSH" --exclude node_modules --exclude .next --exclude test-results \
  --exclude playwright-report --exclude .git --exclude .env.local --exclude .remote.env --exclude demo --exclude quality-out \
  "$ROOT/" "$HOST:claude-work/$DEST/"
$SSH "$HOST" "timeout ${TIMEOUT:-1200} docker run --rm --init --ipc=host -e CI=1 \
  -v \$HOME/claude-work/$DEST:/work -v $DEST-node-modules:/work/node_modules \
  -v $DEST-npm-cache:/root/.npm -w /work $IMAGE bash .remote-cmds.sh"
for f in ${FETCH:-}; do mkdir -p "$ROOT/$(dirname "$f")"; scp -q -i "$KEY" "$HOST:claude-work/$DEST/$f" "$ROOT/$f"; done
