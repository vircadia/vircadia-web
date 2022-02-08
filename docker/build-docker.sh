#! /bin/bash
if [ -z "$1" ]
then
    WEB_SDK_VER=2022.1.2
    echo "Vircadia Web SDK version is not supplied."
else
    WEB_SDK_VER=$1
fi
echo "Vircadia Web SDK version ${WEB_SDK_VER} is used."

docker build -t vircadia-web --build-arg WEB_SDK_VER=${WEB_SDK_VER} .
