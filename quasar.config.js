/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-js

const path = require("path");
const { configure } = require("quasar/wrappers");
const packageJSON = require("./package.json");
const desktopMode = process.env.VRCA_DESKTOP_MODE;

module.exports = configure(function (ctx) {
    return {
        eslint: {
            // fix: true,
            // include = [],
            // exclude = [],
            // rawOptions = {},
            warnings: true,
            errors: false,
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
            "material-icons", // optional, you are not bound to it
        ],

        // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#build
        build: {
            target: {
                browser: [
                    "es2020",
                    "edge88",
                    "firefox78",
                    "chrome87",
                    "safari14",
                ],
                node: "node18",
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

            extendViteConf(viteConf) {
                if (process.env.VRCA_HOSTED_URL)
                    viteConf.base = process.env.VRCA_HOSTED_URL;
            },
            // viteVuePluginOptions: {},

            // vitePlugins: [
            //   [ 'package-name', { ..options.. } ]
            // ]

            alias: {
                "@Base": path.resolve(__dirname, "./src"),
                "@Components": path.resolve(__dirname, "./src/components"),
                "@Modules": path.resolve(__dirname, "./src/modules"),
                "@Public": path.resolve(__dirname, "./public"),
                "@Stores": path.resolve(__dirname, "./src/stores"),
                "@World": path.resolve(__dirname, "./src/vircadia-world/src"),
            },

            env: {
                // Default Connection Config
                VRCA_DEFAULT_METAVERSE_URL:
                    process.env.VRCA_DEFAULT_METAVERSE_URL ??
                    "https://metaverse.vircadia.com/live",
                VRCA_DEFAULT_ICE_SERVERS:
                    process.env.VRCA_DEFAULT_ICE_SERVERS ??
                    '[ { "urls": ["stun:stun1.l.google.com:19302", "stun:stun4.l.google.com:19302"] } ]',
                VRCA_DEFAULT_DOMAIN_PROTOCOL:
                    process.env.VRCA_DEFAULT_DOMAIN_PROTOCOL ?? "wss:",
                VRCA_DEFAULT_DOMAIN_PORT:
                    process.env.VRCA_DEFAULT_DOMAIN_PORT ?? "40102",
                VRCA_DEFAULT_DOMAIN_URL:
                    process.env.VRCA_DEFAULT_DOMAIN_URL ??
                    "wss://antares.digisomni.com/0,0,0/0,0,0,1",
                // Theme
                VRCA_BRAND_NAME:
                    process.env.VRCA_BRAND_NAME ?? packageJSON.productName,
                VRCA_PRODUCT_NAME:
                    process.env.VRCA_PRODUCT_NAME ?? packageJSON.productName,
                VRCA_TAGLINE:
                    process.env.VRCA_TAGLINE ?? packageJSON.description,
                VRCA_PRODUCT_DESCRIPTION:
                    process.env.VRCA_PRODUCT_DESCRIPTION ??
                    packageJSON.description,
                VRCA_PRODUCT_KEYWORDS:
                    process.env.VRCA_PRODUCT_KEYWORDS ??
                    "Vircadia, VR, virtual, reality, metaverse, game, 3D, open-world, open-source, open, future",
                VRCA_LOGO:
                    process.env.VRCA_LOGO ??
                    "assets/images/branding/vircadia-icon.svg",
                VRCA_INTRO:
                    process.env.VRCA_INTRO ??
                    "assets/video/Digisomni_Intro_9-13-2022.webm",
                VRCA_HIDE_IN_WORLD_LOCATION:
                    process.env.VRCA_HIDE_IN_WORLD_LOCATION ?? "false",
                // NOTE: VRCA_BANNER should be an absolute URL for Open Graph support.
                VRCA_BANNER:
                    process.env.VRCA_BANNER ??
                    "assets/images/branding/og_banner.png",
                VRCA_BANNER_ALT:
                    process.env.VRCA_BANNER_ALT ?? packageJSON.productName,
                VRCA_GLOBAL_SERVICE_TERM:
                    process.env.VRCA_GLOBAL_SERVICE_TERM ?? "Metaverse",
                VRCA_VERSION_WATERMARK:
                    process.env.VRCA_VERSION_WATERMARK ??
                    "Early Developer Alpha",
                VRCA_SHOW_LOADING_SCREEN_HINTS:
                    process.env.VRCA_SHOW_LOADING_SCREEN_HINTS ?? "true",
                // Theme > Colors
                VRCA_COLORS_PRIMARY:
                    process.env.VRCA_COLORS_PRIMARY ?? "#0c71c3",
                VRCA_COLORS_SECONDARY:
                    process.env.VRCA_COLORS_SECONDARY ?? "#8300e9",
                VRCA_COLORS_ACCENT: process.env.VRCA_COLORS_ACCENT ?? "#01bdff",
                VRCA_COLORS_DARK: process.env.VRCA_COLORS_DARK ?? "#282828",
                VRCA_COLORS_LIGHT: process.env.VRCA_COLORS_LIGHT ?? "#e8e8e8",
                // Theme > Styles
                VRCA_DEFAULT_MODE: process.env.VRCA_DEFAULT_MODE ?? "dark",
                VRCA_GLOBAL_STYLE: process.env.VRCA_GLOBAL_STYLE ?? "mica",
                VRCA_HEADER_STYLE:
                    process.env.VRCA_HEADER_STYLE ?? "gradient-right",
                VRCA_WINDOW_STYLE:
                    process.env.VRCA_WINDOW_STYLE ?? "gradient-right",
                // Links
                VRCA_HOSTED_URL:
                    process.env.VRCA_HOSTED_URL ?? "https://app.vircadia.com",
                VRCA_USER_DOCS_URL:
                    process.env.VRCA_USER_DOCS_URL ??
                    "https://docs.vircadia.com/",
                VRCA_COMMUNITY_CHAT_URL:
                    process.env.VRCA_COMMUNITY_CHAT_URL ??
                    "https://discord.com/invite/Pvx2vke",
                // First Time Wizard
                VRCA_WIZARD_TITLE:
                    process.env.VRCA_WIZARD_TITLE ?? packageJSON.productName,
                VRCA_WIZARD_WELCOME_TEXT:
                    process.env.VRCA_WIZARD_WELCOME_TEXT ?? "Welcome to",
                VRCA_WIZARD_TAGLINE:
                    process.env.VRCA_WIZARD_TAGLINE ??
                    "Explore virtual worlds.",
                VRCA_WIZARD_BUTTON_TEXT:
                    process.env.VRCA_WIZARD_BUTTON_TEXT ?? "Get Started",
                // Desktop App
                VRCA_DESKTOP_MODE: process.env.VRCA_DESKTOP_MODE,
                // Profile
                // Profile
                VRCA_DEFAULT_AVATAR_DISPLAY_NAME:
                    process.env.VRCA_DEFAULT_AVATAR_DISPLAY_NAME ?? "anonymous",
                VRCA_DEFAULT_AVATARS:
                    process.env.VRCA_DEFAULT_AVATARS ??
                    JSON.stringify({
                        HTP45FSQ: {
                            name: "Sara",
                            image: "/assets/models/avatars/sara-cropped-small.webp",
                            file: "/assets/models/avatars/sara.glb",
                            scale: 1,
                            starred: false,
                        },
                        KLM23NOP: {
                            name: "Mark",
                            image: "/assets/models/avatars/Mark-small.webp",
                            file: "/assets/models/avatars/Mark.glb",
                            scale: 1,
                            starred: false,
                        },
                        QRS78TUV: {
                            name: "Megan",
                            image: "/assets/models/avatars/Megan-small.webp",
                            file: "/assets/models/avatars/Megan.glb",
                            scale: 1,
                            starred: false,
                        },
                        WXY12ZAB: {
                            name: "Jack",
                            image: "/assets/models/avatars/Jack-small.webp",
                            file: "/assets/models/avatars/Jack.glb",
                            scale: 1,
                            starred: false,
                        },
                        CDE56FGH: {
                            name: "Martha",
                            image: "/assets/models/avatars/Martha-small.webp",
                            file: "/assets/models/avatars/Martha.glb",
                            scale: 1,
                            starred: false,
                        },
                        IJK90LMN: {
                            name: "Miles",
                            image: "/assets/models/avatars/Miles-small.webp",
                            file: "/assets/models/avatars/Miles.glb",
                            scale: 1,
                            starred: false,
                        },
                        OPQ34RST: {
                            name: "Taylor",
                            image: "/assets/models/avatars/Taylor-small.webp",
                            file: "/assets/models/avatars/Taylor.glb",
                            scale: 1,
                            starred: false,
                        },
                        UVW78XYZ: {
                            name: "Tiffany",
                            image: "/assets/models/avatars/Tiffany-small.webp",
                            file: "/assets/models/avatars/Tiffany.glb",
                            scale: 1,
                            starred: false,
                        },
                        ABC12DEF: {
                            name: "Victor",
                            image: "/assets/models/avatars/Victor-small.webp",
                            file: "/assets/models/avatars/Victor.glb",
                            scale: 1,
                            starred: false,
                        },
                        GHI56JKL: {
                            name: "Audrey",
                            image: "/assets/models/avatars/Audrey-small.webp",
                            file: "/assets/models/avatars/Audrey.glb",
                            scale: 1,
                            starred: false,
                        },
                        MNO90PQR: {
                            name: "Kristine",
                            image: "/assets/models/avatars/Kristine-small.webp",
                            file: "/assets/models/avatars/Kristine.glb",
                            scale: 1,
                            starred: false,
                        },
                        STU34VWX: {
                            name: "William",
                            image: "/assets/models/avatars/William-small.webp",
                            file: "/assets/models/avatars/William.glb",
                            scale: 1,
                            starred: false,
                        },
                        YZA78BCD: {
                            name: "Erica",
                            image: "/assets/models/avatars/Erica-small.webp",
                            file: "/assets/models/avatars/Erica.glb",
                            scale: 1,
                            starred: false,
                        },
                        EFG12HIJ: {
                            name: "Samantha",
                            image: "/assets/models/avatars/Samantha-small.webp",
                            file: "/assets/models/avatars/Samantha.glb",
                            scale: 1,
                            starred: false,
                        },
                        KLM56NOP: {
                            name: "Roman",
                            image: "/assets/models/avatars/Roman-small.webp",
                            file: "/assets/models/avatars/Roman.glb",
                            scale: 1,
                            starred: false,
                        },
                        QRS90TUV: {
                            name: "Cathy",
                            image: "/assets/models/avatars/Cathy-small.webp",
                            file: "/assets/models/avatars/Cathy.glb",
                            scale: 1,
                            starred: false,
                        },
                        WXY34ZAB: {
                            name: "Lucas",
                            image: "/assets/models/avatars/Lucas-small.webp",
                            file: "/assets/models/avatars/Lucas.glb",
                            scale: 1,
                            starred: false,
                        },
                        CDE78FGH: {
                            name: "Michaella",
                            image: "/assets/models/avatars/Michaella-small.webp",
                            file: "/assets/models/avatars/Michaella.glb",
                            scale: 1,
                            starred: false,
                        },
                        IJK12LMN: {
                            name: "David",
                            image: "/assets/models/avatars/David-small.webp",
                            file: "/assets/models/avatars/David.glb",
                            scale: 1,
                            starred: false,
                        },
                        OPQ56RST: {
                            name: "Rochella",
                            image: "/assets/models/avatars/Rochella-small.webp",
                            file: "/assets/models/avatars/Rochella.glb",
                            scale: 1,
                            starred: false,
                        },
                        UVW90XYZ: {
                            name: "Susan",
                            image: "/assets/models/avatars/Susan-small.webp",
                            file: "/assets/models/avatars/Susan.glb",
                            scale: 1,
                            starred: false,
                        },
                        ABC34DEF: {
                            name: "Diego",
                            image: "/assets/models/avatars/Diego-small.webp",
                            file: "/assets/models/avatars/Diego.glb",
                            scale: 1,
                            starred: false,
                        },
                        GHI78JKL: {
                            name: "Jameson",
                            image: "/assets/models/avatars/Jameson-small.webp",
                            file: "/assets/models/avatars/Jameson.glb",
                            scale: 1,
                            starred: false,
                        },
                        MNO12PQR: {
                            name: "Kevin",
                            image: "/assets/models/avatars/Kevin-small.webp",
                            file: "/assets/models/avatars/Kevin.glb",
                            scale: 1,
                            starred: false,
                        },
                        STU56VWX: {
                            name: "Lila",
                            image: "/assets/models/avatars/Lila-small.webp",
                            file: "/assets/models/avatars/Lila.glb",
                            scale: 1,
                            starred: false,
                        },
                        YZA90BCD: {
                            name: "Vikki",
                            image: "/assets/models/avatars/Vikki-small.webp",
                            file: "/assets/models/avatars/Vikki.glb",
                            scale: 1,
                            starred: false,
                        },
                        EFG34HIJ: {
                            name: "Jonas",
                            image: "/assets/models/avatars/Jonas-small.webp",
                            file: "/assets/models/avatars/Jonas.glb",
                            scale: 1,
                            starred: false,
                        },
                        KLM78NOP: {
                            name: "Kelly",
                            image: "/assets/models/avatars/Kelly-small.webp",
                            file: "/assets/models/avatars/Kelly.glb",
                            scale: 1,
                            starred: false,
                        },
                    }),
                VRCA_FALLBACK_AVATAR:
                    process.env.VRCA_FALLBACK_AVATAR ??
                    JSON.stringify({
                        name: "Maria",
                        image: "/assets/models/avatars/Maria-small.webp",
                        file: "/assets/models/avatars/Maria.glb",
                        scale: 1,
                        starred: true,
                    }),
            },
        },

        // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#devServer
        devServer: {
            https: false,
            port: 9000,
            strictPort: Boolean(desktopMode), // desktop mode must use a strict port
            open: !Boolean(desktopMode), // opens browser window automatically
        },

        // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#framework
        framework: {
            config: {
                dark: "auto",
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
            plugins: ["Notify"],
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
                "render", // keep this as last one
            ],
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
                description:
                    process.env.VRCA_TAGLINE ?? packageJSON.description,
                display: "standalone",
                orientation: "portrait",
                background_color: "#ffffff",
                theme_color: "#027be3",
                icons: [
                    {
                        src: "icons/icon-128x128.png",
                        sizes: "128x128",
                        type: "image/png",
                    },
                    {
                        src: "icons/icon-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                    },
                    {
                        src: "icons/icon-256x256.png",
                        sizes: "256x256",
                        type: "image/png",
                    },
                    {
                        src: "icons/icon-384x384.png",
                        sizes: "384x384",
                        type: "image/png",
                    },
                    {
                        src: "icons/icon-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                    },
                ],
            },
        },

        // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-cordova-apps/configuring-cordova
        cordova: {
            // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
        },

        // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-capacitor-apps/configuring-capacitor
        capacitor: {
            hideSplashscreen: true,
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

                appId: "vircadia-web",
            },
        },

        // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-browser-extensions/configuring-bex
        bex: {
            contentScripts: ["my-content-script"],

            // extendBexScriptsConf (esbuildConf) {}
            // extendBexManifestJson (json) {}
        },
    };
});
