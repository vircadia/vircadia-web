//
//  lightComponent.ts
//
//  Created by Nolan Huang on 21 Sep 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable class-methods-use-this */
/* eslint-disable new-cap */

import { LightComponent } from "@Modules/object";
import { PointLight, SpotLight, Light, Vector3, Scene } from "@babylonjs/core";
import { ILightEntity } from "../../EntityInterfaces";
import { EntityMapper } from "../../package";

export class LightEntityComponent extends LightComponent {
    public get componentType(): string {
        return LightEntityComponent.typeName;
    }

    static get typeName(): string {
        return "LightEntity";
    }

    public load(entity: ILightEntity): void {
        if (!this._gameObject) {
            return;
        }

        if (this._light) {
            this._light.dispose();
            this._light = null;
        }

        if (entity.isSpotlight) {
            this.light = this._createSpotLight(entity, this._gameObject.getScene());
        } else {
            this.light = this._createPointLight(entity, this._gameObject.getScene());
        }

        this.updateProperties(entity);
        this.updateDimensions(entity);
    }

    public _createSpotLight(entity: ILightEntity, scene: Scene): Light {
        const light = new SpotLight(
            "SpotLight",
            Vector3.Zero(),
            Vector3.Backward(),
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            EntityMapper.toRadians(entity.cutoff ?? 75),
            entity.exponent ?? 1,
            scene
        );

        return light;
    }

    public _createPointLight(entity: ILightEntity, scene: Scene): Light {
        const light = new PointLight(
            "PointLight",
            Vector3.Zero(),
            scene);
        return light;
    }

    public updateProperties(entity: ILightEntity): void {
        if (!this._light) {
            return;
        }

        const color = EntityMapper.mapToColor3(entity.color);
        this._light.diffuse = color;
        this._light.specular = color;

        if (typeof entity.intensity === "number") {
            this._light.intensity = entity.intensity;
        }
        /*
        if (entity.dimensions) {
            this._light.range = entity.dimensions.z;
        } */

        if (typeof entity.falloffRadius === "number") {
            this._light.radius = entity.falloffRadius;
        }

        if (entity.isSpotlight) {
            const spotlight = this._light as SpotLight;

            if (typeof entity.exponent === "number") {
                spotlight.exponent = entity.exponent;
            }

            if (typeof entity.cutoff === "number") {
                spotlight.angle = EntityMapper.toRadians(entity.cutoff);
            }
        }
    }

    public updateDimensions(entity: ILightEntity): void {
        if (entity.dimensions && this._light) {
            this._light.range = entity.dimensions.z;
        }
    }
}
