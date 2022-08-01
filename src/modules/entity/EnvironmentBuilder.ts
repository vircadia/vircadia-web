//
//  EnvironmentBuilder.ts
//
//  Created by Nolan Huang on 28 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    Mesh, Scene, MeshBuilder, StandardMaterial,
    Texture, CubeTexture, Light, HemisphericLight,
    EquiRectangularCubeTexture, DefaultRenderingPipeline,
    Vector3,
    Color3
} from "@babylonjs/core";

import { IAmbientLightProperty, ISkyboxProperty, IHazeProperty, IBloomProperty } from "./Properties";
import { EntityMapper } from "./EntityMapper";
import { AssetUrl } from "./asset";

const DefaultSkyBoxSize = 2000;
const DefaultCubeMapSize = 1024;

export class EnvironmentBuilder {

    public static createAmbientLight(props: IAmbientLightProperty, scene: Scene) : Light {
        const light = new HemisphericLight("AmbientLight", Vector3.Up(), scene);
        light.intensity = props.ambientIntensity;
        return light;
    }

    public static createSkybox(props: ISkyboxProperty, scene: Scene) : Mesh {
        const skyBox = MeshBuilder.CreateBox("skyBox", { size: DefaultSkyBoxSize }, scene);

        const skyboxMaterial = new StandardMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.diffuseColor = EntityMapper.mapToColor3(props.color);
        skyboxMaterial.specularColor = EntityMapper.mapToColor3(props.color);
        skyboxMaterial.disableLighting = true;

        if (props.url) {
            const asset = new AssetUrl(props.url);

            if (asset.fileExtension === "") {
                skyboxMaterial.reflectionTexture = new CubeTexture(props.url, scene);

            } else {
                // TODO: support Cubemaps with on image
                skyboxMaterial.reflectionTexture = new EquiRectangularCubeTexture(props.url, scene, DefaultCubeMapSize);
            }
            skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
        }

        skyBox.material = skyboxMaterial;
        skyBox.infiniteDistance = true;

        return skyBox;
    }

    public static createHaze(props: IHazeProperty, scene: Scene) : void {
        scene.fogMode = Scene.FOGMODE_LINEAR;
        scene.fogColor = EntityMapper.mapToColor3(props.hazeColor);
        scene.fogStart = 20;
        scene.fogEnd = props.hazeRange;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public static createBloom(props: IBloomProperty, scene: Scene) : void {

    }
}
