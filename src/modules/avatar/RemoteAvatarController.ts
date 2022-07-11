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
    Scene,
    AnimationGroup
} from "@babylonjs/core";
// General Modules
import Log from "@Modules/debugging/log";
// Domain Modules
import { ScriptAvatar, vec3, quat } from "@vircadia/web-sdk";

export class RemoteAvatarController {
    private _scene: Scene;

    // domain properties
    private _avatarDomain : ScriptAvatar;
    private _prePos: vec3;
    private _preQuat : quat;

    constructor(scene: Scene, animGroups: AnimationGroup[], domain :ScriptAvatar) {
        // this._avatarMesh = mesh;
        this._scene = scene;
        this._avatarDomain = domain;
        this._update = this._update.bind(this);

        Log.debug(Log.types.AVATAR,
            `Avatar created.
            DisplayName:${this._avatarDomain.displayName}
            SessionDisplayName:${this._avatarDomain.sessionDisplayName}
            SkeletonModelURL:${this._avatarDomain.skeletonModelURL}`);

        Log.debug(Log.types.AVATAR,
            `Pos:${this._avatarDomain.position.x}, ${this._avatarDomain.position.y}, ${this._avatarDomain.position.z}
             Quat:${this._avatarDomain.orientation.x}, ${this._avatarDomain.orientation.y}, 
             ${this._avatarDomain.orientation.z}, ${this._avatarDomain.orientation.w}`);

        this._avatarDomain.displayNameChanged.connect(this._handleDisplayNameChanged.bind(this));
        this._avatarDomain.sessionDisplayNameChanged.connect(this._handleSessionDisplayNameChanged.bind(this));
        this._avatarDomain.skeletonModelURLChanged.connect(this._handleSkeletonModelURLChanged.bind(this));

        this._prePos = this._avatarDomain.position;
        this._preQuat = this._avatarDomain.orientation;
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
        const pos = this._avatarDomain.position;
        if (this._prePos.x !== pos.x || this._prePos.y !== pos.y || this._prePos.z !== pos.z) {
            Log.debug(Log.types.AVATAR,
                `Pos:${pos.x}, ${pos.y}, ${pos.z}`);
            this._prePos = pos;
        }

        const q = this._avatarDomain.orientation;
        if (this._preQuat.x !== q.x || this._preQuat.y !== q.y
            || this._preQuat.z !== q.z || this._preQuat.w !== q.w) {
            Log.debug(Log.types.AVATAR,
                `Quat:${q.x}, ${q.y}, ${q.z}, ${q.w}`);
            this._preQuat = q;
        }
    }

    private _handleDisplayNameChanged() {
        Log.debug(Log.types.AVATAR,
            `DisplayName:${this._avatarDomain.displayName}`);
    }

    private _handleSessionDisplayNameChanged() {
        Log.debug(Log.types.AVATAR,
            `SessionDisplayName:${this._avatarDomain.sessionDisplayName}`);
    }

    private _handleSkeletonModelURLChanged() {
        Log.debug(Log.types.AVATAR,
            `SkeletonModelURL:${this._avatarDomain.skeletonModelURL}`);
    }
}
