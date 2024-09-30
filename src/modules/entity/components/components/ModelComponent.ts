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

import { MeshComponent, DEFAULT_MESH_RENDER_GROUP_ID } from "@Modules/object";
import {
    SceneLoader,
    PhysicsImpostor,
    AbstractMesh,
    TransformNode,
    Node,
} from "@babylonjs/core";
import { IModelEntity } from "../../EntityInterfaces";
import { LabelEntity } from "@Modules/entity/entities";
import { updateContentLoadingProgress } from "@Modules/scene/LoadingScreen";
import { applicationStore } from "@Stores/index";
import Log from "@Modules/debugging/log";
import { LODManager } from "@Modules/scene/LODManager";
import { LightmapManager } from "@Modules/scene/LightmapManager";
import { LightManager } from "@Modules/scene/LightManager";
import { ScriptManager } from "@Modules/scene/ScriptManager";

const InteractiveModelTypes = [
    { name: "chair", condition: /^(?:animate_sitting|animate_seat)/iu },
    { name: "emoji_people", condition: /^animate_/iu },
];

export class ModelComponent extends MeshComponent {
    private _modelURL = "";

    public get componentType(): string {
        return ModelComponent.typeName;
    }

    static get typeName(): string {
        return "Model";
    }

    public load(entity: IModelEntity): void {
        if (
            !entity.modelURL ||
            entity.modelURL === "" ||
            this._modelURL === entity.modelURL ||
            !this._gameObject
        ) {
            return;
        }

        if (this._mesh) {
            this._mesh.dispose();
            this._mesh = null;
        }

        this._modelURL = entity.modelURL;

        const scene = this._gameObject.getScene();

        void SceneLoader.ImportMeshAsync(
            "",
            entity.modelURL,
            undefined,
            scene,
            (event) => {
                updateContentLoadingProgress(event, entity.name);
            }
        )
            .then((result) => {


                let meshes = result.meshes;
                // LOD Handling
                meshes = LODManager.setLODLevels(meshes);
                // Lightmap Handling
                if (scene) {
                    meshes = LightmapManager.applySceneLightmapsToMeshes(meshes, scene);
                }
                // Light Handling
                if (scene) {
                    LightManager.applyLightProperties(meshes, scene);
                }
                // Script Handling
                if (scene) {
                    ScriptManager.executeScriptsOnMeshes(meshes, scene);
                }

                this.mesh = meshes[0];
                this.renderGroupId = DEFAULT_MESH_RENDER_GROUP_ID;

                // Add a label to any of the model's children if they match any of the InteractiveModelTypes.
                const defaultLabelHeight = 0.6;
                const labelOffset = 0.25;
                const labelPopDistance =
                    applicationStore.interactions.interactionDistance;
                const childNodes = this.mesh.getChildren(
                    (node) => "getBoundingInfo" in node,
                    false
                ) as (AbstractMesh | TransformNode | Node)[];
                childNodes.forEach((childNode) => {
                    const genericModelType = InteractiveModelTypes.find(
                        (type) => type.condition.test(childNode.name)
                    );
                    if (
                        !genericModelType ||
                        !("getBoundingInfo" in childNode)
                    ) {
                        return;
                    }
                    const boundingInfo = childNode.getBoundingInfo();
                    const height =
                        boundingInfo.maximum.y - boundingInfo.minimum.y;
                    LabelEntity.create(
                        childNode,
                        height + labelOffset,
                        genericModelType.name,
                        true,
                        undefined,
                        labelPopDistance,
                        () => !applicationStore.interactions.isInteracting
                    );
                });
                result.transformNodes.forEach((childNode) => {
                    const genericModelType = InteractiveModelTypes.find(
                        (type) => type.condition.test(childNode.name)
                    );
                    if (!genericModelType) {
                        return;
                    }
                    LabelEntity.create(
                        childNode,
                        defaultLabelHeight,
                        genericModelType.name,
                        true,
                        undefined,
                        labelPopDistance,
                        () => !applicationStore.interactions.isInteracting
                    );
                });

                // Add a label to the model itself if it matches any of the InteractiveModelTypes.
                const genericModelType = InteractiveModelTypes.find((type) =>
                    type.condition.test(this.mesh?.name ?? "")
                );
                if (genericModelType) {
                    LabelEntity.create(
                        this.mesh,
                        defaultLabelHeight,
                        genericModelType.name,
                        true,
                        undefined,
                        labelPopDistance,
                        () => !applicationStore.interactions.isInteracting
                    );
                }

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
            .catch((error) => {
                Log.error(Log.types.ENTITIES, `${(error as Error).message}`);
            });
    }

    public updateAnimationProperties(entity: IModelEntity): void {
        if (this.animationGroups && this.animationGroups.length > 0) {
            const anim = this.animationGroups[0];
            // Stop all default animations.
            anim.stop();

            if (entity.animation && entity.animation.running) {
                anim.start(
                    entity.animation.loop,
                    1,
                    entity.animation.currentFrame
                );
            }
        }
    }

    public updateCollisionProperties(entity: IModelEntity): void {
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

    public updatePhysicsProperties(entity: IModelEntity): void {
        if (this._gameObject && this._gameObject.physicsImpostor) {
            if (entity.friction) {
                this._gameObject.physicsImpostor.friction = entity.friction;
            }
            if (entity.restitution) {
                this._gameObject.physicsImpostor.restitution =
                    entity.restitution;
            }
        }
    }

    protected _getMass(entity: IModelEntity): number {
        if (entity.dynamic && entity.dimensions && entity.density) {
            return (
                entity.density *
                entity.dimensions.x *
                entity.dimensions.y *
                entity.dimensions.z
            );
        }
        return 0;
    }

    protected _createColliders(entity: IModelEntity): void {
        if (!this._gameObject || !this._mesh) {
            return;
        }
        this._disposeColliders();

        if (entity.shapeType === "static-mesh") {
            this._gameObject.physicsImpostor = new PhysicsImpostor(
                this._gameObject,
                PhysicsImpostor.MeshImpostor,
                {
                    mass: this._getMass(entity),
                    restitution: entity.restitution,
                    friction: entity.friction,
                },
                this._gameObject.getScene()
            );
        }
    }

    protected _disposeColliders(): void {
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
