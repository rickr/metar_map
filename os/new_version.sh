#!/usr/bin/env bash
set -euxo pipefail

# Creates a new version of the metar map software

function status_message(){
  echo " *** $*"
}

GIT=$(which git)
NPM=$(which npm)

DEV_BRANCH='develop'

ORIGINAL_BRANCH=$(git rev-parse --abbrev-ref HEAD)

ME=$(realpath $0)
MY_DIR=$(dirname $ME)
BASE_DIR="${MY_DIR}/.."

cd $BASE_DIR

$GIT checkout master
CURRENT_VERSION=$(cat VERSION)
NEW_VERSION=$(echo $CURRENT_VERSION + 1 | bc)
status_message "Creating new version ${NEW_VERSION}"
echo $NEW_VERSION > VERSION

status_message 'Merging develop into master'
$GIT merge --no-ff -m "Merge branch 'develop'" develop

# Build new client
status_message 'Building client'
cd client && $NPM run build && cd $BASE_DIR

status_message 'Pushing to github'
$GIT add -A
$GIT commit -a -m "Release ${NEW_VERSION}"
$GIT tag "v${NEW_VERSION}"
$GIT push origin --tags
$GIT push

status_message "Updating development branch '${DEV_BRANCH}'"
$GIT checkout $DEV_BRANCH
$GIT merge master
$GIT push

status_message "Returning to ${ORIGINAL_BRANCH}"
$GIT checkout ${ORIGINAL_BRANCH}
