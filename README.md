# ![Vircadia Web](https://raw.githubusercontent.com/vircadia/vircadia-assets/master/images/branding/vircadia_web_text_logo.svg)

## ⚠️ Deprecated - See [Vircadia World](https://github.com/vircadia/vircadia-world) ⚠️
### The Vircadia web client is deprecated in favor of the new [Vircadia World](https://github.com/vircadia/vircadia-world) project!

Vircadia Web (*codename Aether*) is an open source metaverse web client for accessing virtual worlds.

## Project Setup

### Prerequisites

You need to have the following prerequisites installed:

* Bun.sh `1.2.23` 
* Node version `20`

*(Use of versions other than stated is untested and may not work correctly.)*

Install Caddy Server: [https://caddyserver.com/docs/install](https://caddyserver.com/docs/install)

### Clone the Repo

First, clone the repository to your machine with Git. Then, open a terminal in that directory.

Vircadia Web relies on the Vircadia Assets submodule, so you must pull recursively.

```sh
git clone --recursive https://github.com/vircadia/vircadia-web.git
```

If you forget to pull recursively, you can initialize the submodule later with:
```sh
git submodule update --init --recursive
```

### Install the dependencies

```sh
bun i
```

If you want to use a local copy of the Vircadia Web SDK, from a directory beside the web app's:
```sh
bun run install-local-web-sdk
```

## Run, Compile, and Test

### Customization Options

The web client's settings such as branding, default servers, and more, can be customized directly from [environment variables](https://github.com/vircadia/vircadia-web/blob/master/quasar.conf.js#L131) which you must set at or prior to build/compile time.

See [Configuring quasar.conf.js](https://v2.quasar.dev/quasar-cli/quasar-conf-js) for a full set of customization options.

### Start the app in development mode

Development mode benefits from features like hot-code reloading, error reporting, etc.

```
bun run dev
```

### Lint the files

```sh
bun run lint
```

And fix lint issues automatically with

```sh
bun run lint -- --fix
```

### Run tests

```sh
bun run test
```

### Deploy the app for production

```sh
bun run build
# Built files at dist/spa
```

This repository includes a `caddy/Caddyfile` preconfigured to use ZeroSSL for automatic certificates and to serve the built SPA from `dist/spa`.

#### Caddy (ZeroSSL) Deployment

Run Caddy
```sh
caddy run --config caddy/Caddyfile
```

Notes:
- The configured ACME CA is ZeroSSL only.
- The Caddyfile provides SPA routing via `try_files` to `index.html` and serves static assets from `dist/spa`.

## Desktop

The web client can also be compiled to a standalone desktop app. When doing so, the `VRCA_DESKTOP_MODE` environment variable must be set to either `dev` or `build`.

After installing the base Node dependencies with `npm i`, you will also need to install [Tauri's Rust dependencies](https://tauri.app/v1/guides/getting-started/prerequisites).

To run the desktop wrapper in development mode:
```sh
bun run dev-desktop
```

To build the desktop executable:
```sh
bun run build-desktop
```

## To Update Contributors

```sh
bun run update-contributors
```

## Local Assets

To enable faster loading, you may put local models into the `public/local-assets` folder, then reference them in your entity tree like so `/local-assets/yourModel.glb`. The asset should now be available to you in-world.