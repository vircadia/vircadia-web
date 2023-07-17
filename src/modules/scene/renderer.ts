//
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

/**
 * Static methods controlling the rendering of the scene(s).
 */
export class Renderer {
    private static engine = <Engine><unknown>undefined;
    private static renderingScenes = <VScene[]><unknown>undefined;
    private static webgpuSupported = false;
    private static intervalId = <Nullable<NodeJS.Timeout>> null;

    /**
     * Initialize the rendering engine.
     * @param canvas The canvas element to render the scene onto.
     * @param loadingScreen The element to show when the scene is loading.
     */
    public static async initialize(canvas: HTMLCanvasElement, loadingScreen: HTMLElement): Promise<void> {
        this.webgpuSupported = await WebGPUEngine.IsSupportedAsync;
        // FIXME: Temporarily disable WebGPU on MacOS until update to a Babylon version that supports it.
        this.webgpuSupported = false;
        if (this.webgpuSupported) {
            this.engine = new WebGPUEngine(canvas, {
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
            this.engine.loadingScreen = new CustomLoadingScreen(loadingScreen);
            await (this.engine as WebGPUEngine).initAsync();
            this.engine.displayLoadingUI();
        } else {
            this.engine = new Engine(canvas, true);
            this.engine.renderEvenInBackground = true;
            this.engine.loadingScreen = new CustomLoadingScreen(loadingScreen);
            this.engine.displayLoadingUI();
        }

        this.renderingScenes = new Array<VScene>();

        // Update renderer statistics for the UI.
        setInterval(() => {
            if (this.engine) {
                if (this.renderingScenes.length > 0 && this.renderingScenes[0]) {
                    applicationStore.renderer.fps = this.engine.getFps();
                    applicationStore.renderer.cameraLocation = this.renderingScenes[0]._scene.activeCamera?.globalPosition.clone();
                    applicationStore.renderer.cameraRotation = this.renderingScenes[0]._scene.activeCamera?.absoluteRotation.clone();
                }
            }
        }, Number(Config.getItem("Renderer.StatUpdateSeconds", "1000")));
    }

    /**
     * Create a new Vircadia Scene and append it to the render queue.
     * @param index `(Optional)` The index of the render queue to place the scene into.
     * @returns A reference to the new scene.
     */
    public static createScene(index = this.renderingScenes.length): VScene {
        const scene = new VScene(this.engine, index);
        this.renderingScenes[index] = scene;
        return scene;
    }

    /**
     * Get a particular Vircadia Scene from the render queue.
     * @param index `(Optional)` The index of the scene in the render queue. If not specified, retrieves the first scene in the queue.
     * @returns A reference to the requested scene.
     */
    public static getScene(index = 0): VScene {
        return this.renderingScenes[index];
    }

    /**
     * Resize the rendered view to match the size of the canvas.
     */
    public static resize(): void {
        if (!this.webgpuSupported) {
            this.engine?.resize();
        }
    }

    /**
     * Start the render loop, rendering all queued scenes to the canvas.
     * @param scenes `(Optional)` A queue of scenes to render.
     */
    public static startRenderLoop(scenes?: VScene[]): void {
        if (scenes) {
            this.renderingScenes = scenes;
        }
        this.runRenderLoop();
        document.addEventListener("visibilitychange", this.runRenderLoop.bind(this), false);
    }

    /**
     * Handle running the render loop.
     *
     * NOTE:
     * The render loop of Babylon's engine relies on `requestAnimationFrame()`.
     * Most browsers stop running animation-frame callbacks in background tabs in order to improve performance and battery life.
     * To make scene still render in the background, use `setInterval()` to run the render loop when the web page is hidden.
     */
    private static runRenderLoop(): void {
        if (document.hidden) {
            this.engine.stopRenderLoop();
            if (!this.intervalId) {
                const backgroundFrameTime = 16;
                this.intervalId = setInterval(this.render.bind(this), backgroundFrameTime);
            }
        } else {
            if (this.intervalId) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
            this.engine.runRenderLoop(this.render.bind(this));
        }
    }

    /**
     * Render one frame from all scenes in the render queue.
     */
    private static render(): void {
        this.renderingScenes.forEach((vscene) => {
            vscene.render();
        });
    }

    /**
     * Dispose of all scenes in the render queue and stop the render loop.
     */
    public static dispose(): void {
        this.renderingScenes.forEach((vscene) => {
            vscene.dispose();
        });
        this.renderingScenes = [];
        this.engine.stopRenderLoop();
    }
}
