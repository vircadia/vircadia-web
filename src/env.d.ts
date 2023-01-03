declare namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: string;
        VUE_ROUTER_MODE: "hash" | "history" | "abstract" | undefined;
        VUE_ROUTER_BASE: string | undefined;
        // Theme -> Styles
        VRCA_DEFAULT_MODE: "light" | "dark";
        VRCA_GLOBAL_STYLE: "none" | "aero" | "mica";
        VRCA_HEADER_STYLE: "none" | "gradient-left" | "gradient-right";
        VRCA_WINDOW_STYLE: "none" | "gradient-top" | "gradient-right" | "gradient-bottom" | "gradient-left";
    }
}
