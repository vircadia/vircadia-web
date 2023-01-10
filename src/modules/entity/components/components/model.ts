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
import { MeshComponent, DEFAULT_MESH_RENDER_GROUP_ID } from "@Modules/object";
import { SceneLoader, PhysicsImpostor } from "@babylonjs/core";
import { IModelEntity } from "../../EntityInterfaces";
import { ShapeType } from "../../EntityProperties";
import { updateContentLoadingProgress } from "@Modules/scene/LoadingScreen";
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

        if (this._mesh) {
            this._mesh.dispose();
            this._mesh = null;
        }

        this._modelURL = entity.modelURL;

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        SceneLoader.ImportMeshAsync(
            "",
            entity.modelURL,
            undefined,
            this._gameObject.getScene(),
            (event) => {
                updateContentLoadingProgress(event, entity.name);
            }
        )
            .then((result) => {
                const meshes = result.meshes;
                this.mesh = meshes[0];
                this.renderGroupId = DEFAULT_MESH_RENDER_GROUP_ID;

                if (entity.animation && result.animationGroups) {
                    this.animationGroups = result.animationGroups;
                    this.updateAnimationProperties(entity);
                }

                if (entity.visible !== undefined) {
                    this.visible = entity.visible;
                }

                this.updateCollisionProperties(entity);
                this.updatePhysicsProperties(entity);
            })
            // eslint-disable-next-line @typescript-eslint/dot-notation
            .catch((err) => {
                const error = err as Error;
                Log.error(Log.types.ENTITIES, `${error.message}`);

            });
    }

    public updateAnimationProperties(entity: IModelEntity):void {
        if (this._animationGroups && this._animationGroups.length > 0) {
            const anim = this._animationGroups[0];
            // stop all defaul animations
            anim.stop();

            if (entity.animation && entity.animation.running) {
                anim.start(entity.animation.loop, 1, entity.animation.currentFrame);
            }
        }
    }

    public updateCollisionProperties(entity: IModelEntity):void {
        if (this._gameObject && this._mesh) {
            if (entity.collisionless) {
                this._disposeColliders();
                this.pickable = false;
                this.checkCollisions = false;
            } else if (entity.collisionMask && entity.shapeType) {
                if (!this._gameObject.physicsImpostor) {
                    this._createColliders(entity);
                    this.pickable = true;
                    this.checkCollisions = true;
                }
            }
        }
    }

    public updatePhysicsProperties(entity: IModelEntity):void {
        if (this._gameObject && this._gameObject.physicsImpostor) {
            if (entity.friction) {
                this._gameObject.physicsImpostor.friction = entity.friction;
            }
            if (entity.restitution) {
                this._gameObject.physicsImpostor.restitution = entity.restitution;
            }
        }
    }

    protected _getMass(entity: IModelEntity) : number {
        if (entity.dynamic && entity.dimensions && entity.density) {
            return entity.density * entity.dimensions.x * entity.dimensions.y * entity.dimensions.z;
        }
        return 0;
    }

    protected _createColliders(entity: IModelEntity) : void {
        if (!this._gameObject || !this._mesh) {
            return;
        }
        this._disposeColliders();

        const scene = this._gameObject.getScene();
        if (entity.shapeType === "static-mesh") {
            this._gameObject.physicsImpostor = new PhysicsImpostor(
                this._gameObject, PhysicsImpostor.MeshImpostor,
                { mass: this._getMass(entity),
                    restitution: entity.restitution,
                    friction: entity.friction },
                this._gameObject.getScene());
        }
    }

    protected _disposeColliders() : void {
        if (this._mesh && this._mesh.physicsImpostor) {
            this._mesh.physicsImpostor.dispose();
            this._mesh.physicsImpostor = null;

            this._mesh.getChildMeshes().forEach((m) => {
                if (m.physicsImpostor) {
                    m.physicsImpostor.dispose();
                }
            });
        }

        if (this._gameObject && this._gameObject.physicsImpostor) {
            this._gameObject.physicsImpostor.dispose();
            this._gameObject.physicsImpostor = null;
        }
    }
}
