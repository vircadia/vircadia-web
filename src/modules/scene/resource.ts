//
//  resource.ts
//
//  Created by Nolan Huang on 7 July 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

// This is disabled because TS complains about BABYLON's use of capitalized function names.
/* eslint-disable new-cap */

import { AnimationGroup, Scene, SceneLoader, AssetsManager,
    AbstractMesh, Vector3, Quaternion, MeshBuilder, StandardMaterial, Color3, Skeleton } from "@babylonjs/core";
import { DEFAULT_MESH_RENDER_GROUP_ID } from "@Modules/object";
import { updateContentLoadingProgress } from "@Modules/scene/LoadingScreen";
import { Uuid } from "@vircadia/web-sdk";
import Log from "@Modules/debugging/log";

interface IAvatarResult {
    mesh: AbstractMesh,
    skeleton: Skeleton | null
}

interface IAvatarAnimationResult {
    mesh: AbstractMesh;
    animGroups: AnimationGroup[]
}

interface IResourceUrl {
    rootUrl: string;
    filename: string;
}

export class ResourceManager {
    _scene: Scene;
    _assetsManager: AssetsManager;

    constructor(scene: Scene) {
        this._scene = scene;
        this._assetsManager = new AssetsManager(this._scene);
    }

    public static splitUrl(url: string): IResourceUrl {
        const index = url.lastIndexOf("/") + 1;
        const rootUrl = url.substring(0, index);
        const filename = url.substring(index, url.length);
        return { rootUrl, filename };
    }

    public async loadMyAvatar(modelUrl: string): Promise<IAvatarResult> {
        return this._loadAvatar(modelUrl);
    }

    public async loadAvatar(modelUrl: string): Promise<IAvatarResult> {
        const avatar = await this._loadAvatar(modelUrl);
        return avatar;
    }


    public async loadAvatarAnimations(modelUrl: string, hipPosition?: Vector3): Promise<IAvatarAnimationResult> {
        const modelAssetName = modelUrl.split("/");
        const result = await SceneLoader.ImportMeshAsync(
            "",
            modelUrl,
            undefined,
            this._scene,
            (event) => {
                updateContentLoadingProgress(event, modelAssetName[modelAssetName.length - 1]);
            }
        );

        const mesh = result.meshes[0].getChildren()[0] as AbstractMesh;
        const animationGroups = new Array<AnimationGroup>();
        let animationInitialHipPosition = Vector3.Zero();

        result.animationGroups.forEach((sourceAnimGroup) => {
            const animGroup = new AnimationGroup(sourceAnimGroup.name);
            // Trim unnecessary animation data.
            sourceAnimGroup.targetedAnimations.forEach((targetAnim) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                if (targetAnim.target?.name === "Hips") {
                    // Recalculate the position and rotation of the Hip animation key.
                    if (targetAnim.animation.targetProperty === "position") {
                        const anim = targetAnim.animation.clone();
                        const keys = anim.getKeys();
                        keys.forEach((keyFrame, index) => {
                            // Apply the rotation and scale of the Armature node.
                            let pos = keyFrame.value as Vector3;
                            pos = pos.applyRotationQuaternion(mesh.rotationQuaternion as Quaternion);
                            pos = pos.multiply(mesh.scaling);
                            // Account for a difference in the hip positions of the avatar and animation model.
                            let offset = 0;
                            if (index === 0) {
                                animationInitialHipPosition = pos.clone();
                            }
                            // Don't apply the offset if the hipPosition is undefined,
                            // or if the target animation is a sitting animation.
                            if (
                                hipPosition
                                && !targetAnim.animation.name.includes("sitting")
                            ) {
                                offset = animationInitialHipPosition.y - hipPosition.y;
                            }
                            pos.y = pos.y - offset;
                            keyFrame.value = pos;
                        });
                        animGroup.addTargetedAnimation(anim, targetAnim.target);

                    } else if (targetAnim.animation.targetProperty === "rotationQuaternion") {
                        const anim = targetAnim.animation.clone();
                        const keys = anim.getKeys();
                        keys.forEach((keyFrame) => {
                            // Apply the rotation of the Armature node.
                            const rot = keyFrame.value as Quaternion;
                            if (mesh.rotationQuaternion) {
                                keyFrame.value = mesh.rotationQuaternion.multiply(rot);
                            }
                        });
                        animGroup.addTargetedAnimation(targetAnim.animation, targetAnim.target);
                    }
                } else if (targetAnim.animation.targetProperty === "rotationQuaternion") {
                    // Keep the original position and rotation of all other nodes.
                    animGroup.addTargetedAnimation(targetAnim.animation, targetAnim.target);
                }
            });

            // Remove from the scene to prevent the animation group from being disposed when the scene is disposed.
            this._scene.removeAnimationGroup(animGroup);

            animationGroups.push(animGroup);

            sourceAnimGroup.dispose();
        });

        mesh.parent?.dispose();

        return { mesh, animGroups: animationGroups };
    }

    public loadAsync(): Promise<void> {
        return this._assetsManager.loadAsync();
    }

    private async _loadAvatar(modelUrl: string): Promise<IAvatarResult> {
        try {
            const modelAssetName = modelUrl.split("/");
            const result = await SceneLoader.ImportMeshAsync(
                "",
                modelUrl,
                undefined,
                this._scene,
                (event) => {
                    updateContentLoadingProgress(event, modelAssetName[modelAssetName.length - 1]);
                }
            );

            result.meshes.forEach((mesh) => {
                mesh.isPickable = false;
                mesh.renderingGroupId = DEFAULT_MESH_RENDER_GROUP_ID;
                mesh.checkCollisions = false;
            });

            const mesh = result.meshes[0];
            mesh.id = new Uuid().stringify();
            // For matching the orientation of vircadia
            mesh.rotationQuaternion = Quaternion.FromEulerAngles(0, Math.PI, 0);

            const skeleton = result.skeletons.length > 0 ? result.skeletons[0] : null;

            return {
                mesh,
                skeleton
            };

        } catch (error) {
            Log.error(Log.types.AVATAR, `${(error as Error).message}`);
            return {
                mesh: this._createDummyMesh(),
                skeleton: null
            };
        }
    }

    private _createDummyMesh(): AbstractMesh {
        const mesh = MeshBuilder.CreateSphere("DummyMesh");
        mesh.isPickable = false;

        let material = this._scene.getMaterialByName("DummyMaterial");
        if (!material) {
            const mat = new StandardMaterial("DummyMaterial");
            mat.ambientColor = Color3.Red();
            mat.diffuseColor = Color3.Red();
            mat.specularColor = Color3.Red();
            material = mat;
        }

        mesh.material = material;
        return mesh;
    }
}
