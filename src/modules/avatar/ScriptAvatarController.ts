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
import { ScriptAvatar } from "@vircadia/web-sdk";
import { ScriptComponent, inspectorAccessor } from "@Modules/script";

export class ScriptAvatarController extends ScriptComponent {
    // domain properties
    private _avatar : ScriptAvatar;
    private _skeletonNodes: Map<string, TransformNode> = new Map<string, TransformNode>();

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

        this._avatar.skeleton.forEach((joint) => {
            const node = this._skeletonNodes.get(joint.jointName);
            if (node) {
                node.position = AvatarMapper.mapToNodePosition(joint.defaultTranslation);
                node.rotationQuaternion = AvatarMapper.mapToNodeQuaternion(joint.defaultRotation);
                node.scaling = AvatarMapper.mapToNodeScaling(joint.defaultScale);
            }
        });

        this._syncFromJointData();

        this._avatar.scaleChanged.connect(this._handleScaleChanged.bind(this));
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function, class-methods-use-this
    public onUpdate():void {
        if (this._gameObject) {
            // sync postion
            this._gameObject.position = AvatarMapper.mapToNodePosition(this._avatar.position);
            // sync orientation
            this._gameObject.rotationQuaternion = AvatarMapper.mapToNodeQuaternion(this._avatar.orientation);
            // sync joints
            this._syncFromJointData();
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

    private _syncFromJointData() {
        this._avatar.skeleton.forEach((joint, index) => {
            const node = this._skeletonNodes.get(joint.jointName);
            if (node) {
                const translation = this._avatar.jointTranslations[index];
                if (translation) {
                    node.position = AvatarMapper.mapToNodePosition(translation);
                }

                const rotation = this._avatar.jointRotations[index];
                if (rotation) {
                    node.rotationQuaternion = AvatarMapper.mapToNodeQuaternion(rotation);
                }
            }
        });
    }
}
