//
//  processor.ts
//
//  Created by Nolan Huang on 24 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { Scene, Node } from "@babylonjs/core";
import { ScriptComponent } from "./script";
import Log from "@Modules/debugging/log";

export function requireScript(scene: Scene, script : ScriptComponent):void {
    Log.debug(Log.types.OTHER, `attach script ${script.name} `);

    // initialize
    script.onInitialize();

    // start
    const startObserver = scene.onBeforeRenderObservable.addOnce(script.onStart.bind(script));

    // update
    const updateObserver = scene.onBeforeRenderObservable.add(() => {
        if (script.isEnabled()) {
            script.onUpdate();
        }
    });

    // stop
    script.onDispose = () => {
        if (startObserver) {
            scene.onBeforeRenderObservable.remove(startObserver);
        }
        scene.onBeforeRenderObservable.remove(updateObserver);

        script.onStop();
    };
}

/**
 * Requires the nedded scripts for the given nodes array and attach them.
 * @param scene defines the reference to the scene that contains the given nodes.
 * @param nodes the array of nodes to attach script (if exists).
 */
export function requireScriptForNodes(scene: Scene, nodes: Node[]): void {
    nodes.forEach((node) => {
        if (node instanceof ScriptComponent) {
            requireScript(scene, node);
        }
    });
}
