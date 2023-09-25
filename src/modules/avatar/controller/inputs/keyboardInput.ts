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

// This is disabled because TS complains about BABYLON's use of capitalized function names.
/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-magic-numbers */

import { IInputHandler } from "./inputHandler";
import {
    Scene,
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
    Quaternion
} from "@babylonjs/core";
import { AvatarState, Action, State, JumpSubState, AnimationMap } from "../avatarState";
import { InputState, CameraMode, InputMode } from "../inputState";
import { applicationStore, userStore } from "@Stores/index";
import { AudioManager as AudioMgr } from "@Modules/scene/audio";
import { Renderer } from "@Modules/scene";


export class KeyboardInput implements IInputHandler {
    private _scene: Scene;
    private _state: AvatarState;
    private _inputState: InputState;
    private _inputMap: { [key: string]: boolean } = {};
    private _shiftKey = false;
    private _runKey = false;
    private _keyDownAction: Nullable<IAction> = null;
    private _keyUpAction: Nullable<IAction> = null;
    private _previousMuteInput = applicationStore.audio.user.muted;
    private _controlsAreAttached = false;

    constructor(state: AvatarState, inputState: InputState, scene: Scene) {
        this._state = state;
        this._inputState = inputState;
        this._scene = scene;
    }

    public attachControl(): void {
        // scene action manager to detect inputs
        if (!this._scene.actionManager) {
            this._scene.actionManager = new ActionManager(this._scene);
        }

        if (!this._controlsAreAttached) {
            this._keyDownAction = new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, this._onKeyDown.bind(this));
            this._scene.actionManager.registerAction(this._keyDownAction);

            this._keyUpAction = new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, this._onKeyUp.bind(this));
            this._scene.actionManager.registerAction(this._keyUpAction);

            this._controlsAreAttached = true;
        }
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
    public handleInputs(delta: number): void {
        if (this._inputMap[userStore.controls.keyboard.movement.jump?.keycode] && this._state.state !== State.Fly) {
            if (this._state.state !== State.Jump) {
                this._state.state = State.Jump;
                this._state.jumpSubstate = JumpSubState.Start;
            } else if (this._state.jumpSubstate === JumpSubState.Landing) {
                this._state.jumpInPlace = true;
            }
        }

        if (this._state.state === State.Fly) {
            if (this._inputMap[userStore.controls.keyboard.movement.jump?.keycode]) {
                this._state.moveDir.y = Scalar.Lerp(Math.abs(this._state.moveDir.y), 1, 0.1);
            } else if (this._inputMap[userStore.controls.keyboard.movement.crouch?.keycode]) {
                this._state.moveDir.y = -Scalar.Lerp(Math.abs(this._state.moveDir.y), 1, 0.1);
            } else {
                this._state.moveDir.y = 0;
            }
        }

        if (this._inputMap[userStore.controls.keyboard.movement.walkLeft?.keycode]) {
            this._state.moveDir.x = Scalar.Lerp(Math.abs(this._state.moveDir.x), 1, 0.1);
        } else if (this._inputMap[userStore.controls.keyboard.movement.walkRight?.keycode]) {
            this._state.moveDir.x = -Scalar.Lerp(Math.abs(this._state.moveDir.x), 1, 0.1);
        } else {
            this._state.moveDir.x = 0;
        }

        if (this._inputMap[userStore.controls.keyboard.movement.walkForwards?.keycode]) {
            this._state.moveDir.z = -Scalar.Lerp(Math.abs(this._state.moveDir.z), 1, 0.1);
        } else if (this._inputMap[userStore.controls.keyboard.movement.walkBackwards?.keycode]) {
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

    private _onKeyDown(event: ActionEvent): void {
        const sourceEvent = event.sourceEvent as Event;
        if (!sourceEvent || !(sourceEvent instanceof KeyboardEvent) || !sourceEvent.code) {
            return;
        }

        this._inputMap[sourceEvent.code] = sourceEvent.type === "keydown";
        this._shiftKey = sourceEvent.shiftKey;

        if (sourceEvent.code === "Tab") {
            this._inputState.inputMode = this._inputState.inputMode === InputMode.Interactive
                ? InputMode.Detached
                : InputMode.Interactive;
        }

        // Babylon Inspector.
        if (process.env.NODE_ENV === "development" && sourceEvent.code === "Slash" && this._shiftKey) {
            void this._scene.debugLayer.show({ overlay: true });
        }

        // Reset position.
        if (sourceEvent.code === userStore.controls.keyboard.other.resetPosition?.keycode) {
            Renderer.getScene()?.resetMyAvatarPositionAndOrientation();
        }

        // Push-to-talk.
        if (sourceEvent.code === userStore.controls.keyboard.audio.pushToTalk?.keycode && applicationStore.audio.user.muted) {
            this._previousMuteInput = applicationStore.audio.user.muted;
            AudioMgr.muteAudio(false);
        }

        // Fly.
        if (sourceEvent.code === userStore.controls.keyboard.movement.fly?.keycode) {
            const sceneController = Renderer.getScene().sceneController;

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
        if (userStore.controls.keyboard.movement.run?.keycode.includes("Shift")) {
            this._runKey = this._shiftKey;
        } else {
            this._runKey = sourceEvent.code === userStore.controls.keyboard.movement.run?.keycode ? true : this._runKey;
        }

        // Sit.
        if (sourceEvent.code === userStore.controls.keyboard.movement.sit?.keycode) {
            // Get the player's avatar mesh.
            const avatarMesh = this._scene.meshes.find((mesh) => mesh.name === "MyAvatar");

            if (avatarMesh) {
                // Check for sittable objects.
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
                    if (distance <= applicationStore.interactions.interactionDistance) {
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
                    Renderer.getScene().sceneController?.removeGravity();

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
        if (sourceEvent.code === userStore.controls.keyboard.movement.clap?.keycode) {
            this._state.state = State.Pose;
            this._state.action = Action.Clap;
        }

        // Salute.
        if (sourceEvent.code === userStore.controls.keyboard.movement.salute?.keycode) {
            this._state.state = State.Pose;
            this._state.action = Action.Salute;
        }
    }

    private _onKeyUp(event: ActionEvent): void {
        const sourceEvent = event.sourceEvent as Event;
        if (!sourceEvent || !(sourceEvent instanceof KeyboardEvent) || !sourceEvent.code) {
            // Work around "continue walking forever" browser / Babylon.js bug in which the code value can be undefined if the
            // key-up event is due to clicking on an app window while a key is pressed.
            this._inputMap = {};
            return;
        }
        this._inputMap[sourceEvent.code] = sourceEvent.type === "keydown";
        this._shiftKey = sourceEvent.shiftKey;

        if (sourceEvent.code === userStore.controls.keyboard.camera.firstPerson?.keycode) {
            this._inputState.cameraMode = CameraMode.FirstPerson;
        } else if (sourceEvent.code === userStore.controls.keyboard.camera.thirdPerson?.keycode) {
            this._inputState.cameraMode = CameraMode.ThirdPerson;
        } else if (sourceEvent.code === userStore.controls.keyboard.camera.collisions?.keycode) {
            this._inputState.cameraCheckCollisions = !this._inputState.cameraCheckCollisions;
            this._inputState.cameraElastic = !this._inputState.cameraElastic;
        }

        // Mute toggle.
        if (sourceEvent.code === userStore.controls.keyboard.audio.mute?.keycode) {
            this._previousMuteInput = AudioMgr.muteAudio();
        }

        // Push-to-talk.
        if (sourceEvent.code === userStore.controls.keyboard.audio.pushToTalk?.keycode) {
            AudioMgr.muteAudio(this._previousMuteInput);
        }

        // Run.
        if (userStore.controls.keyboard.movement.run?.keycode.includes("Shift")) {
            this._runKey = this._shiftKey;
        } else {
            this._runKey = sourceEvent.code === userStore.controls.keyboard.movement.run?.keycode ? false : this._runKey;
        }

        // Clap.
        if (
            sourceEvent.code === userStore.controls.keyboard.movement.clap?.keycode
            && this._state.state === State.Pose
            && this._state.action === Action.Clap
        ) {
            this._state.state = State.Idle;
            this._state.action = Action.Idle;
        }

        // Salute.
        if (
            sourceEvent.code === userStore.controls.keyboard.movement.salute?.keycode
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
