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
    Node,
    TransformNode
} from "@babylonjs/core";

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable new-cap */
import { AvatarMapper, BoneType } from "./AvatarMapper";
import { ScriptComponent, inspectorAccessor } from "@Modules/script";

// Domain Modules
import { MyAvatarInterface, SkeletonJoint } from "@vircadia/web-sdk";
import Log from "@Modules/debugging/log";

export class MyAvatarController extends ScriptComponent {
    private _myAvatar : Nullable<MyAvatarInterface> = null;
    private _skeletonNodes: Map<string, TransformNode> = new Map<string, TransformNode>();

    constructor() {
        super("MyAvatarController");
    }

    @inspectorAccessor()
    public get skeletonModelURL() : string {
        return this._myAvatar ? this._myAvatar.skeletonModelURL : "";
    }

    public set skeletonModelURL(value:string) {
        if (this._myAvatar) {
            this._myAvatar.skeletonModelURL = value;
        }
    }

    public set myAvatar(avatar : MyAvatarInterface | null) {
        this._myAvatar = avatar;

        if (!this._gameObject || !this._myAvatar) {
            return;
        }

        this._myAvatar.scale = AvatarMapper.mapToDomainScale(this._gameObject.scaling);

        const rootNode = this._gameObject.getChildren()[0];
        const skeleton = new Array<SkeletonJoint>();
        this._collectJointData(rootNode, -1, skeleton);

        skeleton.forEach((joint) => {
            if (joint.parentIndex >= 0 && joint.parentIndex < skeleton.length) {
                const node = this._skeletonNodes.get(joint.jointName) as TransformNode;
                if (node.rotationQuaternion) {
                    const parentRotation = AvatarMapper.mapJointRotation(skeleton[joint.parentIndex].defaultRotation);
                    joint.defaultRotation = AvatarMapper.mapToJointRotation(parentRotation.multiply(node.rotationQuaternion));
                }
            }
        });


        console.log(Log.types.AVATAR, "MyAvatar", skeleton);

        this._myAvatar.skeleton = skeleton;
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

    private _collectJointData(node:Node, parentIndex: number, joints: SkeletonJoint[]) : void {
        let jointIndex = parentIndex;
        if (node.getClassName() === "TransformNode") {
            const transNode = node as TransformNode;
            this._skeletonNodes.set(node.name, transNode);

            jointIndex = joints.length;
            const joint = {
                jointName: node.name,
                jointIndex,
                parentIndex,
                boneType: BoneType.SkeletonChild,
                defaultTranslation: AvatarMapper.mapToJointTranslation(transNode.position),
                defaultRotation: AvatarMapper.mapToJointRotation(transNode.rotationQuaternion),
                defaultScale: AvatarMapper.mapToDomainScale(transNode.scaling)
            };

            joints.push(joint);
        }

        const children = node.getChildren();
        children.forEach((child) => {
            this._collectJointData(child, jointIndex, joints);
        });
    }

    private _syncPoseToDomain() {
        if (!this._gameObject || !this._myAvatar) {
            return;
        }

        for (let i = 0; i < this._myAvatar.skeleton.length; i++) {
            const joint = this._myAvatar.skeleton[i];
            const node = this._skeletonNodes.get(joint.jointName);
            if (node) {
                this._myAvatar.jointTranslations[joint.jointIndex]
                   = AvatarMapper.mapToJointTranslation(node.position);

                let rotation = node.rotationQuaternion;
                if (rotation) {
                    if (joint.parentIndex >= 0 && joint.parentIndex < this._myAvatar.skeleton.length) {
                        const q = this._myAvatar.jointRotations[joint.parentIndex];
                        if (q) {
                            const parentRotation = AvatarMapper.mapJointRotation(q);
                            rotation = parentRotation.multiply(rotation);
                        }

                    }

                    this._myAvatar.jointRotations[joint.jointIndex] = AvatarMapper.mapToJointRotation(rotation);
                }
            }
        }
    }
}
