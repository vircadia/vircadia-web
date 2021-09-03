/*
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

// The following disable is because TS complains about BABYLON's use of cap'ed function names
/* eslint-disable new-cap */

import * as BABYLON from "babylonjs";

import { Store, Mutations } from "src/store";
import { Config } from "src/config";

// General Modules
import { VScene } from "./vscene";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Log from "../debugging/log";

export const Renderer = {
    _engine: <BABYLON.Engine><unknown>undefined,
    _renderingScenes: <VScene[]><unknown>undefined,

    // eslint-disable-next-line @typescript-eslint/require-await
    async initialize(pCanvas: HTMLCanvasElement): Promise<void> {
        Renderer._engine = new BABYLON.Engine(pCanvas);
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
        this._engine.resize();
    },
    startRenderLoop(pScenes: VScene[]): void {
        this._renderingScenes = pScenes;
        // eslint-disable-next-line @typescript-eslint/unbound-method
        this._engine.runRenderLoop(Renderer._renderLoop);
    },
    _renderLoop(): void {
        Renderer._renderingScenes.forEach((vscene) => {
            vscene._scene.render();
        });
    }
};
