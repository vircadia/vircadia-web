//
//  ScriptAvatarController.ts
//
//  Created by Nolan Huang on 8 July 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import type { Node, TransformNode } from "@babylonjs/core";
// General Modules
import Log from "@Modules/debugging/log";
import { AvatarMapper } from "../AvatarMapper";
// Domain Modules
import { ScriptAvatar, vec3, quat, SkeletonJoint } from "@vircadia/web-sdk";
import { ScriptComponent, inspectorAccessor } from "@Modules/script";

export class ScriptAvatarController extends ScriptComponent {
    // domain properties
    private _componentTypeName = "ScriptAvatarController";
    private _avatar: ScriptAvatar;
    private _skeletonNodes: Map<string, TransformNode> = new Map<string, TransformNode>();
    private _skeletonJointsCache = new Array<SkeletonJoint>();

    constructor(avatar: ScriptAvatar) {
        super("ScriptAvatarController");
        this._avatar = avatar;
    }

    @inspectorAccessor()
    public get skeletonModelURL(): string {
        return this._avatar.skeletonModelURL;
    }

    @inspectorAccessor()
    public get displayName(): string {
        return this._avatar.displayName;
    }

    @inspectorAccessor()
    public get sessionDisplayName(): string {
        return this._avatar.sessionDisplayName;
    }

    /**
    * Gets a string identifying the type of this Component
    * @returns "ScriptAvatarController" string
    */
    public get componentType(): string {
        return this._componentTypeName;
    }

    public onInitialize(): void {
        const rootNode = this._gameObject?.getChildren()[0];
        if (rootNode) {
            this._collectSkeletonNode(rootNode);
        }

        this._cacheJoints();

        this._syncDefaultPoseFromDomain();

        this._avatar.scaleChanged.connect(this._handleScaleChanged.bind(this));
        this._avatar.skeletonChanged.connect(() => {
            this._cacheJoints();
        });
    }

    public onUpdate(): void {
        if (this._gameObject) {
            // sync position
            this._gameObject.position = AvatarMapper.mapToLocalPosition(this._avatar.position);
            // sync orientation
            this._gameObject.rotationQuaternion = AvatarMapper.mapToLocalOrientation(this._avatar.orientation);

            this._syncPoseFromDomain();
        }
    }

    private _handleScaleChanged(): void {
        if (this._gameObject && this._gameObject.scaling && this._avatar) {
            this._gameObject.scaling = AvatarMapper.mapToLocalScaling(this._avatar.scale);
        }
    }

    private _collectSkeletonNode(node: Node): void {
        if (node.getClassName() === "TransformNode") {
            const transNode = node as TransformNode;
            this._skeletonNodes.set(node.name, transNode);
        }

        const children = node.getChildren();
        children.forEach((child) => {
            this._collectSkeletonNode(child);
        });
    }

    private _syncDefaultPoseFromDomain(): void {
        this._skeletonJointsCache.forEach((joint) => {
            const node = this._skeletonNodes.get(joint.jointName);
            if (node) {
                node.position = AvatarMapper.mapToLocalJointTranslation(joint.defaultTranslation);

                let rotation = AvatarMapper.mapToLocalJointRotation(joint.defaultRotation);
                if (this._isValidParentIndex(joint.parentIndex)) {
                    const parentQuat = AvatarMapper.mapToLocalJointRotation(
                        this._skeletonJointsCache[joint.parentIndex].defaultRotation);
                    rotation = parentQuat.invert().multiply(rotation);
                }
                node.rotationQuaternion = rotation;

                // FIXME:
                // joint.defaultScale does not work correctly
                // maybe absolute coordinate problem.
                // node.scaling = AvatarMapper.mapToNodeScaling(joint.defaultScale);
            }
        });
    }

    private _syncPoseFromDomain(): void {
        this._skeletonJointsCache.forEach((joint) => {
            const node = this._skeletonNodes.get(joint.jointName);
            if (node) {
                node.position = AvatarMapper.mapToLocalJointTranslation(this._getJointTranslation(joint.jointIndex));

                // covert absolute rotation to relative
                let rotation = AvatarMapper.mapToLocalJointRotation(this._getJointRotation(joint.jointIndex));
                if (this._isValidParentIndex(joint.parentIndex)) {
                    const parentRotation = AvatarMapper.mapToLocalJointRotation(this._getJointRotation(joint.parentIndex));
                    rotation = parentRotation.invert().multiply(rotation);
                }

                node.rotationQuaternion = rotation;
            }
        });
    }

    private _getJointTranslation(index: number): vec3 {
        const trans = this._avatar.jointTranslations[index];
        return trans ? trans : this._skeletonJointsCache[index].defaultTranslation;
    }

    private _getJointRotation(index: number): quat {
        const q = this._avatar.jointRotations[index];
        return q ? q : this._skeletonJointsCache[index].defaultRotation;
    }

    private _isValidParentIndex(index: number): boolean {
        return index >= 0 && index < this._skeletonJointsCache.length;
    }

    // NOTE:
    // Calls to this._avatar.skeleton hit performance.
    // Cache default joint values here.
    private _cacheJoints(): void {
        this._skeletonJointsCache = [];
        this._avatar.skeleton.forEach((joint) => {
            this._skeletonJointsCache.push(joint);
        });

        if (this._avatar.skeleton.length <= 0) {
            Log.error(Log.types.AVATAR, `skeleton of ${this._getGameObjectName()} is empty`);
        }
    }

    private _getGameObjectName(): string {
        return this._gameObject ? this._gameObject.name : "";
    }
}
