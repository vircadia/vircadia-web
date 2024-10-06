//
//  skybox.ts
//
//  Created by Nolan Huang on 27 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//



import { MeshComponent, DEFAULT_MESH_RENDER_GROUP_ID } from "@Modules/object";
import { Scene, MeshBuilder, StandardMaterial, Texture, CubeTexture, EquiRectangularCubeTexture, BaseTexture, Camera } from "@babylonjs/core";
import { ISkyboxProperty, IVector3Property } from "../../EntityProperties";
import { EntityMapper } from "../../package";
import { AssetUrl } from "../../builders/asset";

export class SkyboxComponent extends MeshComponent {
    private _camera: Camera | null = null;
    private _scene: Scene | null = null;

    static readonly DefaultSkyBoxSize = 10000;
    static readonly DefaultCubeMapSize = 1024;

    /**
     * A string identifying the type of this component.
     * @returns `"Skybox"`
     */
    public get componentType(): string {
        return SkyboxComponent.typeName;
    }

    /**
     * A string identifying the type of this component.
     * @returns `"Skybox"`
     */
    static get typeName(): string {
        return "Skybox";
    }

    public load(props: ISkyboxProperty, dimensions: IVector3Property | undefined, id: string, camera: Camera): void {
        if (this._mesh) {
            this._mesh.dispose(false, true);
            this._mesh = null;
        }

        this._camera = camera;
        this._scene = camera.getScene();

        let skyBox = null;
        if (dimensions) {
            skyBox = MeshBuilder.CreateBox(this.componentType,
                { width: dimensions.x, height: dimensions.y, depth: dimensions.z },
                this._scene);
        } else {
            skyBox = MeshBuilder.CreateBox(this.componentType,
                { size: SkyboxComponent.DefaultSkyBoxSize }, this._scene);
        }
        skyBox.infiniteDistance = true;
        skyBox.id = id;
        skyBox.isPickable = false;
        skyBox.isNearGrabbable = false;
        skyBox.isNearPickable = false;
        skyBox.renderingGroupId = 0; // Ensure it's rendered first

        // Attach the skybox directly to the scene, not to the camera
        skyBox.parent = null;

        this.mesh = skyBox;

        this.update(props);
    }

    public update(props: ISkyboxProperty): void {
        if (this._mesh && this._scene) {
            let material = this._mesh.material as StandardMaterial;

            if (!material) {
                material = new StandardMaterial(`${this._mesh.name}_${this._mesh.id}`, this._scene);
                material.backFaceCulling = false;
                material.disableLighting = true;
                this._mesh.material = material;
            }

            material.diffuseColor = EntityMapper.mapToColor3(props.color);
            material.specularColor = EntityMapper.mapToColor3(props.color);

            if (props.url && props.url !== material.reflectionTexture?.name) {
                material.reflectionTexture?.dispose();
                material.reflectionTexture = this._createReflectionTexture(props.url, this._scene);
            }
        }
    }

    private _createReflectionTexture(url: string, scene: Scene): BaseTexture {
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
