//
//  decorators.ts
//
//  Created by Nolan Huang on 19 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { InspectableType } from "@babylonjs/core/Misc";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

export interface IInspectorPropertyDesc {
    propertyName: string;
    label: string;
    type?: InspectableType;
    min?: number;
    max?: number;
    step?: number;
    callback?: () => void;
    options?: [];
}

export interface IInspectorPropertyOptions {
    label?: string;
    type?: InspectableType;
    min?: number;
    max?: number;
    step?: number;
    callback?: () => void;
    options?: [];
}

const inspectorPropertiesDescMap = new Map<string, IInspectorPropertyDesc[]>();

export function requireDecoratorInspectorPropertyDescs(name: string): IInspectorPropertyDesc[] | undefined {
    return inspectorPropertiesDescMap.get(name);
}

export function getAndCreateDecoratorInspectorPropertyDescs(name: string): IInspectorPropertyDesc[] {
    const properties = inspectorPropertiesDescMap.get(name);
    if (properties) {
        return properties;
    }

    inspectorPropertiesDescMap.set(name, []);
    return inspectorPropertiesDescMap.get(name) as IInspectorPropertyDesc[];
}

/**
 * Decorator to make the property display in babylon.js inspector.
 */
export function inspector(options?: IInspectorPropertyOptions | undefined) {
    return (target: any, propertyKey: string): void => {
        // remove prefix and capitalize the propertyKey
        const index = propertyKey[0] === "_" ? 1 : 0;
        const label = options && options.label
            ? options.label
            : propertyKey[index].toUpperCase() + propertyKey.slice(index + 1);

        const descs = getAndCreateDecoratorInspectorPropertyDescs(String(target.constructor.name));
        descs.push({
            label,
            propertyName: propertyKey,
            type: options?.type,
            max: options?.max,
            min: options?.min,
            step: options?.step,
            callback: options?.callback,
            options: options?.options
        });
    };
}

/**
 * Decorator to make the accessor display in babylon.js inspector.
 */
export function inspectorAccessor(options?: IInspectorPropertyOptions | undefined) {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const index = 0;
        // capitalize the propertyKey
        const label = options && options.label
            ? options.label
            : propertyKey[index].toUpperCase() + propertyKey.slice(index + 1);

        const descs = getAndCreateDecoratorInspectorPropertyDescs(String(target.constructor.name));
        descs.push({
            label,
            propertyName: propertyKey,
            type: options?.type,
            max: options?.max,
            min: options?.min,
            step: options?.step,
            callback: options?.callback,
            options: options?.options
        });
    };
}
