/*
* This file runs in a Node context (it's NOT transpiled by Babel), so use only
* the ES6 features that are supported by your Node version. https://node.green/
*/

// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-js

const path = require("path");
const { configure } = require("quasar/wrappers");
const packageJSON = require("./package.json");

module.exports = configure(function(ctx) {
    return {
        eslint: {
            // fix: true,
            // include = [],
            // exclude = [],
            // rawOptions = {},
            warnings: true,
            errors: true
        },

        // https://v2.quasar.dev/quasar-cli-vite/prefetch-feature
        // preFetch: true,

        // app boot file (/src/boot)
        // --> boot files are part of "main.js"
        // https://v2.quasar.dev/quasar-cli-vite/boot-files
        boot: ["global-components"],

        // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#css
        css: ["app.scss"],

        // https://github.com/quasarframework/quasar/tree/dev/extras
        extras: [
            // 'ionicons-v4',
            // 'mdi-v5',
            // 'fontawesome-v6',
            // 'eva-icons',
            // 'themify',
            // 'line-awesome',
            // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

            "fontawesome-v5",
            // 'roboto-font', // optional, you are not bound to it
            "material-icons" // optional, you are not bound to it
        ],

        // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#build
        build: {
            target: {
                browser: ["es2020", "edge88", "firefox78", "chrome87", "safari14"],
                node: "node16"
            },

            vueRouterMode: "hash", // available values: 'hash', 'history'
            // vueRouterBase,
            // vueDevtools,
            // vueOptionsAPI: false,

            // rebuildCache: true, // rebuilds Vite/linter/etc cache on startup

            // publicPath: '/',
            // analyze: true,
            // rawDefine: {}
            // ignorePublicFolder: true,
            // minify: false,
            // polyfillModulePreload: true,
            // distDir

            // extendViteConf (viteConf) {},
            // viteVuePluginOptions: {},

            // vitePlugins: [
            //   [ 'package-name', { ..options.. } ]
            // ]

            alias: {
                "@Base": path.resolve(__dirname, "./src"),
                "@Components": path.resolve(__dirname, "./src/components"),
                "@Modules": path.resolve(__dirname, "./src/modules"),
                "@Stores": path.resolve(__dirname, "./src/stores")
            },

            env: {
                // Default Connection Config
                VRCA_DEFAULT_METAVERSE_URL: process.env.VRCA_DEFAULT_METAVERSE_URL ?? "https://metaverse.vircadia.com/live",
                VRCA_DEFAULT_DOMAIN_PROTOCOL: process.env.VRCA_DEFAULT_DOMAIN_PROTOCOL ?? "wss:",
                VRCA_DEFAULT_DOMAIN_PORT: process.env.VRCA_DEFAULT_DOMAIN_PORT ?? "40102",
                VRCA_DEFAULT_DOMAIN_URL: process.env.VRCA_DEFAULT_DOMAIN_URL ?? "wss://antares.digisomni.com/0,0,0/0,0,0,1",
                // Theme
                VRCA_BRAND_NAME: process.env.VRCA_BRAND_NAME ?? packageJSON.productName,
                VRCA_PRODUCT_NAME: process.env.VRCA_PRODUCT_NAME ?? packageJSON.productName,
                VRCA_TAGLINE: process.env.VRCA_TAGLINE ?? packageJSON.description,
                VRCA_PRODUCT_DESCRIPTION: process.env.VRCA_PRODUCT_DESCRIPTION ?? packageJSON.description,
                VRCA_LOGO: process.env.VRCA_LOGO ?? "assets/vircadia-icon.svg",
                // NOTE: VRCA_BANNER should be an absolute URL for Open Graph support.
                VRCA_BANNER: process.env.VRCA_BANNER ?? "assets/og_banner.png",
                VRCA_BANNER_ALT: process.env.VRCA_BANNER_ALT ?? packageJSON.productName,
                VRCA_GLOBAL_SERVICE_TERM: process.env.VRCA_GLOBAL_SERVICE_TERM ?? "Metaverse",
                VRCA_VERSION_WATERMARK: process.env.VRCA_VERSION_WATERMARK ?? "Early Developer Alpha",
                // Theme > Colors
                VRCA_COLORS_PRIMARY: process.env.VRCA_COLORS_PRIMARY ?? "#0c71c3",
                VRCA_COLORS_SECONDARY: process.env.VRCA_COLORS_SECONDARY ?? "#8300e9",
                VRCA_COLORS_ACCENT: process.env.VRCA_COLORS_ACCENT ?? "#01bdff",
                // Theme > Styles
                VRCA_DEFAULT_MODE: process.env.VRCA_DEFAULT_MODE ?? "dark",
                VRCA_GLOBAL_STYLE: process.env.VRCA_GLOBAL_STYLE ?? "mica",
                VRCA_HEADER_STYLE: process.env.VRCA_HEADER_STYLE ?? "gradient-right",
                VRCA_WINDOW_STYLE: process.env.VRCA_WINDOW_STYLE ?? "gradient-right",
                // Links
                VRCA_HOSTED_URL: process.env.VRCA_HOSTED_URL ?? "https://app.vircadia.com",
                // First Time Wizard
                VRCA_WIZARD_TITLE: process.env.VRCA_WIZARD_TITLE ?? packageJSON.productName,
                VRCA_WIZARD_WELCOME_TEXT: process.env.VRCA_WIZARD_WELCOME_TEXT ?? "Welcome to",
                VRCA_WIZARD_TAGLINE: process.env.VRCA_WIZARD_TAGLINE ?? "Explore virtual worlds.",
                VRCA_WIZARD_BUTTON_TEXT: process.env.VRCA_WIZARD_BUTTON_TEXT ?? "Get Started"
            }
        },

        // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#devServer
        devServer: {
            https: false,
            open: true // opens browser window automatically
        },

        // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#framework
        framework: {
            config: {
                dark: "auto"
            },

            // iconSet: 'material-icons', // Quasar icon set
            // lang: 'en-US', // Quasar language pack

            // For special cases outside of where the auto-import strategy can have an impact
            // (like functional components as one of the examples),
            // you can manually specify Quasar components/directives to be available everywhere:
            //
            // components: [],
            // directives: [],

            // Quasar plugins
            plugins: ["Notify"]
        },

        // animations: 'all', // --- includes all animations
        // https://v2.quasar.dev/options/animations
        animations: [],

        // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#sourcefiles
        // sourceFiles: {
        //   rootComponent: 'src/App.vue',
        //   router: 'src/router/index',
        //   store: 'src/store/index',
        //   registerServiceWorker: 'src-pwa/register-service-worker',
        //   serviceWorker: 'src-pwa/custom-service-worker',
        //   pwaManifestFile: 'src-pwa/manifest.json',
        //   electronMain: 'src-electron/electron-main',
        //   electronPreload: 'src-electron/electron-preload'
        // },

        // https://v2.quasar.dev/quasar-cli-vite/developing-ssr/configuring-ssr
        ssr: {
            // ssrPwaHtmlFilename: 'offline.html', // do NOT use index.html as name!
            // will mess up SSR

            // extendSSRWebserverConf (esbuildConf) {},
            // extendPackageJson (json) {},

            pwa: false,

            // manualStoreHydration: true,
            // manualPostHydrationTrigger: true,

            prodPort: 3000, // The default port that the production server should use
            // (gets superseded if process.env.PORT is specified at runtime)

            maxAge: 1000 * 60 * 60 * 24 * 30,
            // Tell browser when a file from the server should expire from cache (in ms)

            middlewares: [
                ctx.prod ? "compression" : "",
                "render" // keep this as last one
            ]
        },

        // https://v2.quasar.dev/quasar-cli-vite/developing-pwa/configuring-pwa
        pwa: {
            workboxMode: "generateSW", // or 'injectManifest'
            injectPwaMetaTags: true,
            swFilename: "sw.js",
            manifestFilename: "manifest.json",
            useCredentialsForManifestTag: false,
            // useFilenameHashes: true,
            // extendGenerateSWOptions (cfg) {}
            // extendInjectManifestOptions (cfg) {},
            // extendManifestJson (json) {}
            // extendPWACustomSWConf (esbuildConf) {}

            manifest: {
                name: process.env.VRCA_PRODUCT_NAME ?? packageJSON.productName,
                short_name: process.env.VRCA_PRODUCT_NAME ?? packageJSON.name,
                description: process.env.VRCA_TAGLINE ?? packageJSON.description,
                display: "standalone",
                orientation: "portrait",
                background_color: "#ffffff",
                theme_color: "#027be3",
                icons: [
                    {
                        src: "icons/icon-128x128.png",
                        sizes: "128x128",
                        type: "image/png"
                    },
                    {
                        src: "icons/icon-192x192.png",
                        sizes: "192x192",
                        type: "image/png"
                    },
                    {
                        src: "icons/icon-256x256.png",
                        sizes: "256x256",
                        type: "image/png"
                    },
                    {
                        src: "icons/icon-384x384.png",
                        sizes: "384x384",
                        type: "image/png"
                    },
                    {
                        src: "icons/icon-512x512.png",
                        sizes: "512x512",
                        type: "image/png"
                    }
                ]
            }
        },

        // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-cordova-apps/configuring-cordova
        cordova: {
            // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
        },

        // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-capacitor-apps/configuring-capacitor
        capacitor: {
            hideSplashscreen: true
        },

        // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/configuring-electron
        electron: {
            // extendElectronMainConf (esbuildConf)
            // extendElectronPreloadConf (esbuildConf)

            inspectPort: 5858,

            bundler: "packager", // 'packager' or 'builder'

            packager: {
                // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options

                // OS X / Mac App Store
                // appBundleId: '',
                // appCategoryType: '',
                // osxSign: '',
                // protocol: 'myapp://path',

                // Windows only
                // win32metadata: { ... }
            },

            builder: {
                // https://www.electron.build/configuration/configuration

                appId: "vircadia-web"
            }
        },

        // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-browser-extensions/configuring-bex
        bex: {
            contentScripts: ["my-content-script"]

            // extendBexScriptsConf (esbuildConf) {}
            // extendBexManifestJson (json) {}
        }
    };
});
