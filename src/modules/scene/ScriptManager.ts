//
//  ScriptManager.ts
//
//  Created by Kalila on 23 Sep 2024.
//  Copyright 2024 Vircadia contributors.
//  Copyright 2024 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import {
    type AbstractMesh,
    Scene,
    ActionManager
} from "@babylonjs/core";
import * as BABYLON from "@babylonjs/core";
import { transpile } from "typescript";
import Log from "../debugging/log";
import { glTF as MeshTypes } from "../../../types/vircadia_gameUse";

export class ScriptManager {
    public static executeScriptsOnMeshes(meshes: AbstractMesh[], scene: Scene): void {
        for (const mesh of meshes) {
            const metadataExtras = mesh?.metadata?.gltf?.extras ?? mesh?.parent?.metadata?.gltf?.extras;

            const meshMetadata = new MeshTypes.Metadata(metadataExtras as Partial<MeshTypes.MetadataInterface>);

            const script: string = meshMetadata.vircadia_script;

            if (!script) {
                continue;
            }

            try {
                this.executeWithContext(script, { mesh, BABYLON, scene });
                Log.debug(
                    Log.types.ENTITIES,
                    `Executed script for mesh ${mesh.name}.`
                );
            } catch (error) {
                Log.error(
                    Log.types.ENTITIES,
                    `Failed to execute script for mesh ${mesh.name}: ${error}`
                );
                throw error;
            }
        }
    }

    private static transpile(script: string): string {
        Log.debug(Log.types.ENTITIES, `Transpiling script: ${script}`);

        const transpiledScript: string = (transpile as (input: string) => string)(script);

        Log.debug(Log.types.ENTITIES, `Transpiled script: ${transpiledScript}`);

        return transpiledScript;
    }

    private static wrapAndTranspile(script: string, contextKeys: string[]): string {
        const contextParamsString = contextKeys.join(', ');
        const wrappedScript = `
            (function(${contextParamsString}) {
                ${script}
            });
        `;

        return this.transpile(wrappedScript);
    }

    static executeWithContext(script: string, context: Record<string, any>): any {
        const contextKeys = Object.keys(context);
        const wrappedAndTranspiledScript = this.wrapAndTranspile(script, contextKeys);

        Log.debug(Log.types.ENTITIES, `Executing script with context: ${wrappedAndTranspiledScript}`);

        // eslint-disable-next-line no-eval
        const scriptFunction = eval(wrappedAndTranspiledScript) as (...args: unknown[]) => unknown;
        return scriptFunction(...Object.values(context) as unknown[]);
    }
}
