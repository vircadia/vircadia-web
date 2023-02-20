//
//  keyboardInput.ts
//
//  Created by Nolan Huang on 17 Oct 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable @typescript-eslint/no-unused-vars */
import { IInputHandler } from "./inputHandler";
import { Scene,
    ActionManager,
    ExecuteCodeAction,
    Nullable,
    ActionEvent,
    Scalar,
    IAction,
    AbstractMesh,
    Node,
    TransformNode,
    Vector3,
    Quaternion } from "@babylonjs/core";

import { AvatarState, Action, State, JumpSubState, AnimationMap } from "../avatarState";
import { InputState, CameraMode, InputMode } from "../inputState";
import { Store } from "@Store/index";
import { AudioMgr } from "@Modules/scene/audio";
import type { GameObject } from "@Modules/object";
import type { SceneController } from "@Modules/scene/controllers";

// This is disabled because TS complains about BABYLON's use of cap'ed function names
/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/dot-notation */

export class KeyboardInput implements IInputHandler {

    private _scene : Scene;
    private _state : AvatarState;
    private _inputState : InputState;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private _inputMap : any = {};
    private _shiftKey = false;
    private _runKey = false;
    private _keyDownAction:Nullable<IAction> = null;
    private _keyUpAction:Nullable<IAction> = null;
    private _previousMuteInput = Store.state.audio.user.muted;

    constructor(state : AvatarState, inputState : InputState, scene: Scene) {
        this._state = state;
        this._inputState = inputState;
        this._scene = scene;
    }

    public attachControl(): void {
        // scene action manager to detect inputs
        if (!this._scene.actionManager) {
            this._scene.actionManager = new ActionManager(this._scene);
        }

        this._keyDownAction = new ExecuteCodeAction(ActionManager.OnKeyDownTrigger,
            this._onKeyDown.bind(this));
        this._scene.actionManager.registerAction(this._keyDownAction);

        this._keyUpAction = new ExecuteCodeAction(ActionManager.OnKeyUpTrigger,
            this._onKeyUp.bind(this));
        this._scene.actionManager.registerAction(this._keyUpAction);
    }

    public detachControl(): void {
        if (this._keyDownAction) {
            this._scene.actionManager.unregisterAction(this._keyDownAction);
            this._keyDownAction = null;
        }

        if (this._keyUpAction) {
            this._scene.actionManager.unregisterAction(this._keyUpAction);
            this._keyUpAction = null;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public handleInputs(delta: number) : void {
        if (this._inputMap[Store.state.controls.movement.jump?.keybind] && this._state.state !== State.Fly) {
            if (this._state.state !== State.Jump) {
                this._state.state = State.Jump;
                this._state.jumpSubstate = JumpSubState.Start;
            } else if (this._state.jumpSubstate === JumpSubState.Landing) {
                this._state.jumpInPlace = true;
            }
        }

        if (this._state.state === State.Fly) {
            if (this._inputMap[Store.state.controls.movement.jump?.keybind]) {
                this._state.moveDir.y = Scalar.Lerp(Math.abs(this._state.moveDir.y), 1, 0.1);
            } else if (this._inputMap[Store.state.controls.movement.crouch?.keybind]) {
                this._state.moveDir.y = -Scalar.Lerp(Math.abs(this._state.moveDir.y), 1, 0.1);
            } else {
                this._state.moveDir.y = 0;
            }
        }

        if (this._inputMap[Store.state.controls.movement.walkLeft?.keybind]) {
            this._state.moveDir.x = Scalar.Lerp(Math.abs(this._state.moveDir.x), 1, 0.1);
        } else if (this._inputMap[Store.state.controls.movement.walkRight?.keybind]) {
            this._state.moveDir.x = -Scalar.Lerp(Math.abs(this._state.moveDir.x), 1, 0.1);
        } else {
            this._state.moveDir.x = 0;
        }

        if (this._inputMap[Store.state.controls.movement.walkForwards?.keybind]) {
            this._state.moveDir.z = -Scalar.Lerp(Math.abs(this._state.moveDir.z), 1, 0.1);
        } else if (this._inputMap[Store.state.controls.movement.walkBackwards?.keybind]) {
            this._state.moveDir.z = Scalar.Lerp(Math.abs(this._state.moveDir.z), 1, 0.1);
        } else {
            this._state.moveDir.z = 0;
        }

        if (this._state.moveDir.x !== 0 || this._state.moveDir.y !== 0 || this._state.moveDir.z !== 0) {
            this._setMoveAction();
        } else if (this._state.state === State.Move) {
            this._state.action = Action.Idle;
            this._state.state = State.Idle;
        }
    }

    private _onKeyDown(evt: ActionEvent):void {
        this._inputMap[evt.sourceEvent.code] = evt.sourceEvent.type === "keydown";
        this._shiftKey = evt.sourceEvent.shiftKey === true;

        if (evt.sourceEvent.code === "Tab") {
            this._inputState.inputMode = this._inputState.inputMode === InputMode.Interactive
                ? InputMode.Detached
                : InputMode.Interactive;
        }

        // Push-to-talk.
        if (evt.sourceEvent.code === Store.state.controls.audio.pushToTalk?.keybind && Store.state.audio.user.muted === true) {
            this._previousMuteInput = Store.state.audio.user.muted;
            AudioMgr.muteAudio(false);
        }

        // Fly.
        if (evt.sourceEvent.code === Store.state.controls.movement.fly?.keybind) {
            const sceneManager = this._scene.rootNodes.find((node) => node.id === "SceneManager") as GameObject;
            const sceneController = sceneManager.components.get("SceneController") as SceneController | undefined;

            if (this._state.state === State.Fly) {
                this._state.action = Action.Jump;
                this._state.state = State.Jump;
                this._state.jumpSubstate = JumpSubState.Falling;
                sceneController?.applyGravity();
            } else {
                this._state.state = State.Fly;
                this._state.action = Action.Fly;
                sceneController?.removeGravity();
            }
        }

        // Run.
        if (Store.state.controls.movement.run?.keybind.includes("Shift")) {
            this._runKey = this._shiftKey;
        } else {
            this._runKey = evt.sourceEvent.code === Store.state.controls.movement.run?.keybind ? true : this._runKey;
        }

        // Sit.
        if (evt.sourceEvent.code === Store.state.controls.movement.sit?.keybind) {
            const sitDistanceLimit = 1.5;

            // Get the player's avatar mesh.
            const avatarMesh = this._scene.meshes.find((mesh) => mesh.name === "MyAvatar");

            if (avatarMesh) {
                // Check for sittable objects.
                // eslint-disable-next-line max-len
                const sitObjects = this._scene.getNodes().filter((node) => (/^animate_/iu).test(node.name)) as (Node | TransformNode | AbstractMesh)[];

                // Filter out any that are too far away, or don't have an absolute position.
                const avatarAbsolutePosition = avatarMesh.getAbsolutePosition();
                const distances = [] as [TransformNode | AbstractMesh, number][];
                sitObjects.forEach((object) => {
                    if (!("getAbsolutePosition" in object)) {
                        return;
                    }
                    const distance = object.getAbsolutePosition()
                        .subtract(avatarAbsolutePosition)
                        .length();
                    if (distance <= sitDistanceLimit) {
                        distances.push([object, distance]);
                    }
                });

                // If there are some sittable objects in range, use the closest one.
                if (distances.length > 0) {
                    const selectedSitObject = distances.reduce((previousObject, currentObject) => {
                        if (previousObject[1] <= currentObject[1]) {
                            return previousObject;
                        }
                        return currentObject;
                    });



                    // Clear the move direction state.
                    this._state.moveDir = Vector3.Zero();

                    // Animate the avatar based on the model name.
                    this._state.duration = 0;
                    this._state.state = State.Pose;
                    let animation = Action.SitBeanbag;
                    for (const entry of AnimationMap.entries()) {
                        if (selectedSitObject[0].name.includes(entry[1].name)) {
                            animation = entry[0];
                            break;
                        }
                    }
                    this._state.action = animation;

                    // Remove gravity.
                    const sceneManager = this._scene.rootNodes.find((node) => node.id === "SceneManager") as GameObject;
                    const sceneController = sceneManager.components.get("SceneController") as SceneController | undefined;
                    sceneController?.removeGravity();

                    // Snap to the sittable object.
                    avatarMesh.setAbsolutePosition(selectedSitObject[0].getAbsolutePosition());
                    avatarMesh.rotationQuaternion = selectedSitObject[0].absoluteRotationQuaternion?.clone()
                        .multiply(new Quaternion(0, -1, 0, 0))
                        ?? avatarMesh.rotationQuaternion;
                } else {
                    // Otherwise, sit on the ground.
                    this._state.duration = 0;
                    this._state.state = State.Pose;
                    this._state.action = Action.Sit;
                }
            }
        }

        // Clap.
        if (evt.sourceEvent.code === Store.state.controls.movement.clap?.keybind) {
            this._state.state = State.Pose;
            this._state.action = Action.Clap;
        }

        // Salute.
        if (evt.sourceEvent.code === Store.state.controls.movement.salute?.keybind) {
            this._state.state = State.Pose;
            this._state.action = Action.Salute;
        }
    }

    private _onKeyUp(evt: ActionEvent):void {
        this._inputMap[evt.sourceEvent.code] = evt.sourceEvent.type === "keydown";
        this._shiftKey = evt.sourceEvent.shiftKey === true;

        if (evt.sourceEvent.code === Store.state.controls.camera.firstPerson?.keybind) {
            this._inputState.cameraMode = CameraMode.FirstPersion;
        } else if (evt.sourceEvent.code === Store.state.controls.camera.thirdPerson?.keybind) {
            this._inputState.cameraMode = CameraMode.ThirdPersion;
        } else if (evt.sourceEvent.code === Store.state.controls.camera.collisions?.keybind) {
            this._inputState.cameraCheckCollisions = !this._inputState.cameraCheckCollisions;
            this._inputState.cameraElastic = !this._inputState.cameraElastic;
        }

        // Mute toggle.
        if (evt.sourceEvent.code === Store.state.controls.audio.mute?.keybind) {
            this._previousMuteInput = AudioMgr.muteAudio();
        }

        // Push-to-talk.
        if (evt.sourceEvent.code === Store.state.controls.audio.pushToTalk?.keybind) {
            AudioMgr.muteAudio(this._previousMuteInput);
        }

        // Run.
        if (Store.state.controls.movement.run?.keybind.includes("Shift")) {
            this._runKey = this._shiftKey;
        } else {
            this._runKey = evt.sourceEvent.code === Store.state.controls.movement.run?.keybind ? false : this._runKey;
        }

        // Clap.
        if (
            evt.sourceEvent.code === Store.state.controls.movement.clap?.keybind
            && this._state.state === State.Pose
            && this._state.action === Action.Clap
        ) {
            this._state.state = State.Idle;
            this._state.action = Action.Idle;
        }

        // Salute.
        if (
            evt.sourceEvent.code === Store.state.controls.movement.salute?.keybind
            && this._state.state === State.Pose
            && this._state.action === Action.Salute
        ) {
            this._state.state = State.Idle;
            this._state.action = Action.Idle;
        }
    }

    private _setMoveAction() {
        if (this._state.state === State.Idle || this._state.state === State.Move) {
            this._state.state = State.Move;
            this._state.action = this._runKey ? Action.RunForward : Action.WalkForward;
            return;
        }

        if (this._state.state === State.Fly) {
            this._state.state = State.Fly;
            this._state.action = this._runKey ? Action.FlyFast : Action.Fly;
        }
    }
}
