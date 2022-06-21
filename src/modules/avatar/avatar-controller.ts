/*
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import {
    Mesh,
    Skeleton,
    ArcRotateCamera,
    Scene,
    ActionManager,
    ExecuteCodeAction,
    AnimationGroup
} from "@babylonjs/core";

import Log from "@Modules/debugging/log";


/* eslint-disable @typescript-eslint/no-magic-numbers */
export class AvatarController {
    private _avatar: Mesh;
    private _skeleton: Skeleton;
    private _camera: ArcRotateCamera;
    private _scene: Scene;
    private _walkSpeed = 2;
    private _movement : BABYLON.Vector3;
    private _rotationSpeed = 40 * Math.PI / 180;
    private _rotation = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private _inputMap : any;
    private _idleAnim : BABYLON.Nullable<AnimationGroup> = null;
    private _walkAnim : BABYLON.Nullable<AnimationGroup> = null;
    private _currentAnim: BABYLON.Nullable<AnimationGroup> = null;
    private _prevAnim: BABYLON.Nullable<AnimationGroup> = null;

    constructor(avatar: Mesh, skeleton: Skeleton, camera: ArcRotateCamera, scene: Scene, animGroups: AnimationGroup[]) {
        this._avatar = avatar;
        this._skeleton = skeleton;
        this._camera = camera;
        this._scene = scene;
        this._movement = new BABYLON.Vector3();
        this._inputMap = {};

        animGroups.forEach((animGroup : AnimationGroup) => {
            if (animGroup.name === "Armature.001|Take 001|BaseLayer") {
                this._walkAnim = animGroup;
                this._walkAnim.loopAnimation = true;
                this._walkAnim.stop();
            }
        });

    }

    public start():void {
        /* eslint-disable @typescript-eslint/no-unsafe-member-access */
        this._scene.registerBeforeRender(this._update.bind(this));

        // scene action manager to detect inputs
        this._scene.actionManager = new ActionManager(this._scene);

        this._scene.actionManager.registerAction(
            new ExecuteCodeAction(ActionManager.OnKeyDownTrigger,
                (evt) => {
                    this._inputMap[evt.sourceEvent.key] = evt.sourceEvent.type === "keydown";
                }));

        this._scene.actionManager.registerAction(
            new ExecuteCodeAction(ActionManager.OnKeyUpTrigger,
                (evt) => {
                    this._inputMap[evt.sourceEvent.key] = evt.sourceEvent.type === "keydown";
                }));
        /*
        this._walkAnim = this._scene.getAnimationGroupByName("Armature.001|Take 001|BaseLayer");
        if (this._walkAnim) {
            this._walkAnim.loopAnimation = true;
            this._walkAnim.stop();
        }

        const targetedAnimations = this._idleToWalkAni.targetedAnimations;
        // console.log(targetedAnimations);

        for (let i = 0; i < targetedAnimations.length; i++) {
            const targetAni = targetedAnimations[i];
            const target = targetAni.target as Mesh;
            // Log.debug(Log.types.AVATAR, "target:" + target.name);
            this._avatar.getChildren((node) => {
                if (target.name === node.name) {
                    Log.debug(Log.types.AVATAR, "apply:" + target.name);
                    targetAni.target = node;
                    return true;
                }
                return false;
            }, false);

        }

        // Log.debug(Log.types.AVATAR, `paly idle_to_walk form ${this._idleToWalkAni.from} to ${this._idleToWalkAni.to}`);
        this._idleToWalkAni.start(true, 1.0, this._idleToWalkAni.from, this._idleToWalkAni.to, false);
*/
    }


    private _update():void {
        /* eslint-disable @typescript-eslint/no-unsafe-member-access */
        /* eslint-disable @typescript-eslint/dot-notation */
        this._movement.z = 0;
        this._rotation = 0;

        if (this._inputMap["w"]) {
            this._movement.z = -this._walkSpeed;
        } else if (this._inputMap["s"]) {
            this._movement.z = this._walkSpeed;
        }

        if (this._inputMap["a"]) {
            this._rotation = -this._rotationSpeed;
        } else if (this._inputMap["d"]) {
            this._rotation = this._rotationSpeed;
        }

        if (this._inputMap[" "]) {
            Log.debug(Log.types.AVATAR, "space");
        }

        const dt = this._scene.getEngine().getDeltaTime() / 1000;
        const movement = this._movement.scale(dt);
        const rot = this._rotation * dt;

        // eslint-disable-next-line new-cap
        this._avatar.rotate(BABYLON.Vector3.Up(), rot);
        this._avatar.movePOV(movement.x, movement.y, movement.z);

        this._animateAvatar();
    }

    private _animateAvatar() {
        this._currentAnim = this._idleAnim;

        if (this._inputMap["w"] || this._inputMap["s"] || this._inputMap["a"] || this._inputMap["d"]) {
            this._currentAnim = this._walkAnim;
        }

        if (this._currentAnim !== null && this._currentAnim !== this._prevAnim) {
            this._prevAnim?.stop();
            this._currentAnim.play(this._currentAnim.loopAnimation);
            this._prevAnim = this._currentAnim;
        }
        // just because of no idle anim
        if (this._currentAnim === null && this._prevAnim !== null) {
            this._prevAnim.stop();
            this._prevAnim = null;
        }
    }
}
