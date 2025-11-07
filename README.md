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

#### Configure

First, be sure to set in the `.env` file:

* `VRCA_DEFAULT_METAVERSE_URL`
* `VRCA_DEFAULT_DOMAIN_PROTOCOL`
* `VRCA_DEFAULT_DOMAIN_PORT`
* `VRCA_DEFAULT_DOMAIN_URL` 

Also consider for Auzre Entra ID support:

* `VRCA_AZURE_TENANT_ID`
* `VRCA_AZURE_CLIENT_ID`
* `VRCA_AZURE_REDIRECT_URI`
* `VRCA_AZURE_SCOPES` (or you can keep the default value `["openid","profile","email"]`)

You should also check `quasar.config.cjs` for other customization options.

#### Build the app

```sh
bun run build
# Built files at dist/spa
```

#### Deploy with Caddy (ZeroSSL)

This repository includes a `caddy/Caddyfile` preconfigured to use ZeroSSL for automatic certificates and to serve the built SPA from `dist/spa`.

Run Caddy directly
```sh
caddy run --config caddy/Caddyfile
```
or if you have Caddy installed as a service:

```sh
caddy reload --config caddy/Caddyfile
```

Notes:
- The configured ACME CA is ZeroSSL only.
- The Caddyfile provides SPA routing via `try_files` to `index.html` and serves static assets from `dist/spa`.

*Note: You will want to use a systemd service or similar to run Caddy persistently.*

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

## Admin Account

### Creating an Admin Account

Your metaverse requires an admin account to manage domains. Create this account using the default admin username `vircadia` and set a secure password.

### Setting Up Domain Access

1. **Create Domain Access Tokens**:
   - Log in with your admin account (`vircadia`)
   - Navigate to Settings (cog icon) → "Domains" → "Create Domain"
   - Generate and copy the access token

2. **Connect to Your Domain**:
   - Open your Domain server's admin panel at `:40100`
   - Enter your metaverse URL (e.g., `https://ua92-metaverse.vircadia.com/live`) found under `:40100/settings/#metaverse_group`
   - Paste the access token you created

3. **Register Your Domain**:
   - In the domain server panel, select "Create new domain ID" or "Choose from my domains" if you've already created one
   - Enter a label for your server
   - Click "Create" to establish the connection

4. **Configure Permissions**:
   - Set connection permissions in your domain settings
   - Options include:
     - Allow "Logged In" users to connect
     - Allow "Anonymous" users to connect
     - Restrict access to specific accounts (e.g., only the `vircadia` admin account)

:::warning

When changing a Domain server's hosted URL for SSL, you can only use one URL at a time (remove all others), and you must change the certificate name e.g. `vircadia-cert.*` -> `vircadia-cert-1.*`.

:::