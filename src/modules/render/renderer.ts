/*
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

// This is disabled because TS complains about BABYLON's use of cap'ed function names
/* eslint-disable new-cap */

import * as BABYLON from "babylonjs";

// General Modules
import { VScene } from "./vscene";

// import Log from "../debugging/log";

export const Renderer = {
    _engine: <BABYLON.Engine><unknown>undefined,
    _renderingScenes: <VScene[]><unknown>undefined,

    // eslint-disable-next-line @typescript-eslint/require-await
    async initialize(pCanvas: HTMLCanvasElement): Promise<void> {
        Renderer._engine = new BABYLON.Engine(pCanvas);
    },
    createScene(): VScene {
        return new VScene(Renderer._engine);
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
