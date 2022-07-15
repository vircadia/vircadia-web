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
    Vector3,
    AbstractMesh,
    Scene,
    TransformNode,
    Quaternion,
    Nullable
} from "@babylonjs/core";
// General Modules
import Log from "@Modules/debugging/log";
// Domain Modules
import { ScriptAvatar, vec3, quat, SignalEmitter } from "@vircadia/web-sdk";

export class RemoteAvatarController {
    private _scene: Scene;
    private _avatarMesh: Nullable<AbstractMesh> = null;
    // domain properties
    private _avatarDomain : ScriptAvatar;
    private _prePos: vec3;
    private _preQuat : quat;
    public skeletonModelURLChanged :SignalEmitter;

    constructor(scene: Scene, domain :ScriptAvatar) {
        this._scene = scene;
        this._avatarDomain = domain;
        this._update = this._update.bind(this);

        this._avatarDomain.displayNameChanged.connect(this._handleDisplayNameChanged.bind(this));
        this._avatarDomain.sessionDisplayNameChanged.connect(this._handleSessionDisplayNameChanged.bind(this));
        this._avatarDomain.skeletonModelURLChanged.connect(this._handleSkeletonModelURLChanged.bind(this));
        this.skeletonModelURLChanged = new SignalEmitter();

        this._prePos = this._avatarDomain.position;
        this._updatePosition();
        this._preQuat = this._avatarDomain.orientation;
        this._updateOrientation();
    }

    public get mesh(): Nullable<AbstractMesh> {
        return this._avatarMesh;
    }

    public set mesh(m:Nullable<AbstractMesh>) {
        this._avatarMesh = m;
    }

    public get domain(): ScriptAvatar {
        return this._avatarDomain;
    }

    public start():void {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        this._scene.registerBeforeRender(this._update);
    }

    public stop():void {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        this._scene.unregisterBeforeRender(this._update);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function, class-methods-use-this
    private _update():void {

        this._updatePosition();

        this._updateOrientation();
        /*
        const pos = this._avatarDomain.position;
        if (this._prePos.x !== pos.x || this._prePos.y !== pos.y || this._prePos.z !== pos.z) {
            this._updatePosition();
            this._prePos = pos;
        }

        const q = this._avatarDomain.orientation;
        if (this._preQuat.x !== q.x || this._preQuat.y !== q.y
            || this._preQuat.z !== q.z || this._preQuat.w !== q.w) {
            Log.debug(Log.types.AVATAR,
                `Quat:${q.x}, ${q.y}, ${q.z}, ${q.w}`);
            this._updateOrientation();
            this._preQuat = q;
        } */

        // this._animController.play("idle02");

        // this._animController.update();
    }

    private _handleDisplayNameChanged() {
        Log.debug(Log.types.AVATAR,
            `DisplayName Changed:${this._avatarDomain.displayName}`);
    }

    private _handleSessionDisplayNameChanged() {
        Log.debug(Log.types.AVATAR,
            `SessionDisplayName Changed:${this._avatarDomain.sessionDisplayName}`);
    }

    private _handleSkeletonModelURLChanged() {
        Log.debug(Log.types.AVATAR,
            `SkeletonModelURL Changed:${this._avatarDomain.skeletonModelURL}`);

        this.skeletonModelURLChanged.emit(this);
    }

    private _updatePosition() : void {
        if (this._avatarMesh) {
            const pos = this._avatarDomain.position;
            this._avatarMesh.position = new Vector3(pos.x, pos.y, pos.z);
        }
    }

    private _updateOrientation() : void {
        if (this._avatarMesh) {
            const q = this._avatarDomain.orientation;
            this._avatarMesh.rotationQuaternion = new Quaternion(q.x, q.y, q.z, q.w);
        }
    }

    private _updateJointData() : void {
        if (this._avatarMesh) {
            this._avatarMesh.getChildren();

            const rotations = this._avatarDomain.jointRotations;

            const nodes = this._avatarMesh.getChildren(undefined, false);
            nodes.forEach((node, index) => {
                const transNode = node as TransformNode;
                const q = rotations[index];
                if (transNode.rotationQuaternion && q) {
                    transNode.rotationQuaternion = new Quaternion(
                        q.x, q.y, q.z, q.w
                    );
                }
            });
        }
    }
}
