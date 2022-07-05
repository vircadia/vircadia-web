/*
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

// The following disable is because TS complains about BABYLON's use of cap'ed function names
/* eslint-disable new-cap */

import { Engine } from "@babylonjs/core";

import { Store, Mutations } from "@Store/index";
import { Config } from "@Base/config";
import { WebGPUEngine } from "@babylonjs/core/Engines/webgpuEngine";


// General Modules
import { VScene } from "@Modules/scene/vscene";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Log from "@Modules/debugging/log";

export const Renderer = {
    _engine: <Engine><unknown>undefined,
    _renderingScenes: <VScene[]><unknown>undefined,
    _webgpuSupported: false,

    // eslint-disable-next-line @typescript-eslint/require-await
    async initialize(pCanvas: HTMLCanvasElement): Promise<void> {

        this._webgpuSupported = await WebGPUEngine.IsSupportedAsync;
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
            await (Renderer._engine as WebGPUEngine).initAsync();
        } else {
            Renderer._engine = new Engine(pCanvas, true);
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
        // eslint-disable-next-line @typescript-eslint/unbound-method
        this._engine.runRenderLoop(Renderer._renderLoop);
    },
    _renderLoop(): void {
        Renderer._renderingScenes.forEach((vscene) => {
            vscene.render();
        });
    }
};
