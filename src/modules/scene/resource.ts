//
//  loader.ts
//
//  Created by Nolan Huang on 7 July 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { AnimationGroup, Scene, SceneLoader, AssetsManager,
    AbstractMesh, Vector3, Quaternion } from "@babylonjs/core";
// System Modules
import { v4 as uuidv4 } from "uuid";
// General Modules
import Log from "@Modules/debugging/log";

interface IAvatarAnimationResult {
    mesh : AbstractMesh;
    animGroups : AnimationGroup[]
}

interface IResourceUrl {
    rootUrl : string;
    filename : string;
}

// This is disabled because TS complains about BABYLON's use of cap'ed function names
/* eslint-disable new-cap */

export class ResourceManager {
    _scene: Scene;
    _assetsManager : AssetsManager;

    constructor(secne: Scene) {
        this._scene = secne;
        this._assetsManager = new AssetsManager(this._scene);
    }

    public static splitUrl(url: string): IResourceUrl {
        const index = url.lastIndexOf("/") + 1;
        const rootUrl = url.substring(0, index);
        const filename = url.substring(index, url.length);
        return { rootUrl, filename };
    }

    public async loadMyAvatar(modelUrl: string): Promise<AbstractMesh> {
        return this._loadAvatar(modelUrl);
    }

    public async loadAvatar(modelUrl: string): Promise<AbstractMesh> {
        const avatar = await this._loadAvatar(modelUrl);
        return avatar;
    }


    public async loadAvatarAnimations(modelUrl: string): Promise<IAvatarAnimationResult> {
        Log.info(Log.types.AVATAR,
            `Load avatar animation url:${modelUrl}`);

        const url = ResourceManager.splitUrl(modelUrl);
        const result = await SceneLoader.ImportMeshAsync("", url.rootUrl, url.filename, this._scene);

        const mesh = result.meshes[0].getChildren()[0] as AbstractMesh;
        const animationGroups = new Array<AnimationGroup>();

        result.animationGroups.forEach((sourceAnimGroup) => {
            const animGroup = new AnimationGroup(sourceAnimGroup.name);
            // trim unnecessary animation data
            sourceAnimGroup.targetedAnimations.forEach((targetAnim) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                if (targetAnim.target.name === "Hips") {
                    // recaculate the postion and roatation quaternion animation key of Hip
                    if (targetAnim.animation.targetProperty === "position") {
                        const anim = targetAnim.animation.clone();
                        const keys = anim.getKeys();
                        keys.forEach((keyFrame) => {
                            // apply the roation and scale of Armatue node
                            let pos = keyFrame.value as Vector3;
                            pos = pos.applyRotationQuaternion(mesh.rotationQuaternion as Quaternion);
                            keyFrame.value = pos.multiply(mesh.scaling);
                        });
                        animGroup.addTargetedAnimation(anim, targetAnim.target);

                    } else if (targetAnim.animation.targetProperty === "rotationQuaternion") {
                        const anim = targetAnim.animation.clone();
                        const keys = anim.getKeys();
                        keys.forEach((keyFrame) => {
                            // apply the roation Armatue node
                            const rot = keyFrame.value as Quaternion;
                            if (mesh.rotationQuaternion) {
                                keyFrame.value = mesh.rotationQuaternion.multiply(rot);
                            }
                        });
                        animGroup.addTargetedAnimation(targetAnim.animation, targetAnim.target);
                    }
                } else if (targetAnim.animation.targetProperty === "rotationQuaternion") {
                // keep rotationQuaternion animation of all other nodes
                    animGroup.addTargetedAnimation(targetAnim.animation, targetAnim.target);
                }
            });

            // remove from scene to prevent animation group is disposed when dispose scene
            this._scene.removeAnimationGroup(animGroup);

            animationGroups.push(animGroup);

            sourceAnimGroup.dispose();
        });

        mesh.parent?.dispose();

        return { mesh, animGroups: animationGroups };
    }

    public addSceneObjectTasks(taskName:string, rootUrl:string, meshList:string[]): void {
        meshList.forEach((filename) => {
            const task = this._assetsManager.addMeshTask(taskName, "", rootUrl, filename);
            task.onSuccess = (meshAssetTask) => {
                meshAssetTask.loadedMeshes.forEach(this._processSceneMesh.bind(this));

                Log.info(Log.types.ENTITIES,
                    `load scene object: ${rootUrl}${filename}`);
            };

            task.onError = () => {
                Log.error(Log.types.ENTITIES, `fail to load scene object: ${rootUrl}${filename}`);
            };
        });
    }

    public loadAsync(): Promise<void> {
        return this._assetsManager.loadAsync();
    }

    private async _loadAvatar(modelUrl: string): Promise<AbstractMesh> {
        const url = ResourceManager.splitUrl(modelUrl);
        const result = await SceneLoader.ImportMeshAsync("", url.rootUrl, url.filename, this._scene);
        result.meshes.forEach((mesh) => {
            mesh.isPickable = false;
        });

        const avatar = result.meshes[0];
        avatar.id = uuidv4();
        avatar.scaling = new Vector3(1, 1, 1);
        avatar.checkCollisions = true;

        Log.info(Log.types.AVATAR,
            `Load avatar mesh url:${modelUrl} id::${avatar.id}`);

        return avatar;
    }

    // eslint-disable-next-line class-methods-use-this
    private _processSceneMesh(mesh : AbstractMesh) : void {
        mesh.id = uuidv4();
        ResourceManager._applySceneMeshRule(mesh);
    }

    private static _applySceneMeshRule(mesh : AbstractMesh) : void {
        mesh.isPickable = false;
        mesh.checkCollisions = false;

        if (mesh.name.includes("Collision")) {
            if (mesh.name.includes("Floor")) {
                mesh.isPickable = true;
            } else {
                mesh.checkCollisions = true;
            }
            mesh.isVisible = false;
        }
    }
}
