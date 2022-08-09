//
//  EnvironmentEntityBuilder.ts
//
//  Created by Nolan Huang on 9 Aug 2022.
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
    EquiRectangularCubeTexture, DirectionalLight,
    Vector3
} from "@babylonjs/core";

import { IAmbientLightProperty, ISkyboxProperty, IHazeProperty, IBloomProperty, IKeyLightProperty } from "../EntityProperties";
import { EntityMapper } from "./EntityMapper";
import { AssetUrl } from "./asset";
import { IEntity, IZoneEntity } from "../Entities";
import { GameObject, LightComponent, MeshComponent } from "@Base/modules/object";

const DefaultSkyBoxSize = 2000;
const DefaultCubeMapSize = 1024;

export class ZoneEntityBuilder {

    // eslint-disable-next-line class-methods-use-this
    public build(gameObject: GameObject, entity: IEntity) : void {
        const props = entity as IZoneEntity;
        const scene = gameObject.getScene();

        if (props.keyLight) {
            const light = ZoneEntityBuilder.createKeyLight(props.keyLight, scene);
            const comp = new LightComponent(light);
            gameObject.addComponent(comp);
        }

        if (props.ambientLight) {
            const light = ZoneEntityBuilder.createAmbientLight(props.ambientLight, scene);
            const comp = new LightComponent(light);
            gameObject.addComponent(comp);
        }

        if (props.skybox) {
            const skyBox = ZoneEntityBuilder.createSkybox(props.skybox, scene);
            const comp = new MeshComponent(skyBox);
            gameObject.addComponent(comp);
        }

        if (props.haze) {
            ZoneEntityBuilder.createHaze(props.haze, scene);
        }
    }

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
