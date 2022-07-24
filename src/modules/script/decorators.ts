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

import {
    // IInspectable,
    InspectableType
} from "@babylonjs/core/Misc";

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

export interface InspectorPropertyOptions {
    propertyName?: string;
    label?: string
    type?: InspectableType
}

export function displayInInspector(options ?: InspectorPropertyOptions | undefined) {
    return (target: any, propertyKey: string):void => {
        const index = propertyKey[0] === "_" ? 1 : 0;
        const label = options && options.label
            ? options.label
            : propertyKey[index].toUpperCase() + propertyKey.slice(index + 1);
        const propertyName = options && options.propertyName ? options.propertyName : propertyKey.slice(index);
        const type = options && options.type ? options.type : InspectableType.String;

        target.inspectableCustomProperties = target.inspectableCustomProperties ?? [];
        target.inspectableCustomProperties.push(
            {
                label,
                propertyName,
                type
            }
        );

        console.log("displayInInspector", target);
    };
}

export function accessorDisplayInInspector(options ?: InspectorPropertyOptions | undefined) {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const index = 0;
        // capatilze the propertyKey
        const label = options && options.label
            ? options.label
            : propertyKey[index].toUpperCase() + propertyKey.slice(index + 1);

        const type = options && options.type ? options.type : InspectableType.String;

        target.inspectableCustomProperties = target.inspectableCustomProperties ?? [];
        target.inspectableCustomProperties.push(
            {
                label,
                propertyName: propertyKey,
                type
            }
        );
    };
}
