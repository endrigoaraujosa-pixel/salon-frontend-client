#!/usr/bin/env bash
user=$1
url=$2

commit=$(git rev-parse --short HEAD)


docker build --build-arg VITE_API_URL=$url -t $user/salon-frontend:$commit .
docker tag $user/salon-frontend-client:$commit $user/salon-frontend-client:latest
docker push $user/salon-frontend-client:$commit
docker push $user/salon-frontend-client:latest