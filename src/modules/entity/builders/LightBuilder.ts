//
//  LightBuilder.ts
//
//  Created by Nolan Huang on 27 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable new-cap */
import {
    Light, PointLight, SpotLight,
    Scene, Vector3, DirectionalLight
} from "@babylonjs/core";

import { IKeyLightProperty } from "../EntityProperties";
import { ILightEntity } from "../Entities";
import { EntityMapper } from "./EntityMapper";

export class LightBuilder {
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

    public static createKeyLight(props: IKeyLightProperty, scene: Scene) : Light {
        const light = new DirectionalLight("KeyLight", EntityMapper.mapToVector3(props.direction), scene);
        light.intensity = props.intensity ?? 1;
        light.diffuse = EntityMapper.mapToColor3(props.color);
        light.specular = EntityMapper.mapToColor3(props.color);

        // TODO:
        // props.castShadows

        return light;
    }

}
