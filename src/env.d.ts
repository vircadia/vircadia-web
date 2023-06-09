declare namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: string;
        VUE_ROUTER_MODE: "hash" | "history" | "abstract" | undefined;
        VUE_ROUTER_BASE: string | undefined;
        VRCA_DEFAULT_METAVERSE_URL: string;
        VRCA_DEFAULT_DOMAIN_PROTOCOL: string;
        VRCA_DEFAULT_DOMAIN_PORT: string;
        VRCA_DEFAULT_DOMAIN_URL: string;
        VRCA_GLOBAL_SERVICE_TERM: string;
        // Theme -> Styles
        VRCA_DEFAULT_MODE: "light" | "dark";
        VRCA_GLOBAL_STYLE: "none" | "aero" | "mica";
        VRCA_HEADER_STYLE: "none" | "gradient-left" | "gradient-right";
        VRCA_WINDOW_STYLE: "none" | "gradient-top" | "gradient-right" | "gradient-bottom" | "gradient-left";
        VRCA_COLORS_PRIMARY: string;
        VRCA_COLORS_SECONDARY: string;
        VRCA_COLORS_ACCENT: string;
    }
}
