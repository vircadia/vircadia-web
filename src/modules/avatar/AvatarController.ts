/* eslint-disable @typescript-eslint/no-unused-vars */
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
    Node,
    Vector3,
    Scene,
    ActionManager,
    ExecuteCodeAction,
    AnimationGroup,
    Nullable,
    Scalar,
    Ray,
    AbstractMesh,
    Camera,
    ActionEvent,
    IAction,
    TransformNode
} from "@babylonjs/core";

import { AnimationController } from "./AnimationController";
import { AvatarMapper } from "./AvatarMapper";
// General Modules
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Log from "@Modules/debugging/log";
// Domain Modules
import { MyAvatarInterface, quat, SkeletonJoint } from "@vircadia/web-sdk";


/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/dot-notation */
export class AvatarController {
    private _avatarMesh: AbstractMesh;
    private _skeletonNodes: TransformNode[];
    private _camera: Camera;
    private _scene: Scene;
    private _walkSpeed = 3;
    private _movement : Vector3;
    private _rotationSpeed = 40 * Math.PI / 180;
    private _rotation = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private _inputMap : any;
    private _shiftKey = false;
    private _keyDownAction:Nullable<IAction> = null;
    private _keyUpAction:Nullable<IAction> = null;

    // domain properties
    private _avatarDomain : Nullable<MyAvatarInterface> = null;
    private _positionUpdated = false;
    private _rotationUpdated = false;
    private _animController: AnimationController;

    constructor(avatar: AbstractMesh, camera: Camera, scene: Scene, animGroups: AnimationGroup[]) {
        this._avatarMesh = avatar;
        this._skeletonNodes = new Array<TransformNode>();
        this._camera = camera;
        this._scene = scene;
        this._movement = new Vector3();
        this._inputMap = {};
        this._update = this._update.bind(this);
        this._onKeyUp = this._onKeyUp.bind(this);
        this._onKeyupDown = this._onKeyupDown.bind(this);
        this._animController = new AnimationController(avatar, animGroups);
    }

    public bindDomain(avatar :MyAvatarInterface):void {
        Log.debug(Log.types.AVATAR,
            `bind my avatar domain`);

        this._avatarDomain = avatar;
        this._avatarDomain.scale = this._avatarMesh.scaling.x;
        this._avatarDomain.locationChangeRequired.connect(this._syncToDomain.bind(this));

        const rootNode = this._avatarMesh.getChildTransformNodes()[0];
        const skeleton = new Array<SkeletonJoint>();
        this._collectJointData(rootNode, -1, skeleton);
        this._avatarDomain.skeleton = skeleton;

        this._positionUpdated = true;
        this._rotationUpdated = true;
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

        this._animController.play("idle02");
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
        const movement = this._avatarMesh.calcMovePOV(this._movement.x, 0, this._movement.z).scale(dt);
        this._avatarMesh.moveWithCollisions(movement);

        const rot = this._rotation * dt;
        this._avatarMesh.rotate(Vector3.Up(), rot);

        this._animateAvatar();

        this._updateGroundDetection();

        this._syncToDomain();
    }

    private _animateAvatar() {
        if (this._inputMap["KeyW"]) {
            this._animController.play("walk_fwd");
        } else if (this._inputMap["KeyS"]) {
            this._animController.play("walk_bwd");
        } else if (this._inputMap["KeyA"]) {
            if (this._shiftKey) {
                this._animController.play("walk_right");
            } else {
                this._animController.play("turn_left");
            }
        } else if (this._inputMap["KeyD"]) {
            if (this._shiftKey) {
                this._animController.play("walk_left");
            } else {
                this._animController.play("turn_right");
            }
        } else {
            this._animController.play("idle02");
        }

        this._animController.update();
    }


    private _updateGroundDetection(): void {
        const pickedPoint = this._floorRaycast(0, 0, 1);
        if (!pickedPoint.equals(Vector3.Zero())) {
            this._avatarMesh.position.y = pickedPoint.y + 0.05;
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

    private _collectJointData(node:Node, parentIndex: number, joints: SkeletonJoint[]) : void {
        if (node.getClassName() !== "TransformNode") {
            return;
        }

        const transNode = node as TransformNode;
        this._skeletonNodes.push(transNode);

        const jointIndex = joints.length;
        const joint = AvatarMapper.mapToJoint(transNode, jointIndex, parentIndex);
        joints.push(joint);

        const children = node.getChildren();
        children.forEach((child) => {
            this._collectJointData(child, jointIndex, joints);
        });
    }

    private _syncToDomain() {
        if (this._avatarDomain) {
            if (this._positionUpdated) {
                this._avatarDomain.position = AvatarMapper.mapToJointPosition(this._avatarMesh.position);
                this._positionUpdated = false;
            }
            if (this._rotationUpdated) {
                this._avatarDomain.orientation = AvatarMapper.mapToJointQuaternion(this._avatarMesh.rotationQuaternion);
                this._rotationUpdated = false;
            }

            // sync joint data
            for (let i = 0; i < this._avatarDomain.jointRotations.length; i++) {
                this._avatarDomain.jointTranslations[i]
                        = AvatarMapper.mapToJointPosition(this._skeletonNodes[i].position);
                this._avatarDomain.jointRotations[i]
                        = AvatarMapper.mapToJointQuaternion(this._skeletonNodes[i].rotationQuaternion);
            }
        }
    }
}
