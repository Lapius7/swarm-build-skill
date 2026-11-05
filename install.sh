#!/usr/bin/env bash
# swarm-build スキルを ~/.claude/skills/swarm-build に入れる。再実行で更新する。
# 使い方: gh api repos/Lapius7/swarm-build-skill/contents/install.sh -H 'Accept: application/vnd.github.raw' | bash
set -euo pipefail
REPO="Lapius7/swarm-build-skill"
DEST="${SKILLS_DIR:-$HOME/.claude/skills}/swarm-build"

if [ -d "$DEST/.git" ]; then
  git -C "$DEST" pull --ff-only
elif [ -e "$DEST" ]; then
  echo "既に $DEST があります（git 管理でないか symlink）。退避してから再実行してください。" >&2
  exit 1
else
  mkdir -p "$(dirname "$DEST")"
  if command -v gh >/dev/null 2>&1; then
    gh repo clone "$REPO" "$DEST"
  else
    git clone "https://github.com/$REPO.git" "$DEST"
  fi
fi
echo "入れました: $DEST"
