#!/bin/bash

set -e

export APP_IMAGE=${1:-ssa-pdf}

echo "Image is $APP_IMAGE"

# ensure the environment is clear
docker stop jsx-pdf | xargs docker rm || true

export DOCKERHOST=$(ifconfig | grep -E "([0-9]{1,3}\.){3}[0-9]{1,3}" | grep -v 127.0.0.1 | awk '{ print $2 }' | cut -f2 -d: | head -n1)

docker run -td -p 3000:3000 --name jsx-pdf $APP_IMAGE

while ! nc -z $DOCKERHOST 3000; do
  >&2 echo "Waiting for app on port 3000"
  sleep 1 # wait for 1 second before check again
done

echo "Launched!"

yarn run test-integration

echo "Killing docker container"

docker stop jsx-pdf || true
