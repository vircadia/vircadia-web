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

import {
    Vector3,
    ActionManager,
    ExecuteCodeAction,
    AnimationGroup,
    Nullable,
    Scalar,
    Ray,
    AbstractMesh,
    ActionEvent,
    IAction
} from "@babylonjs/core";
import { AnimationController } from "./AnimationController";
import { GameObject } from "@Modules/object";
import { ScriptComponent, inspector } from "@Modules/script";

// General Modules
import Log from "@Modules/debugging/log";

// This is disabled because TS complains about BABYLON's use of cap'ed function names
/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/dot-notation */
export class AvatarController extends ScriptComponent {
    private _animGroups: Nullable<Array<AnimationGroup>> = null;
    @inspector({ min: 0.1, max: 10 })
    private _walkSpeed = 3;

    @inspector({ min: 0.1, max: 2 * Math.PI })
    private _rotationSpeed = 40 * Math.PI / 180;

    private _movement : Vector3;

    private _rot = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private _inputMap : any;
    private _shiftKey = false;
    private _keyDownAction:Nullable<IAction> = null;
    private _keyUpAction:Nullable<IAction> = null;
    private _animController: Nullable<AnimationController> = null;

    constructor() {
        super("AvatarController");
        this._movement = new Vector3();
        this._inputMap = {};
        this._onKeyUp = this._onKeyUp.bind(this);
        this._onKeyupDown = this._onKeyupDown.bind(this);
    }

    public get walkSpeed() : number {
        return this._walkSpeed;
    }

    public set walkSpeed(value : number) {
        this._walkSpeed = value;
    }

    public set animGroups(value: AnimationGroup[]) {
        this._animGroups = value;
    }

    /**
    * Gets a string identifying the type of this Component
    * @returns "AvatarController" string
    */
    // eslint-disable-next-line class-methods-use-this
    public get componentType():string {
        return "AvatarController";
    }

    public onInitialize(): void {
        Log.debug(Log.types.AVATAR,
            `MyAvatar onInitialize`);

        this._animController = new AnimationController(
            this._gameObject as GameObject,
            this._animGroups as AnimationGroup[]);

        this._animController.play("idle02");
    }

    public onStart():void {
        Log.debug(Log.types.AVATAR,
            `MyAvatar onStart`);

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

    public onStop():void {
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

    public onUpdate():void {
        if (!this._gameObject) {
            return;
        }

        if (this._inputMap["KeyW"]) {
            this._movement.z = Scalar.Lerp(this._movement.z, -this._walkSpeed, 0.1);
        } else if (this._inputMap["KeyS"]) {
            this._movement.z = Scalar.Lerp(this._movement.z, this._walkSpeed, 0.1);
        } else {
            this._movement.z = 0;
        }

        if (this._inputMap["KeyA"]) {
            if (this._shiftKey) {
                this._movement.x = Scalar.Lerp(this._movement.x, this._walkSpeed, 0.1);
            } else {
                this._rot = Scalar.Lerp(this._rot, -this._rotationSpeed, 0.1);
            }
        } else if (this._inputMap["KeyD"]) {
            if (this._shiftKey) {
                this._movement.x = Scalar.Lerp(this._movement.x, -this._walkSpeed, 0.1);
            } else {
                this._rot = Scalar.Lerp(this._rot, this._rotationSpeed, 0.1);
            }
        } else {
            this._movement.x = 0;
            this._rot = 0;
        }

        // eslint-disable-next-line no-empty
        if (this._inputMap["Space"]) {

        }

        const dt = this._scene.getEngine().getDeltaTime() / 1000;
        const movement = this._gameObject.calcMovePOV(this._movement.x, 0, this._movement.z).scale(dt);
        this._gameObject.moveWithCollisions(movement);

        const rot = this._rot * dt;
        this._gameObject.rotate(Vector3.Up(), rot);
        this._animateAvatar();

        this._updateGroundDetection();
    }

    private _animateAvatar() {
        if (!this._animController) {
            return;
        }

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
        if (!pickedPoint.equals(Vector3.Zero()) && this._gameObject) {
            this._gameObject.position.y = pickedPoint.y + 0.05;
        }
    }

    // --GROUND DETECTION--
    // Send raycast to the floor to detect if there are any hits with meshes below the character
    private _floorRaycast(offsetx: number, offsetz: number, raycastlen: number): Vector3 {
        if (!this._gameObject) {
            return Vector3.Zero();
        }

        // position the raycast from bottom center of mesh
        const raycastFloorPos = new Vector3(
            this._gameObject.position.x + offsetx, this._gameObject.position.y + 0.5, this._gameObject.position.z + offsetz);

        const ray = new Ray(raycastFloorPos, Vector3.Down(), raycastlen);

        // defined which type of meshes should be pickable
        const predicate = (mesh:AbstractMesh) => mesh.isPickable && mesh.isEnabled();

        const pick = this._scene.pickWithRay(ray, predicate);
        if (pick && pick.hit && pick.pickedPoint) { // grounded
            return pick.pickedPoint;
        }  // not grounded
        return Vector3.Zero();
    }
}
