#! /bin/bash
# Start the metaverseserver with persistant data in local dir

BASE=$(pwd)
cd "${BASE}"

DVERSION=latest

docker run -it --rm \
    --name=vircadia-web \
    -p 8080:8080 \
    -p 8081:8081 \
    -p 8082:8082 \
    --volume ${BASE}/log:/home/cadia/vircadia-web/log \
    vircadia-web:${DVERSION}
