//
//  AvatarController.ts
//
//  Created by Nolan Huang on 22 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import {
    TransformNode
} from "@babylonjs/core";

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable new-cap */
import { AvatarMapper, BoneType } from "./AvatarMapper";
import { ScriptComponent, inspectorAccessor } from "@Modules/script";

// Domain Modules
import { MyAvatarInterface, SkeletonJoint } from "@vircadia/web-sdk";
import Log from "@Modules/debugging/log";
import { JointNames } from "./joint";

export class MyAvatarController extends ScriptComponent {
    private _myAvatar : Nullable<MyAvatarInterface> = null;
    private _skeletonNodes: Map<string, TransformNode> = new Map<string, TransformNode>();
    private _modelURL : string | undefined;

    constructor() {
        super("MyAvatarController");
    }

    @inspectorAccessor()
    public get skeletonModelURL() : string | undefined {
        return this._modelURL;
    }

    public set skeletonModelURL(value:string | undefined) {
        this._modelURL = value;
        if (this._myAvatar && value) {
            this._myAvatar.skeletonModelURL = value;
        }
    }

    public set myAvatar(avatar : Nullable<MyAvatarInterface>) {
        this._myAvatar = avatar;
        if (!this._gameObject || !this._myAvatar) {
            return;
        }

        if (this._modelURL) {
            this._myAvatar.skeletonModelURL = this._modelURL;
        }

        this._myAvatar.scale = AvatarMapper.mapToDomainScale(this._gameObject.scaling);

        this._collectJoints();
    }

    public get myAvatar() : Nullable<MyAvatarInterface> {
        return this._myAvatar;
    }

    @inspectorAccessor()
    public get displayName() : string {
        return this._myAvatar ? this._myAvatar.displayName : "";
    }

    public set displayName(value:string) {
        if (this._myAvatar) {
            this._myAvatar.displayName = value;
        }
    }

    @inspectorAccessor()
    public get sessionDisplayName() : string {
        return this._myAvatar ? this._myAvatar.sessionDisplayName : "";
    }

    /**
    * Gets a string identifying the type of this Component
    * @returns "MyAvatarController" string
    */
    // eslint-disable-next-line class-methods-use-this
    public get componentType():string {
        return MyAvatarController.typeName;
    }

    static get typeName(): string {
        return "MyAvatarController";
    }

    public onUpdate():void {
        if (this._gameObject && this._myAvatar) {
            // sync position
            this._myAvatar.position = AvatarMapper.mapToDomainPosition(this._gameObject.position);
            // sync orientation
            this._myAvatar.orientation = AvatarMapper.mapToDomainOrientation(this._gameObject.rotationQuaternion);

            this._syncPoseToDomain();
        }
    }

    private _collectJoints() {
        if (!this._myAvatar) {
            return;
        }

        const skeleton = new Array<SkeletonJoint>();

        const nodes = this._gameObject?.getChildren((node) => node.getClassName() === "TransformNode", false);
        nodes?.forEach((node) => {
            this._skeletonNodes.set(node.name, node as TransformNode);
        });

        JointNames.forEach((jointName, index) => {
            const node = this._skeletonNodes.get(jointName);
            if (node) {
                const parentIndex = node.parent ? JointNames.findIndex((value) => value === node.parent?.name) : -1;
                let rotation = node.rotationQuaternion;
                if (parentIndex > 0 && parentIndex < skeleton.length && rotation) {
                    const parentRotation = AvatarMapper.mapJointRotation(skeleton[parentIndex].defaultRotation);
                    rotation = parentRotation.multiply(rotation);
                }

                let boneType = BoneType.SkeletonChild;
                if (index === 0) {
                    boneType = BoneType.NonSkeletonRoot;
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                } else if (index >= 2 && index <= 10) {
                    boneType = BoneType.NonSkeletonChild;
                }

                const joint = {
                    jointName: node.name,
                    jointIndex: index,
                    parentIndex,
                    boneType,
                    defaultTranslation: AvatarMapper.mapToJointTranslation(node.position),
                    defaultRotation: AvatarMapper.mapToJointRotation(rotation),
                    defaultScale: AvatarMapper.mapToDomainScale(node.scaling)
                };

                skeleton.push(joint);
            }
        });

        this._myAvatar.skeleton = skeleton;
    }

    private _syncPoseToDomain() {
        if (!this._gameObject || !this._myAvatar) {
            return;
        }

        this._myAvatar.skeleton.forEach((joint) => {
            if (!this._myAvatar) {
                return;
            }
            const node = this._skeletonNodes.get(joint.jointName);

            if (node) {
                this._myAvatar.jointTranslations[joint.jointIndex]
                   = AvatarMapper.mapToJointTranslation(node.position);

                let rotation = node.rotationQuaternion;
                if (rotation) {
                    if (joint.parentIndex >= 0) {
                        const q = this._myAvatar.jointRotations[joint.parentIndex];
                        if (q) {
                            const parentRotation = AvatarMapper.mapJointRotation(q);
                            rotation = parentRotation.multiply(rotation);
                        }
                    }

                    this._myAvatar.jointRotations[joint.jointIndex] = AvatarMapper.mapToJointRotation(rotation);
                }
            }
        });
    }
}
