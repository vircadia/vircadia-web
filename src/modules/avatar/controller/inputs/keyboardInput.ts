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
    IAction } from "@babylonjs/core";

import { AvatarState, Action, State, JumpSubState } from "../avatarState";
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
        if (this._inputMap[Store.state.controls.movement.jump?.keybind]) {
            if (this._state.state !== State.Jump) {
                this._state.state = State.Jump;
                this._state.jumpSubstate = JumpSubState.Start;
            } else if (this._state.jumpSubstate === JumpSubState.Landing) {
                this._state.jumpInPlace = true;
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

        if (this._state.moveDir.x !== 0 || this._state.moveDir.z !== 0) {
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

        // Run.
        if (Store.state.controls.movement.run?.keybind.includes("Shift")) {
            this._runKey = this._shiftKey;
        } else {
            this._runKey = evt.sourceEvent.code === Store.state.controls.movement.run?.keybind ? true : this._runKey;
        }

        // Fly.
        if (evt.sourceEvent.code === Store.state.controls.movement.fly?.keybind) {
            const sceneManager = this._scene.rootNodes.find((node) => node.id === "SceneManager") as GameObject;
            const sceneController = sceneManager.components.get("SceneController") as SceneController | undefined;

            if (this._state.state === State.Fly) {
                this._state.state = State.Idle;
                sceneController?.applyGravity();
            } else {
                this._state.state = State.Fly;
                this._state.action = Action.Fly;
                sceneController?.removeGravity();
            }
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
    }

    private _setMoveAction() {
        if (this._state.state === State.Idle || this._state.state === State.Move) {
            this._state.state = State.Move;
            this._state.action = this._runKey ? Action.RunForward : Action.WalkForward;
            return;
        }

        if (this._state.state === State.Fly) {
            this._state.state = State.Fly;
            this._state.action = Action.Fly;
        }
    }
}
