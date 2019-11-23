#!/usr/bin/env bash

set -euf -o pipefail

GIT=$(which git)
SERVICE=$(which service)
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
    echo "New version $(cat VERSION) installed"
fi

$SERVICE metar-map restart
