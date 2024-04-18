/* eslint-disable @typescript-eslint/no-non-null-assertion */
//
//  LightManager.ts
//
//  Created by Kalila on 08 Feb 2024.
//  Copyright 2024 Vircadia contributors.
//  Copyright 2024 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import {
    type Scene,
} from "@babylonjs/core";
import Log from "../debugging/log";

export class LightManager {
    private static handleKeyPress = (event: KeyboardEvent) => {
        if (event.key === "u") {
            const scene = LightManager.currentScene; // Ensure you have a reference to the current scene
            const lights = scene.lights;
            lights.forEach((light) => {
                light.lightmapMode = (light.lightmapMode + 1) % 3;
                Log.debug(Log.types.ENTITIES, `Lightmap mode for ${light.name}: ${light.lightmapMode}`);
            });
        }
    };

    private static currentScene: Scene;

    public static applyLightProperties(scene: Scene): void {
        this.currentScene = scene; // Store the current scene reference

        // Ensure we don't add the same event listener more than once
        window.removeEventListener("keyup", this.handleKeyPress);
        window.addEventListener("keyup", this.handleKeyPress);
    }
}
