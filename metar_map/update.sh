#!/usr/bin/env bash

set -euf -o pipefail

GIT=$(which git)
$GIT fetch -q

UPSTREAM=${1:-'@{u}'}
LOCAL=$($GIT rev-parse @)
REMOTE=$($GIT rev-parse "$UPSTREAM")
BASE=$($GIT merge-base @ "$UPSTREAM")

if [ $LOCAL = $REMOTE ]; then
    echo "Up-to-date"
elif [ $LOCAL = $BASE ]; then
    echo "Update available"
    $GIT pull
fi
