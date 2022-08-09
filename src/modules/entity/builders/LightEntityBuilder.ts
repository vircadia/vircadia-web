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

export class LightEntityBuilder extends AbstractEntityBuilder {
    // eslint-disable-next-line class-methods-use-this
    public build(gameObject: GameObject, entity: IEntity) : void {
        const light = LightEntityBuilder.createPointLight(entity as ILightEntity,
            gameObject.getScene());
        const comp = new LightComponent(light);
        gameObject.addComponent(comp);
    }

    public static createPointLight(props: ILightEntity, scene: Scene) : Light {
        if (props.isSpotlight) {
            const light = new SpotLight(
                "SpotLight",
                EntityMapper.mapToVector3(Vector3.Zero()),
                EntityMapper.mapToVector3(Vector3.Forward()),
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                props.falloffRadius ?? Math.PI * 0.2,
                props.exponent ?? 1,
                scene
            );

            light.range = props.cutoff ?? light.range;
            light.intensity = props.intensity ?? light.intensity;
            return light;
        }
        const light = new PointLight(
            "PointLight",
            EntityMapper.mapToVector3(Vector3.Zero()),
            scene);
        return light;
    }

}
