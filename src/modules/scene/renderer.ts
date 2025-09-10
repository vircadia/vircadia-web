//
/** biome-ignore-all lint/complexity/noStaticOnlyClass: static-only utility class by design */
/** biome-ignore-all lint/complexity/noThisInStatic: intentional use of this in static context */
//  renderer.ts
//
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { Engine, type Nullable } from "@babylonjs/core";
import { applicationStore } from "@Stores/index";
import { Config } from "@Base/config";
import { WebGPUEngine } from "@babylonjs/core/Engines/webgpuEngine";
import { VScene } from "@Modules/scene/vscene";
import { CustomLoadingScreen } from "@Modules/scene/LoadingScreen";
import Log, { findErrorMessage } from "@Modules/debugging/log";

/**
 * Static methods controlling the rendering of the scene(s).
 */
export class Renderer {
    private static _engine = <Engine | WebGPUEngine><unknown>undefined;
    private static _renderingScenes = <VScene[]><unknown>undefined;
    private static _webgpuSupported = false;
    private static _intervalId = <Nullable<NodeJS.Timeout>>null;

    /**
     * Quick feature-detection for WebGL contexts.
     */
    private static _isWebGLSupported(): boolean {
        try {
            const testCanvas = document.createElement("canvas");
            const gl2 = testCanvas.getContext("webgl2");
            if (gl2) return true;
            const gl1 = testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl");
            return !!gl1;
        } catch {
            return false;
        }
    }

    /**
     * Initialize the rendering engine.
     * @param canvas The canvas element to render the scene onto.
     * @param loadingScreen The element to show when the scene is loading.
     */
    public static async initialize(canvas: HTMLCanvasElement, loadingScreen: HTMLElement): Promise<void> {
        try {
            const wantWebGPU = (process.env.VRCA_USE_WEBGPU === "true");
            this._webgpuSupported = wantWebGPU ? await WebGPUEngine.IsSupportedAsync : false;

            if (this._webgpuSupported) {
                try {
                    this._engine = new WebGPUEngine(canvas, {
                        deviceDescriptor: {
                            requiredFeatures: [
                                "depth-clip-control",
                                "depth32float-stencil8",
                                "texture-compression-bc",
                                "texture-compression-etc2",
                                "texture-compression-astc",
                                "timestamp-query",
                                "indirect-first-instance"
                            ]
                        }
                    });
                    this._engine.loadingScreen = new CustomLoadingScreen(loadingScreen);
                    await (this._engine as WebGPUEngine).initAsync();
                    this._engine.displayLoadingUI();
                } catch (webgpuError) {
                    // If WebGPU init fails (missing required features, drivers, etc.),
                    // fall back to WebGL when available.
                    Log.warn(Log.types.UI, `WebGPU init failed, falling back to WebGL: ${findErrorMessage(webgpuError)}`);
                    this._webgpuSupported = false;
                }
            }

            if (!this._webgpuSupported) {
                if (!Renderer._isWebGLSupported()) {
                    throw new Error("WebGL not supported or disabled in this browser");
                }
                this._engine = new Engine(canvas, true);
                this._engine.renderEvenInBackground = true;
                this._engine.loadingScreen = new CustomLoadingScreen(loadingScreen);
                this._engine.displayLoadingUI();
            }

            this._renderingScenes = new Array<VScene>();

            // Update renderer statistics for the UI.
            setInterval(() => {
                if (this._engine) {
                    if (this._renderingScenes.length > 0 && this._renderingScenes[0]) {
                        applicationStore.renderer.fps = this._engine.getFps();
                        applicationStore.renderer.cameraLocation = this._renderingScenes[0]._scene.activeCamera?.globalPosition.clone();
                        applicationStore.renderer.cameraRotation = this._renderingScenes[0]._scene.activeCamera?.absoluteRotation.clone();
                    }
                }
            }, Number(Config.getItem("Renderer.StatUpdateSeconds", "1000")));
        } catch (error) {
            const message = findErrorMessage(error);
            Log.error(Log.types.UI, `Rendering engine failed to initialize: ${message}`);
            try {
                this._engine?.hideLoadingUI();
            } catch { /* ignore */ }
            window.alert(`Rendering engine failed to initialize.\n${message}\n\nPlease ensure your browser supports WebGL/WebGPU and hardware acceleration is enabled.`);
            throw error;
        }
    }

    /**
     * Create a new Vircadia Scene and append it to the render queue.
     * @param index `(Optional)` The index of the render queue to place the scene into.
     * @returns A reference to the new scene.
     */
    public static createScene(index = this._renderingScenes.length): VScene {
        const scene = new VScene(this._engine as Engine, index);
        this._renderingScenes[index] = scene;
        return scene;
    }

    /**
     * Get the count of Vircadia Scenes in the render queue.
     * @returns The count of scenes.
     */
    public static getSceneCount(): number {
        if (this._renderingScenes) {
            return this._renderingScenes.length;
        }
        return 0;
    }

    /**
     * Get a particular Vircadia Scene from the render queue.
     * @param index `(Optional)` The index of the scene in the render queue. If not specified, retrieves the first scene in the queue.
     * @returns A reference to the requested scene.
     */
    public static getScene(index = 0): VScene {
        return this._renderingScenes[index];
    }

    /**
     * Resize the rendered view to match the size of the canvas.
     */
    public static resize(): void {
        if (!this._webgpuSupported) {
            this._engine?.resize();
        }
    }

    /**
     * Start the render loop, rendering all queued scenes to the canvas.
     * @param scenes `(Optional)` A queue of scenes to render.
     */
    public static startRenderLoop(scenes?: VScene[]): void {
        if (scenes) {
            this._renderingScenes = scenes;
        }
        this._runRenderLoop();
        document.addEventListener("visibilitychange", this._runRenderLoop.bind(this), false);
    }

    /**
     * Handle running the render loop.
     *
     * NOTE:
     * The render loop of Babylon's engine relies on `requestAnimationFrame()`.
     * Most browsers stop running animation-frame callbacks in background tabs in order to improve performance and battery life.
     * To make scene still render in the background, use `setInterval()` to run the render loop when the web page is hidden.
     */
    private static _runRenderLoop(): void {
        if (document.hidden) {
            this._engine.stopRenderLoop();
            if (!this._intervalId) {
                const backgroundFrameTime = 16;
                this._intervalId = setInterval(this._render.bind(this), backgroundFrameTime);
            }
        } else {
            if (this._intervalId) {
                clearInterval(this._intervalId);
                this._intervalId = null;
            }
            this._engine.runRenderLoop(this._render.bind(this));
        }
    }

    /**
     * Render one frame from all scenes in the render queue.
     */
    private static _render(): void {
        this._renderingScenes.forEach((vscene) => {
            vscene.render();
        });
    }

    /**
     * Dispose of all scenes in the render queue and stop the render loop.
     */
    public static dispose(): void {
        this._renderingScenes.forEach((vscene) => {
            vscene.dispose();
        });
        this._renderingScenes = [];
        this._engine.stopRenderLoop();
    }
}
