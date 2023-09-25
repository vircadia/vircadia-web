# Vircadia Web

## ⚠️ Early Developer Alpha ⚠️
### The Vircadia web client is in Early Developer Alpha! There will be unimplemented features and bugs.
***Please take a moment to check the list of issues and file an issue if one does not exist already.
If you are able, please try to implement a feature or fix a bug yourself! The metaverse appreciates your assistance. 🙏***

Vircadia Web (*codename Aether*) is an open source metaverse web client for accessing virtual worlds.

## Compatibility

This interface is tested and validated for the following browser platforms:
* Mobile, Tablet, Desktop
    * Chromium (Chrome, Brave, etc.)
    * Webkit (Safari)
    * Gecko (Firefox)
* XR on Android *(COMING SOON!)*
    * Quest 2/Quest Pro
    * Pico 4
    * Vive Focus 3

## Project Setup

### Prerequisites

We currently use the following:

* Node `16.18.1`
* NPM `8.19.2`

*(Use of Node versions other than stated is untested and may not support all features.)*

### Clone the Repo

First, clone the repository to your machine with Git. Then, open a terminal in that directory.

### Install the dependencies

```sh
npm i
```
or
```sh
yarn
```

If you want to use a local copy of the Vircadia Web SDK, from a directory beside the web app's:
```sh
npm run install-local-web-sdk
```

## Run, Compile, and Test

### Customization Options

The web client's settings such as branding, default servers, and more, can be customized directly from [environment variables](https://github.com/vircadia/vircadia-web/blob/master/quasar.conf.js#L131) which you must set at or prior to build/compile time.

See [Configuring quasar.conf.js](https://v2.quasar.dev/quasar-cli/quasar-conf-js) for a full set of customization options.

### Start the app in development mode

Development mode benefits from features like hot-code reloading, error reporting, etc.

```sh
npm run dev
```
or
```
yarn run dev
```

### Lint the files

```sh
npm run lint
```

And fix lint issues automatically with

```sh
npm run lint -- --fix
```

### Run tests

```sh
npm run test
```

### Build the app for production

```sh
npm run build
```

## To Update Contributors

```sh
npm run update-contributors
```
