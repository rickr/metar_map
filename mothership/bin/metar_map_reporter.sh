#!/usr/bin/env bash
set -euxo pipefail

set +u
if [[ "$METAR_MAP_ENV" == "develop" ]]; then
  REPORTER_URL="http://localhost:4567"
  VERSION=$(cat $HOME/code/metar_map/VERSION)
else
  REPORTER_URL="http://metar-map.rudelinux.org"
  VERSION=$(cat /root/metar_map/VERSION)
fi
set -u

CURL=$(which curl)
CONTENT_TYPE='-H "Content-Type: application/json"'
POST="-X POST"

MY_IP=$(hostname -I)
MY_ID=$(ip add | grep -B 1 ${MY_IP} | grep link | awk ' {  print $2  } ')
DATA="-d '{\"id\": \"${MY_ID}\", \"version\": \"${VERSION}\", \"internal_ip\": \"${MY_IP}\"}'"

eval "${CURL} ${DATA} ${CONTENT_TYPE} ${POST} ${REPORTER_URL}"
