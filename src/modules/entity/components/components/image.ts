//
//  image.ts
//
//  Created by Nolan Huang on 22 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */
import { MeshComponent, DEFAULT_MESH_RENDER_GROUP_ID } from "@Modules/object";
import { MeshBuilder, Mesh, Texture,
    VideoTexture, StandardMaterial, Color3 } from "@babylonjs/core";
import { IImageEntity } from "../../EntityInterfaces";
import Log from "@Modules/debugging/log";
import { EntityMapper } from "../../package";
import { AssetUrl } from "../../builders/asset";

/* eslint-disable new-cap */

export class ImageComponent extends MeshComponent {

    public get componentType():string {
        return ImageComponent.typeName;
    }

    static get typeName(): string {
        return "Image";
    }

    public load(entity: IImageEntity) : void {
        if (!this._mesh) {
            this.mesh = MeshBuilder.CreatePlane("plane", { sideOrientation: Mesh.DOUBLESIDE });
            this.renderGroupId = DEFAULT_MESH_RENDER_GROUP_ID;
        }

        this.updateImageURL(entity);

        this.updateColor(entity);

        this.updateDimensions(entity);
    }

    public updateDimensions(entity: IImageEntity) : void {
        if (this._mesh && entity.dimensions) {
            const sclae = EntityMapper.mapToVector3(entity.dimensions);
            // FIXME:
            // Cannot get texture size here. Fix this and implement keepAspectRatio.
            /*
            if (entity.keepAspectRatio && this._mesh.material) {
                const mat = this._mesh.material as StandardMaterial;
                const texture = mat.diffuseTexture;
                if (texture) {
                    const size = texture.getSize();
                    if (size.width > size.height) {
                        sclae.x = sclae.y * size.width / size.height;
                    } else {
                        sclae.y = sclae.x * size.height / size.width;
                    }
                }
            }
*/
            this._mesh.scaling = sclae;
        }
    }

    public updateColor(entity: IImageEntity) : void {
        if (this._mesh && this._mesh.material) {
            const mat = this._mesh.material as StandardMaterial;
            if (entity.color) {
                const color = EntityMapper.mapToColor3(entity.color);
                mat.diffuseColor = color;
                mat.specularColor = color;
            }
            // NOTE:
            // To make the image does not effect by glow processing,
            // replace emissiveColor color with emissiveTexture.
            /*
            if (entity.emissive) {
                mat.emissiveColor = EntityMapper.mapToColor3(entity.color);
            } else {
                mat.emissiveColor = Color3.Black();
            }
*/
            if (entity.alpha) {
                mat.alpha = entity.alpha;
            }
        }
    }

    public updateImageURL(entity: IImageEntity) : void {
        if (!this._mesh) {
            return;
        }

        if (entity.imageURL && entity.imageURL.length > 0) {
            if (this._mesh.material) {
                this._mesh.material.dispose();
            }

            const assetURL = new AssetUrl(entity.imageURL);

            const name = entity.name ? entity.name + "_" + entity.id : entity.id;
            const mat = new StandardMaterial(name);
            let texture = null;

            if (assetURL.fileExtension === "mp4"
                || assetURL.fileExtension === "webm"
                || assetURL.fileExtension === "ogv") {

                const scene = this._gameObject ? this._gameObject._scene : null;
                texture = new VideoTexture(name, entity.imageURL, scene);
            } else {
                texture = new Texture(entity.imageURL);
            }

            mat.diffuseTexture = texture;
            if (entity.emissive) {
                mat.emissiveTexture = texture;
            }

            if (mat.diffuseTexture !== null && assetURL.fileExtension === "png") {
                mat.diffuseTexture.hasAlpha = true;
                mat.useAlphaFromDiffuseTexture = true;
            }

            this._mesh.material = mat;
            this._mesh.isVisible = entity.visible ?? true;

        } else {
            this._mesh.isVisible = false;
        }
    }
}
