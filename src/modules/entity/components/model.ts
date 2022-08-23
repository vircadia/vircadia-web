//
//  model.ts
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
import { MeshComponent } from "@Modules/object";
import { Scene, SceneLoader, AbstractMesh } from "@babylonjs/core";
import { IModelEntity } from "../Entities";
import { EntityMapper } from "../package";
import { CollisionMask } from "../EntityProperties";
import Log from "@Modules/debugging/log";

/* eslint-disable new-cap */

export class ModelComponent extends MeshComponent {

    private _modelURL = "";

    public get componentType():string {
        return ModelComponent.typeName;
    }

    static get typeName(): string {
        return "Model";
    }

    public load(entity: IModelEntity) : void {
        if (!entity.modelURL || entity.modelURL === "" || this._modelURL === entity.modelURL
        || !this._gameObject) {
            return;
        }

        this._modelURL = entity.modelURL;

        Log.debug(Log.types.ENTITIES, `ModelComponent load model: ${entity.modelURL}`);

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        SceneLoader.ImportMeshAsync("", entity.modelURL, undefined, this._gameObject.getScene())
            .then((result) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const meshes = result.meshes;
                this.mesh = meshes[0];

                if (entity.visible !== undefined) {
                    this.visible = entity.visible;
                }

                this._updateCollisionProperties(meshes, entity);

            })
            // eslint-disable-next-line @typescript-eslint/dot-notation
            .catch((err) => {
                const error = err as Error;
                Log.error(Log.types.ENTITIES, `${error.message}`);

            });
    }

    public updateCollisionProperties(entity: IModelEntity):void {
        if (this._gameObject && this._mesh) {
            const meshes = this._mesh.getChildMeshes(false);
            this._updateCollisionProperties(meshes, entity);
        }
    }

    protected _updateCollisionProperties(meshes: AbstractMesh[], entity: IModelEntity):void {
        meshes.forEach((mesh) => {
            mesh.isPickable = false;
            mesh.checkCollisions = false;

            if (entity.collisionMask
                && entity.collisionMask & CollisionMask.MyAvatar) {

                // TODO:
                // fix collide rule
                if (mesh.name.includes("Collision")) {
                    if (mesh.name.includes("Floor")) {
                        mesh.isPickable = true;
                    } else {
                        mesh.checkCollisions = true;
                    }
                } else {
                    mesh.checkCollisions = true;
                }
            }
        });
    }

}
