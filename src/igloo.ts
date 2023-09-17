import type { IglooCamera } from "./modules/apps/igloo/Igloo.js";

declare global {
    interface Window {
        useIgloo: boolean;
        IglooCameraInstance: IglooCamera;
    }
}

export {};
