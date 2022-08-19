/* eslint-disable class-methods-use-this */
//
//  KeyLigth.ts
//
//  Created by Nolan Huang on 27 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { GenericNodeComponent } from "@Modules/object";
import { Mesh, Scene, MeshBuilder, StandardMaterial,
    Texture, CubeTexture, EquiRectangularCubeTexture, BaseTexture } from "@babylonjs/core";
import { ISkyboxProperty } from "../EntityProperties";
import { EntityMapper } from "../package";
import { AssetUrl } from "../builders/asset";

/* eslint-disable new-cap */

export class SkyboxComponent extends GenericNodeComponent<Mesh> {
    static readonly DefaultSkyBoxSize = 2000;
    static readonly DefaultCubeMapSize = 1024;

    constructor(props: ISkyboxProperty, scene : Scene, id: string) {
        super();
        const skyBox = MeshBuilder.CreateBox(this.componentType,
            { size: SkyboxComponent.DefaultSkyBoxSize }, scene);
        skyBox.infiniteDistance = true;
        skyBox.id = id;

        this._node = skyBox;

        this.update(props);
    }

    public get componentType():string {
        return SkyboxComponent.typeName;
    }

    static get typeName(): string {
        return "Skybox";
    }

    public update(props: ISkyboxProperty) : void {
        if (this._node) {
            const mesh = this._node;
            const scene = mesh.getScene();
            let material = mesh.material as StandardMaterial;

            if (!material) {
                material = new StandardMaterial(`${mesh.name}_${mesh.id}`, scene);
                material.backFaceCulling = false;
                material.disableLighting = true;
                mesh.material = material;
            }

            material.diffuseColor = EntityMapper.mapToColor3(props.color);
            material.specularColor = EntityMapper.mapToColor3(props.color);

            if (props.url && props.url !== material.reflectionTexture?.name) {
                if (material.reflectionTexture) {
                    material.reflectionTexture.dispose();
                }

                material.reflectionTexture = this.createflectionTexture(props.url, scene);
            }
        }
    }

    private createflectionTexture(url: string, scene:Scene) : BaseTexture {
        let reflectionTexture = null;

        const assetUrl = new AssetUrl(url);

        if (assetUrl.fileExtension === "") {
            reflectionTexture = new CubeTexture(url, scene);
        } else {

            // TODO: support Cubemaps with one image
            reflectionTexture = new EquiRectangularCubeTexture(url, scene, SkyboxComponent.DefaultCubeMapSize);
        }

        reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;

        return reflectionTexture;
    }

}
