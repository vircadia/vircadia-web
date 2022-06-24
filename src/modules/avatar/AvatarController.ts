/*
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

// import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import {
    Vector3,
    Mesh,
    ArcRotateCamera,
    Scene,
    ActionManager,
    ExecuteCodeAction,
    AnimationGroup,
    Nullable,
    Node,
    TransformNode
} from "@babylonjs/core";

import Log from "@Modules/debugging/log";


/* eslint-disable @typescript-eslint/no-magic-numbers */
export class AvatarController {
    private _avatar: Mesh;
    private _camera: ArcRotateCamera;
    private _scene: Scene;
    private _walkSpeed = 2;
    private _movement : Vector3;
    private _rotationSpeed = 40 * Math.PI / 180;
    private _rotation = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private _inputMap : any;
    private _idleAnim : Nullable<AnimationGroup> = null;
    private _walkFwdAnim : Nullable<AnimationGroup> = null;
    private _walkbwdAnim : Nullable<AnimationGroup> = null;
    private _turnLeftAnim : Nullable<AnimationGroup> = null;
    private _turnRightAnim : Nullable<AnimationGroup> = null;
    private _currentAnim: Nullable<AnimationGroup> = null;
    private _prevAnim: Nullable<AnimationGroup> = null;

    constructor(avatar: Mesh, camera: ArcRotateCamera, scene: Scene, animGroups: AnimationGroup[]) {
        this._avatar = avatar;
        this._camera = camera;
        this._scene = scene;
        this._movement = new Vector3();
        this._inputMap = {};

        const nodes = new Map<string, Node>();
        this._avatar.getChildren((node):boolean => {
            nodes.set(node.name, node);
            return true;
        }, false);

        animGroups.forEach((animGroup : AnimationGroup) => {
            switch (animGroup.name) {
                case "idle02":
                    this._idleAnim = AvatarController._cloneAnimGroup(animGroup, nodes);
                    break;
                case "walk_fwd":
                    this._walkFwdAnim = AvatarController._cloneAnimGroup(animGroup, nodes);
                    break;
                case "walk_bwd":
                    this._walkbwdAnim = AvatarController._cloneAnimGroup(animGroup, nodes);
                    break;
                case "turn_left":
                    this._turnLeftAnim = AvatarController._cloneAnimGroup(animGroup, nodes);
                    break;
                case "turn_right":
                    this._turnRightAnim = AvatarController._cloneAnimGroup(animGroup, nodes);
                    break;
                default:
            }

        });

    }

    static _cloneAnimGroup(sourceAnimGroup : AnimationGroup, nodes : Map<string, Node>, loop = true):AnimationGroup {
        const animGroup = new AnimationGroup(sourceAnimGroup.name);
        animGroup.loopAnimation = loop;

        sourceAnimGroup.targetedAnimations.forEach((targetAnim) => {
            const target = targetAnim.target as TransformNode;
            const node = nodes.get(target.name);
            if (node) {
                animGroup.addTargetedAnimation(targetAnim.animation, node);
            }
        });

        return animGroup;
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
        this._avatar.rotate(Vector3.Up(), rot);
        this._avatar.movePOV(movement.x, movement.y, movement.z);

        this._animateAvatar();
    }

    private _animateAvatar() {
        this._currentAnim = this._idleAnim;

        if (this._inputMap["w"]) {
            this._currentAnim = this._walkFwdAnim;
        } else if (this._inputMap["s"]) {
            this._currentAnim = this._walkbwdAnim;
        } else if (this._inputMap["a"]) {
            this._currentAnim = this._turnLeftAnim;
        } else if (this._inputMap["d"]) {
            this._currentAnim = this._turnRightAnim;
        }

        if (this._currentAnim !== null && this._currentAnim !== this._prevAnim) {
            this._prevAnim?.stop();
            this._currentAnim.start(this._currentAnim.loopAnimation, 1.0, 0.05, this._currentAnim.to, false);
            this._prevAnim = this._currentAnim;
            // console.log("play anim", this._currentAnim.name, this._currentAnim.from, this._currentAnim.to);
        }
        // just for no idle anim case
        if (this._currentAnim === null && this._prevAnim !== null) {
            this._prevAnim.stop();
            this._prevAnim = null;
        }
    }
}
