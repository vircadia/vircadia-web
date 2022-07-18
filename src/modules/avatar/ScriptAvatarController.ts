//
//  RemoteAvatarController.ts
//
//  Created by Nolan Huang on 8 July 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

// This is disabled because TS complains about BABYLON's use of cap'ed function names
/* eslint-disable new-cap */

import {
    Node,
    AbstractMesh,
    Scene,
    Nullable,
    TransformNode
} from "@babylonjs/core";
// General Modules
import Log from "@Modules/debugging/log";
import { AvatarMapper } from "./AvatarMapper";
// Domain Modules
import { ScriptAvatar, SignalEmitter } from "@vircadia/web-sdk";

export class ScriptAvatarController {
    private _scene: Scene;
    private _avatarMesh: Nullable<AbstractMesh> = null;
    private _skeletonNodes: TransformNode[];
    // domain properties
    private _avatarDomain : ScriptAvatar;
    private _skeletonReady = false;
    public skeletonModelURLChanged :SignalEmitter;

    constructor(scene: Scene, domain :ScriptAvatar) {
        this._scene = scene;
        this._avatarDomain = domain;
        this._skeletonNodes = new Array<TransformNode>();
        this._avatarDomain.displayNameChanged.connect(this._handleDisplayNameChanged.bind(this));
        this._avatarDomain.sessionDisplayNameChanged.connect(this._handleSessionDisplayNameChanged.bind(this));
        this._avatarDomain.skeletonChanged.connect(this._handleSkeletonChanged.bind(this));
        this._avatarDomain.skeletonModelURLChanged.connect(this._handleSkeletonModelURLChanged.bind(this));
        this._avatarDomain.scaleChanged.connect(this._handleScaleChanged.bind(this));
        this.skeletonModelURLChanged = new SignalEmitter();
    }

    public get mesh(): Nullable<AbstractMesh> {
        return this._avatarMesh;
    }

    public set mesh(m:Nullable<AbstractMesh>) {
        Log.debug(Log.types.AVATAR,
            `Script avatar bind mesh`);
        if (m) {
            this._avatarMesh = m;
            const rootNode = this._avatarMesh.getChildTransformNodes()[0];
            this._collectSkeletonNode(rootNode);

            if (this._skeletonReady) {
                this._skeletonNodes.forEach((node, index) => {
                    const joint = this._avatarDomain.skeleton[index];
                    node.position = AvatarMapper.mapToNodePosition(joint.defaultTranslation);
                    node.rotationQuaternion = AvatarMapper.mapToNodeQuaternion(joint.defaultRotation);
                    node.scaling = AvatarMapper.mapToNodeScaling(joint.defaultScale);
                });
            }
        }
    }

    public get domain(): ScriptAvatar {
        return this._avatarDomain;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function, class-methods-use-this
    public update():void {
        if (this._avatarMesh && this._skeletonReady) {
            // sync postion
            this._avatarMesh.position = AvatarMapper.mapToNodePosition(this._avatarDomain.position);
            // sync orientation
            this._avatarMesh.rotationQuaternion = AvatarMapper.mapToNodeQuaternion(this._avatarDomain.orientation);
            // sync joints
            this._skeletonNodes.forEach((node, index) => {
                if (this._avatarDomain.jointTranslations[index]) {
                    node.position = AvatarMapper.mapToNodePosition(this._avatarDomain.jointTranslations[index]);
                }

                if (this._avatarDomain.jointRotations[index]) {
                    node.rotationQuaternion = AvatarMapper.mapToNodeQuaternion(this._avatarDomain.jointRotations[index]);
                }
            });
        }
    }

    private _handleDisplayNameChanged() {
        Log.debug(Log.types.AVATAR,
            `DisplayName Changed:${this._avatarDomain.displayName}`);
    }

    private _handleSessionDisplayNameChanged() {
        Log.debug(Log.types.AVATAR,
            `SessionDisplayName Changed:${this._avatarDomain.sessionDisplayName}`);
    }

    private _handleSkeletonChanged() {
        Log.debug(Log.types.AVATAR,
            `Script avatar Skeleton changed`);

        this._skeletonReady = true;
    }

    private _handleSkeletonModelURLChanged() {
        Log.debug(Log.types.AVATAR,
            `Script Avatar SkeletonModelURL Changed:${this._avatarDomain.skeletonModelURL}`);

        this._skeletonReady = false;
        this.skeletonModelURLChanged.emit(this);
    }

    private _handleScaleChanged(): void {
        Log.debug(Log.types.AVATAR,
            `Script Avatar Scale Changed.`);
        if (this._avatarMesh && this._avatarMesh.scaling) {
            this._avatarMesh.scaling = AvatarMapper.mapToNodeScaling(this._avatarDomain.scale);
        }
    }

    private _collectSkeletonNode(node:Node) : void {
        if (node.getClassName() !== "TransformNode") {
            return;
        }

        const transNode = node as TransformNode;
        this._skeletonNodes.push(transNode);

        const children = node.getChildren();
        children.forEach((child) => {
            this._collectSkeletonNode(child);
        });
    }
}
