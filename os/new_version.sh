#!/usr/bin/env bash

#
# Creates a new version of the metar map software
#
# Checkout the master branch
# Merge in develop
# Bump version
# Build client
# Add tag

function status(){
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

#$GIT checkout master
CURRENT_VERSION=$(cat VERSION)
NEW_VERSION=$(echo $CURRENT_VERSION + 1 | bc)
echo "Creating new version ${NEW_VERSION}"
echo $NEW_VERSION > VERSION
#$GIT merge --no-ff -m "Merge branch 'develop'" develop

# Build new client
#cd client && $NPM run build && cd $BASE_DIR

$GIT add -A
$GIT commit -a -m "Release ${VERSION}"
$GIT push

status "Updating development branch '${DEV_BRANCH}'"
#$GIT checkout $DEV_BRANCH
#$GIT merge master
#$GIT push

status "Returning to ${ORIGINAL_BRANCH}"
#$GIT checkout ${ORIGINAL_BRANCH}
