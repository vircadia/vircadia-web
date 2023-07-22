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
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Scene, Node, InspectableType, Color3, Vector3 } from "@babylonjs/core";
import { ScriptComponent } from "./script";
import { requireDecoratorInspectorPropertyDescs } from "./decorators";
import Log from "@Modules/debugging/log";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getInspectableTypeOf(obj: any, propertyName: string): InspectableType {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const property = obj[propertyName];
    const type = typeof property;
    if (type === "number") {
        return InspectableType.Slider;
    }
    if (type === "boolean") {
        return InspectableType.Checkbox;
    }
    if (type === "string") {
        return InspectableType.String;
    }
    if (property instanceof Color3) {
        return InspectableType.Color3;
    }
    if (property instanceof Vector3) {
        return InspectableType.Vector3;
    }

    return InspectableType.String;
}


function preprocress(script: ScriptComponent): void {
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    let prototype = Object.getPrototypeOf(script);
    // recursively add custom properties to node.inspectableCustomProperties
    while (prototype) {
        const propertyDescriptions = requireDecoratorInspectorPropertyDescs(String(prototype.constructor.name));

        if (propertyDescriptions) {
            script.inspectableCustomProperties = script.inspectableCustomProperties ?? [];
            propertyDescriptions.forEach((description) => {
                script.inspectableCustomProperties.push(
                    {
                        label: description.label,
                        propertyName: description.propertyName,
                        type: description.type ?? getInspectableTypeOf(script, description.propertyName),
                        min: description.min,
                        max: description.max,
                        step: description.step,
                        callback: description.callback,
                        options: description.options
                    }
                );
            });
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        prototype = Object.getPrototypeOf(prototype);
    }
}

/**
 * Requires the needed script and attach to scene.
 */
export function requireScript(scene: Scene, script: ScriptComponent): void {
    const gameObjName = script.gameObject ? script.gameObject.name : "";
    Log.debug(Log.types.OTHER, `attach script ${script.name} to ${gameObjName} `);

    preprocress(script);

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
    script.onDisposeObservable.add(() => {
        if (startObserver) {
            scene.onBeforeRenderObservable.remove(startObserver);
        }
        scene.onBeforeRenderObservable.remove(updateObserver);

        script.onStop();
    });
}

/**
 * Requires the needed scripts for the given nodes array and attach them.
 * @param scene defines the reference to the scene that contains the given nodes.
 * @param nodes the array of nodes to attach script (if exists).
 */
export function requireScripts(scene: Scene, nodes: Node[]): void {
    nodes.forEach((node) => {
        if (node instanceof ScriptComponent) {
            requireScript(scene, node);
        }
    });
}

/**
 * Attach the imported script to a new scene.
 */
export function reattachScript(scene: Scene, script: ScriptComponent): void {
    // update
    const updateObserver = scene.onBeforeRenderObservable.add(() => {
        if (script.isEnabled()) {
            script.onUpdate();
        }
    });

    // stop
    script.onDisposeObservable.add(() => {
        scene.onBeforeRenderObservable.remove(updateObserver);

        script.onStop();
    });
}
