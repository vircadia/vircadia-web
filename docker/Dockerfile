FROM ubuntu:20.04 as web-base

RUN apt update && apt install -y git curl
RUN curl -sL https://deb.nodesource.com/setup_14.x -o nodesource_setup.sh && \
    bash ./nodesource_setup.sh && \
    apt install nodejs && \
    rm ./nodesource_setup.sh

FROM web-base as web-sdk-builder
RUN apt update
# checkout repo
RUN mkdir -p /usr/local/src && \
    cd /usr/local/src && \
    git clone --depth 1 --branch master https://github.com/vircadia/vircadia-web-sdk.git

RUN cd /usr/local/src/vircadia-web-sdk && \
    npm install && npm run build && npm pack

FROM web-base
# RUN apt update
RUN npm install -g @vue/cli && npm install -g @quasar/cli

# Default is 2022.1.2. Make sure this version alligns with web-sdk version.
ARG WEB_SDK_VER=2022.1.2

# default is 'vircadia'
ARG REPO=vircadia
# default is 'master'
ARG BRANCH=master

# checkout repo
RUN mkdir -p /usr/local/src && \
    cd /usr/local/src && \
    git clone --depth 1 --branch ${BRANCH} https://github.com/${REPO}/vircadia-web.git

COPY --from=web-sdk-builder /usr/local/src/vircadia-web-sdk/vircadia-web-sdk-${WEB_SDK_VER}.tgz /usr/local/src/
RUN cd /usr/local/src && \
    tar zxvf vircadia-web-sdk-${WEB_SDK_VER}.tgz && npm install -g ./package

RUN cd /usr/local/src/vircadia-web && npm i && npm run build

ENV USER=cadia
ENV VIRCADIAWEB=vircadia-web

# Add a user for the server to run under
RUN adduser --disabled-password --gecos 'vircadia user' ${USER}

RUN apt update && apt install -y sudo vim
RUN usermod -aG sudo ${USER} && \
    echo '%sudo ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers && \
    cp /root/.bashrc /home/${USER}/ && \
    chown -R --from=root ${USER}:${USER} /home/${USER} && \
    touch $HOME/.sudo_as_admin_successful
ENV PATH /home/developer/.local/bin:$PATH

WORKDIR /home/${USER}
USER ${USER}:${USER}
RUN mkdir -p /home/${USER}/${VIRCADIAWEB}/log
COPY --chown=${USER}:${USER} ./files/run-vircadia-web.sh /home/${USER}/

EXPOSE 8080
ENTRYPOINT [ "/home/cadia/run-vircadia-web.sh" ]
