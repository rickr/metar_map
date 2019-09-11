#!/usr/bin/env bash

function version_gt() { test "$(printf '%s\n' "$@" | sort -V | head -n 1)" != "$1"; }

UPDATE_URL=https://github.com/rickr/metar_map.git

LOCAL_VERSION=$(cat VERSION)
REMOTE_VERSION=$(git ls-remote --tags | grep tags | awk -F '/'  '{ print $NF }')

echo $LOCAL_VERSION
echo $REMOTE_VERSION

if version_gt $REMOTE_VERSION $LOCAL_VERSION; then
  echo "Updating from $LOCAL_VERSION to $REMOTE_VERSION"
  # something like git pull && git merge
fi

