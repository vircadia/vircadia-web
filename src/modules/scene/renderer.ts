/*
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

// The following disable is because TS complains about BABYLON's use of cap'ed function names
/* eslint-disable new-cap */

import { Engine, Nullable } from "@babylonjs/core";
import Ammo from "ammojs-typed";
import { Store, Mutations } from "@Store/index";
import { Config } from "@Base/config";
import { WebGPUEngine } from "@babylonjs/core/Engines/webgpuEngine";
// import { DomainMgr } from "@Modules/domain";


// General Modules
import { VScene } from "@Modules/scene/vscene";
import { CustomLoadingScreen } from "@Modules/scene/LoadingScreen";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Log from "@Modules/debugging/log";

export const Renderer = {
    _engine: <Engine><unknown>undefined,
    _renderingScenes: <VScene[]><unknown>undefined,
    _webgpuSupported: false,
    _boundRenderFunction: <Nullable<()=>void>>null,
    _intervalID: <Nullable<NodeJS.Timeout>> null,

    // eslint-disable-next-line @typescript-eslint/require-await
    async initialize(pCanvas: HTMLCanvasElement, pLoadingScreen: HTMLElement): Promise<void> {
        // FIXME: This is a temporary hack to disable WebGPU on Chrome and Edge.
        // this._webgpuSupported = await WebGPUEngine.IsSupportedAsync;
        const isChrome = navigator.userAgent.indexOf("Chrome") >= 0;
        console.debug("Is Chrome:", isChrome);
        this._webgpuSupported = !isChrome && await WebGPUEngine.IsSupportedAsync;
        if (this._webgpuSupported) {

            Renderer._engine = new WebGPUEngine(pCanvas, {
                deviceDescriptor: {
                    requiredFeatures: [
                        "depth-clip-control",
                        "depth24unorm-stencil8",
                        "depth32float-stencil8",
                        "texture-compression-bc",
                        "texture-compression-etc2",
                        "texture-compression-astc",
                        "timestamp-query",
                        "indirect-first-instance"
                    ]
                }
            });
            Renderer._engine.loadingScreen = new CustomLoadingScreen(pLoadingScreen);
            await (Renderer._engine as WebGPUEngine).initAsync();
            Renderer._engine.displayLoadingUI();
        } else {
            Renderer._engine = new Engine(pCanvas, true);
            Renderer._engine.renderEvenInBackground = true;
            Renderer._engine.loadingScreen = new CustomLoadingScreen(pLoadingScreen);
            Renderer._engine.displayLoadingUI();
        }

        this._renderingScenes = new Array<VScene>();

        // Update renderer statistics for Vue
        setInterval(() => {
            if (Renderer._engine) {
                if (Renderer._renderingScenes.length > 0 && Renderer._renderingScenes[0]) {
                    Store.commit(Mutations.MUTATE, {
                        property: "renderer",
                        with: {
                            fps: Renderer._engine.getFps(),
                            cameraLocation: Renderer._renderingScenes[0]._scene.activeCamera?.globalPosition.clone(),
                            cameraRotation: Renderer._renderingScenes[0]._scene.activeCamera?.absoluteRotation.clone()
                        }
                    });
                }
            }
        }, Number(Config.getItem("Renderer.StatUpdateSeconds", "1000")));

        // Enable physics
        await Ammo();
    },
    createScene(pSceneIndex = 0): VScene {
        const scene = new VScene(Renderer._engine, pSceneIndex);
        this._renderingScenes[pSceneIndex] = scene;
        return scene;
    },
    getScene(pSceneIndex = 0): VScene {
        return this._renderingScenes[pSceneIndex];
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    resize(pHeight: number, pWidth: number): void {
        if (!this._webgpuSupported) {
            this._engine.resize();
        }
    },
    startRenderLoop(pScenes: VScene[]): void {
        this._renderingScenes = pScenes;
        this._runRenderLoop();
        document.addEventListener("visibilitychange", this._runRenderLoop.bind(this), false);
    },
    // NOTE:
    // The render loop of babylon engine relaies on requestAnimationFrame().
    // Most browsers stop sending requestAnimationFrame() callbacks to background tabs
    // in order to improve performance and battery life.
    // To make scene still render in background, use setInterval() to run the render loop when the web page is hidden.
    _runRenderLoop(): void {
        if (!this._boundRenderFunction) {
            this._boundRenderFunction = this._render.bind(this);
        }
        if (document.hidden) {
            this._engine.stopRenderLoop();
            if (!this._intervalID) {
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers, @typescript-eslint/no-implied-eval
                this._intervalID = setInterval(this._boundRenderFunction, 16);
            }
        } else {
            if (this._intervalID) {
                clearInterval(this._intervalID);
                this._intervalID = null;
            }
            this._engine.runRenderLoop(this._boundRenderFunction);
        }
    },
    _render(): void {
        this._renderingScenes.forEach((vscene) => {
            vscene.render();
        });
    },
    dispose(): void {
        Renderer._renderingScenes.forEach((vscene) => {
            vscene.dispose();
        });

        this._renderingScenes = [];
    }
};
