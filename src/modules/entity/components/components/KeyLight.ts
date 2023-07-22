/* eslint-disable class-methods-use-this */
//
//  KeyLight.ts
//
//  Created by Nolan Huang on 27 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable new-cap */

import { GenericNodeComponent } from "@Modules/object";
import { DirectionalLight, Scene, Vector3 } from "@babylonjs/core";
import { IKeyLightProperty } from "../../EntityProperties";
import { EntityMapper } from "../../package";

export class KeyLightComponent extends GenericNodeComponent<DirectionalLight> {
    static readonly DefaultDirection = Vector3.Down();

    constructor(props: IKeyLightProperty, scene: Scene) {
        super();
        this._node = new DirectionalLight(KeyLightComponent.typeName, KeyLightComponent.getDirection(props), scene);

        this.update(props);
    }

    public get componentType(): string {
        return KeyLightComponent.typeName;
    }

    static get typeName(): string {
        return "KeyLight";
    }

    public update(props: IKeyLightProperty): void {
        if (this._node) {
            const light = this._node;
            if (typeof props.intensity === "number") {
                light.intensity = props.intensity;
            }
            if (props.color) {
                const color = EntityMapper.mapToColor3(props.color);
                light.diffuse = color;
                light.specular = color;
            }

            light.direction = KeyLightComponent.getDirection(props);

            if (props.castShadows !== undefined) {
                light.shadowEnabled = props.castShadows;
            }

            if (typeof props.shadowBias === "number") {
                light.shadowMinZ = props.shadowBias;
            }

            if (typeof props.shadowMaxDistance === "number") {
                light.shadowMaxZ = props.shadowMaxDistance;
            }
        }
    }

    static getDirection(props: IKeyLightProperty): Vector3 {
        return props.direction
            ? EntityMapper.mapToVector3(props.direction)
            : KeyLightComponent.DefaultDirection;
    }
}
