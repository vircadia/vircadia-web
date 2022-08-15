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

import {
    Node,
    TransformNode
} from "@babylonjs/core";
// General Modules
import Log from "@Modules/debugging/log";
import { AvatarMapper } from "./AvatarMapper";
// Domain Modules
import { ScriptAvatar, vec3, quat, SkeletonJoint } from "@vircadia/web-sdk";
import { ScriptComponent, inspectorAccessor } from "@Modules/script";

export class ScriptAvatarController extends ScriptComponent {
    // domain properties
    private _avatar : ScriptAvatar;
    private _skeletonNodes: Map<string, TransformNode> = new Map<string, TransformNode>();
    private _skeletonJointsCache = new Array<SkeletonJoint>();

    constructor(avatar:ScriptAvatar) {
        super("ScriptAvatarController");
        this._avatar = avatar;
    }

    @inspectorAccessor()
    public get skeletonModelURL() : string {
        return this._avatar.skeletonModelURL;
    }

    @inspectorAccessor()
    public get displayName() : string {
        return this._avatar.displayName;
    }

    @inspectorAccessor()
    public get sessionDisplayName() : string {
        return this._avatar.sessionDisplayName;
    }

    /**
    * Gets a string identifying the type of this Component
    * @returns "ScriptAvatarController" string
    */
    // eslint-disable-next-line class-methods-use-this
    public get componentType():string {
        return "ScriptAvatarController";
    }

    public onInitialize(): void {
        Log.debug(Log.types.AVATAR,
            `${this.name} onInitialize`);
        const rootNode = this._gameObject?.getChildren()[0];
        if (rootNode) {
            this._collectSkeletonNode(rootNode);
        }

        // NOTE:
        // call this._avatar.skeleton hits performance.
        // chace default joints value here.
        this._avatar.skeleton.forEach((joint) => {
            this._skeletonJointsCache.push(joint);
        });

        this._syncDefaultPoseFromDomain();

        this._avatar.scaleChanged.connect(this._handleScaleChanged.bind(this));
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function, class-methods-use-this
    public onUpdate():void {
        if (this._gameObject) {
            // sync postion
            this._gameObject.position = AvatarMapper.mapDomainPosition(this._avatar.position);
            // sync orientation
            this._gameObject.rotationQuaternion = AvatarMapper.mapDomainOrientation(this._avatar.orientation);

            this._syncPoseFromDomain();
        }
    }

    private _handleScaleChanged(): void {
        if (this._gameObject && this._gameObject.scaling && this._avatar) {
            this._gameObject.scaling = AvatarMapper.mapToNodeScaling(this._avatar.scale);
        }
    }

    private _collectSkeletonNode(node:Node) : void {
        if (node.getClassName() === "TransformNode") {
            const transNode = node as TransformNode;
            this._skeletonNodes.set(node.name, transNode);
        }

        const children = node.getChildren();
        children.forEach((child) => {
            this._collectSkeletonNode(child);
        });
    }

    private _syncDefaultPoseFromDomain() {
        // this._avatar.skeleton.forEach((joint) => {
        this._skeletonJointsCache.forEach((joint) => {
            const node = this._skeletonNodes.get(joint.jointName);
            if (node) {
                node.position = AvatarMapper.mapJointTranslation(joint.defaultTranslation);

                let rotation = AvatarMapper.mapJointRotation(joint.defaultRotation);
                if (this._isVaildParentIndex(joint.parentIndex)) {
                    const parentQuat = AvatarMapper.mapJointRotation(
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

    private _syncPoseFromDomain() {
        this._skeletonJointsCache.forEach((joint) => {
            const node = this._skeletonNodes.get(joint.jointName);
            if (node) {
                node.position = AvatarMapper.mapJointTranslation(this._getJointTranslation(joint.jointIndex));

                // covert absolute rotation to relative
                let rotation = AvatarMapper.mapJointRotation(this._getJointRotation(joint.jointIndex));

                if (this._isVaildParentIndex(joint.parentIndex)) {
                    const parentRotation = AvatarMapper.mapJointRotation(this._getJointRotation(joint.parentIndex));
                    rotation = parentRotation.invert().multiply(rotation);
                }
                node.rotationQuaternion = rotation;
            }
        });
    }

    private _getJointTranslation(index: number) : vec3 {
        const trans = this._avatar.jointTranslations[index];
        return trans ? trans : this._skeletonJointsCache[index].defaultTranslation;
    }

    private _getJointRotation(index: number) : quat {
        const q = this._avatar.jointRotations[index];
        return q ? q : this._skeletonJointsCache[index].defaultRotation;
    }

    private _isVaildParentIndex(index: number) : boolean {
        return index >= 0 && index < this._skeletonJointsCache.length;
    }
}
