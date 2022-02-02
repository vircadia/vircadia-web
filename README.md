# Vircadia Web

Vircadia Web (*codename Aether*) is a web based client for accessing virtual worlds.

## Project Setup

### Prequisites

We currently use the following:

* Node `14.15.4`
* NPM `6.14.10`

### Install Quasar CLI

Install Quasar CLI using NPM [here](https://next.quasar.dev/quasar-cli/installation).

### Install the dependencies

```
npm i
```

## Run, Compile, and Test

### Start the app in development mode

Development mode benefits from features like hot-code reloading, error reporting, etc.

```
npm run dev
```

### Lint the files

```
npm run lint
```

And fix lint issues automatically with

```
npm run lint -- --fix
```

### Run tests

```
npm run test
```

### Build the app for production

```
npm run build
```

### Customize the configuration

See [Configuring quasar.conf.js](https://v2.quasar.dev/quasar-cli/quasar-conf-js).

## Docker

Docker image can be created by the exection of the docker build script.
In this process, vircadia web sdk (https://github.com/vircadia/vircadia-web-sdk) will be cloned and compiled. There is a product "vircadia-web-sdk-[VERSION].tgz" where VERION is the web-sdk version. Consult the vircadia-web-sdk doc for the exact version number. As of 2/8/2022, the default version is 2022.1.2. Make sure that the right version is passed when execute it.
The version argument is passed at the build-docker.sh "--build-arg WEB_SDK_VER".
Port 8080 is open for this. Its log can be found at the local "log" directory.

```
cd docker && ./build-docker.sh
```

Docker image "vercadia-web" will be created and this image can be used as a part of docker-compose. Please consult vircadia-domain-server-docker (https://github.com/vircadia/vircadia-domain-server-docker).
