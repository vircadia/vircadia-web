//
//  LightBuilder.ts
//
//  Created by Nolan Huang on 8 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable new-cap */
import {
    Light, PointLight, SpotLight,
    Scene, Vector3
} from "@babylonjs/core";

import { IEntity, ILightEntity } from "../Entities";
import { EntityMapper } from "./EntityMapper";
import { AbstractEntityBuilder } from "./AbstractEntityBuilder";
import { GameObject, LightComponent } from "@Base/modules/object";
import { LightEntityController } from "../components";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Log from "@Base/modules/debugging/log";

export class LightEntityBuilder extends AbstractEntityBuilder {
    // eslint-disable-next-line class-methods-use-this
    public build(gameObject: GameObject, entity: IEntity) : void {
        const lightEntity = entity as ILightEntity;

        LightEntityBuilder.buildLight(gameObject, lightEntity);

        if (!gameObject.getComponent(LightEntityController.typeName)) {
            gameObject.addComponent(new LightEntityController(lightEntity));
        }
    }

    public static buildLight(gameObject: GameObject, entity: ILightEntity) : void {
        gameObject.removeComponent(LightComponent.typeName);

        let light = null;
        if (entity.isSpotlight) {
            light = LightEntityBuilder.createSpotLight(entity, gameObject.getScene());
        } else {
            light = LightEntityBuilder.createPointLight(entity, gameObject.getScene());
        }

        LightEntityBuilder.buildLightProperties(light, entity);

        const comp = new LightComponent(light);
        gameObject.addComponent(comp);
    }

    public static createSpotLight(entity: ILightEntity, scene: Scene) : Light {
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

    public static createPointLight(entity: ILightEntity, scene: Scene) : Light {
        const light = new PointLight(
            "PointLight",
            Vector3.Zero(),
            scene);
        return light;
    }

    public static buildLightProperties(light:Light, entity: ILightEntity) : void {

        const color = EntityMapper.mapToColor3(entity.color);
        light.diffuse = color;
        light.specular = color;

        if (entity.intensity) {
            light.intensity = entity.intensity;
        }

        if (entity.dimensions) {
            light.range = entity.dimensions.z;
        }

        if (entity.falloffRadius) {
            light.radius = entity.falloffRadius;
        }

        if (entity.isSpotlight) {
            const spotlight = light as SpotLight;

            if (entity.exponent) {
                spotlight.exponent = entity.exponent;
            }

            if (entity.cutoff) {
                spotlight.angle = EntityMapper.toRadians(entity.cutoff);
            }
        }
    }

}
