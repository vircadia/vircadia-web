//
//  AvatarController.ts
//
//  Created by Nolan Huang on 17 Jun 2022.
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
    Scene,
    ActionManager,
    ExecuteCodeAction,
    AnimationGroup,
    Nullable,
    Node,
    TransformNode,
    Scalar,
    Ray,
    AbstractMesh,
    Camera,
    ActionEvent,
    IAction

} from "@babylonjs/core";
// General Modules
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Log from "@Modules/debugging/log";
// Domain Modules
import { MyAvatarInterface } from "@vircadia/web-sdk";


/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/dot-notation */
export class AvatarController {
    private _avatarMesh: AbstractMesh;
    private _camera: Camera;
    private _scene: Scene;
    private _walkSpeed = 3;
    private _movement : Vector3;
    private _rotationSpeed = 40 * Math.PI / 180;
    private _rotation = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private _inputMap : any;
    private _idleAnim : Nullable<AnimationGroup> = null;
    private _walkFwdAnim : Nullable<AnimationGroup> = null;
    private _walkbwdAnim : Nullable<AnimationGroup> = null;
    private _walkLeftAnim : Nullable<AnimationGroup> = null;
    private _walkRightAnim : Nullable<AnimationGroup> = null;
    private _turnLeftAnim : Nullable<AnimationGroup> = null;
    private _turnRightAnim : Nullable<AnimationGroup> = null;
    private _currentAnim: Nullable<AnimationGroup> = null;
    private _prevAnim: Nullable<AnimationGroup> = null;

    private _shiftKey = false;
    private _keyDownAction:Nullable<IAction> = null;
    private _keyUpAction:Nullable<IAction> = null;

    // domain properties
    private _avatarDomain : Nullable<MyAvatarInterface> = null;
    private _positionUpdated = false;
    private _rotationUpdated = false;

    constructor(avatar: AbstractMesh, camera: Camera, scene: Scene, animGroups: AnimationGroup[]) {
        this._avatarMesh = avatar;
        this._camera = camera;
        this._scene = scene;
        this._movement = new Vector3();
        this._inputMap = {};
        this._update = this._update.bind(this);
        this._onKeyUp = this._onKeyUp.bind(this);
        this._onKeyupDown = this._onKeyupDown.bind(this);

        const nodes = new Map<string, Node>();
        this._avatarMesh.getChildren((node):boolean => {
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
                case "walk_left":
                    this._walkLeftAnim = AvatarController._cloneAnimGroup(animGroup, nodes);
                    break;
                case "walk_right":
                    this._walkRightAnim = AvatarController._cloneAnimGroup(animGroup, nodes);
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

        this._avatarMesh.isPickable = false;

    }

    set domain(avatar :MyAvatarInterface) {
        this._avatarDomain = avatar;
        this._avatarDomain.scale = this._avatarMesh.scaling.x;
        this._avatarDomain.locationChangeRequired.connect(this._updateDomain.bind(this));
        this._positionUpdated = true;
        this._rotationUpdated = true;
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
        // eslint-disable-next-line @typescript-eslint/unbound-method
        this._scene.registerBeforeRender(this._update);

        // scene action manager to detect inputs
        if (!this._scene.actionManager) {
            this._scene.actionManager = new ActionManager(this._scene);
        }

        this._keyDownAction = new ExecuteCodeAction(ActionManager.OnKeyDownTrigger,
            // eslint-disable-next-line @typescript-eslint/unbound-method
            this._onKeyupDown);

        this._keyUpAction = new ExecuteCodeAction(ActionManager.OnKeyUpTrigger,
            // eslint-disable-next-line @typescript-eslint/unbound-method
            this._onKeyUp);

        this._scene.actionManager.registerAction(
            this._keyDownAction);

        this._scene.actionManager.registerAction(
            this._keyUpAction);
    }

    public stop():void {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        this._scene.unregisterBeforeRender(this._update);

        if (this._keyDownAction) {
            this._scene.actionManager.unregisterAction(this._keyDownAction);
            this._keyDownAction = null;
        }

        if (this._keyUpAction) {
            this._scene.actionManager.unregisterAction(this._keyUpAction);
            this._keyUpAction = null;
        }
    }

    private _onKeyupDown(evt: ActionEvent):void {
        this._inputMap[evt.sourceEvent.code] = evt.sourceEvent.type === "keydown";
        this._shiftKey = evt.sourceEvent.shiftKey === true;
    }

    private _onKeyUp(evt: ActionEvent):void {
        this._inputMap[evt.sourceEvent.code] = evt.sourceEvent.type === "keydown";
        this._shiftKey = evt.sourceEvent.shiftKey === true;
    }

    private _update():void {
        if (this._inputMap["KeyW"]) {
            this._movement.z = Scalar.Lerp(this._movement.z, -this._walkSpeed, 0.1);
            this._positionUpdated = true;
        } else if (this._inputMap["KeyS"]) {
            this._movement.z = Scalar.Lerp(this._movement.z, this._walkSpeed, 0.1);
            this._positionUpdated = true;
        } else {
            this._movement.z = 0;
        }

        if (this._inputMap["KeyA"]) {
            if (this._shiftKey) {
                this._movement.x = Scalar.Lerp(this._movement.x, this._walkSpeed, 0.1);
                this._positionUpdated = true;
            } else {
                this._rotation = Scalar.Lerp(this._rotation, -this._rotationSpeed, 0.1);
                this._rotationUpdated = true;
            }
        } else if (this._inputMap["KeyD"]) {
            if (this._shiftKey) {
                this._movement.x = Scalar.Lerp(this._movement.x, -this._walkSpeed, 0.1);
                this._positionUpdated = true;
            } else {
                this._rotation = Scalar.Lerp(this._rotation, this._rotationSpeed, 0.1);
                this._rotationUpdated = true;
            }
        } else {
            this._movement.x = 0;
            this._rotation = 0;
        }

        // eslint-disable-next-line no-empty
        if (this._inputMap["Space"]) {

        }

        const dt = this._scene.getEngine().getDeltaTime() / 1000;
        const movement = this._movement.scale(dt);
        const rot = this._rotation * dt;

        this._avatarMesh.rotate(Vector3.Up(), rot);
        this._avatarMesh.movePOV(movement.x, movement.y, movement.z);

        this._animateAvatar();

        this._updateGroundDetection();

        this._updateDomain();
    }

    private _animateAvatar() {
        this._currentAnim = this._idleAnim;

        if (this._inputMap["KeyW"]) {
            this._currentAnim = this._walkFwdAnim;
        } else if (this._inputMap["KeyS"]) {
            this._currentAnim = this._walkbwdAnim;
        } else if (this._inputMap["KeyA"]) {
            if (this._shiftKey) {
                this._currentAnim = this._walkRightAnim;
            } else {
                this._currentAnim = this._turnLeftAnim;
            }
        } else if (this._inputMap["KeyD"]) {
            if (this._shiftKey) {
                this._currentAnim = this._walkLeftAnim;
            } else {
                this._currentAnim = this._turnRightAnim;
            }
        }

        if (this._currentAnim !== null && this._currentAnim !== this._prevAnim) {
            this._prevAnim?.stop();
            this._currentAnim.start(this._currentAnim.loopAnimation, 1.0, 2, this._currentAnim.to, false);
            this._prevAnim = this._currentAnim;
        }
    }


    private _updateGroundDetection(): void {
        const pickedPoint = this._floorRaycast(0, 0, 1);
        if (!pickedPoint.equals(Vector3.Zero())) {
            this._avatarMesh.position.y = pickedPoint.y;
        }
    }

    // --GROUND DETECTION--
    // Send raycast to the floor to detect if there are any hits with meshes below the character
    private _floorRaycast(offsetx: number, offsetz: number, raycastlen: number): Vector3 {
        // position the raycast from bottom center of mesh
        const raycastFloorPos = new Vector3(
            this._avatarMesh.position.x + offsetx, this._avatarMesh.position.y + 0.5, this._avatarMesh.position.z + offsetz);
        const ray = new Ray(raycastFloorPos, Vector3.Down(), raycastlen);

        // defined which type of meshes should be pickable
        const predicate = (mesh:AbstractMesh) => mesh.isPickable && mesh.isEnabled();

        const pick = this._scene.pickWithRay(ray, predicate);
        if (pick && pick.hit && pick.pickedPoint) { // grounded
            return pick.pickedPoint;
        }  // not grounded
        return Vector3.Zero();

    }

    private _updateDomain() {
        if (this._avatarDomain) {
            if (this._positionUpdated) {
                this._avatarDomain.position = { x: this._avatarMesh.position.x,
                    y: this._avatarMesh.position.y,
                    z: this._avatarMesh.position.z };
                this._positionUpdated = false;
            }
            if (this._rotationUpdated) {
                if (this._avatarDomain.orientation && this._avatarMesh.rotationQuaternion) {
                    this._avatarDomain.orientation = { x: this._avatarMesh.rotationQuaternion.x,
                        y: this._avatarMesh.rotationQuaternion.y,
                        z: this._avatarMesh.rotationQuaternion.z,
                        w: this._avatarMesh.rotationQuaternion.z };
                /*
                    Log.debug(Log.types.AVATAR,
                        `update avatar domian rotation=
                            ${this._avatarDomain.orientation.x},
                            ${this._avatarDomain.orientation.y},
                            ${this._avatarDomain.orientation.z},
                            ${this._avatarDomain.orientation.w} `); */
                }

                this._rotationUpdated = false;
            }
        }
    }
}
