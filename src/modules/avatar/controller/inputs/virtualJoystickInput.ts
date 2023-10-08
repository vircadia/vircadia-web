//
//  virtualJoystickInput.ts
//
//  Created by Nolan Huang on 17 Oct 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { watch, type WatchStopHandle } from "vue";
import { Scene, Nullable, ArcRotateCamera } from "@babylonjs/core";
import { AvatarState, Action, State } from "../avatarState";
import type { IInputHandler } from "./inputHandler";
import { VirtualJoystick } from "./virtualJoystick";
import { applicationStore } from "@Base/stores";

// This is disabled because TS complains about BABYLON's use of capitalized function names.
/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-magic-numbers */

export class VirtualJoystickInput implements IInputHandler {

    private _state: AvatarState;

    private _scene: Scene;
    private _camera: Nullable<ArcRotateCamera> = null;

    private _leftJoystick: Nullable<VirtualJoystick> = null;
    private _rightJoystick: Nullable<VirtualJoystick> = null;
    private _cameraAngularSpeed = 0.1;
    private _cameraJoystickThreshold = 0.2;
    private _themeWatcher: Nullable<WatchStopHandle> = null;

    static readonly ZINDEX = "5";

    constructor(state: AvatarState, scene: Scene) {
        this._state = state;
        this._scene = scene;
        this._camera = this._scene._activeCamera as ArcRotateCamera;
    }

    public attachControl(): void {
        this._leftJoystick = new VirtualJoystick(true, { alwaysVisible: true });
        this._leftJoystick.alwaysVisible = true;
        this._leftJoystick.setJoystickColor(applicationStore.theme.colors.primary);

        this._rightJoystick = new VirtualJoystick(false);
        this._rightJoystick.setJoystickColor(applicationStore.theme.colors.secondary);

        this._themeWatcher = watch(
            () => applicationStore.theme.colors,
            () => {
                this._leftJoystick?.setJoystickColor(applicationStore.theme.colors.primary);
                this._rightJoystick?.setJoystickColor(applicationStore.theme.colors.secondary);
            },
            { deep: true }
        );

        if (VirtualJoystick.Canvas) {
            VirtualJoystick.Canvas.style.zIndex = VirtualJoystickInput.ZINDEX;
        }
    }

    public detachControl(): void {
        this._leftJoystick?.releaseCanvas();
        this._leftJoystick = null;
        this._rightJoystick?.releaseCanvas();
        this._rightJoystick = null;
        this._themeWatcher?.();
    }

    public handleInputs(delta: number): void {
        if (!this._leftJoystick || !this._rightJoystick) {
            return;
        }

        if (this._leftJoystick.pressed) {
            this._state.state = State.Move;
            this._state.action = Action.WalkForward;
            this._state.moveDir.x = -this._leftJoystick.deltaPosition.x;
            this._state.moveDir.z = -this._leftJoystick.deltaPosition.y;
        } else {
            this._state.state = State.Idle;
            this._state.action = Action.Idle;
        }

        if (this._rightJoystick.pressed && this._camera) {
            if (this._rightJoystick.deltaPosition.x < -this._cameraJoystickThreshold) {
                this._camera.inertialAlphaOffset += this._cameraAngularSpeed * delta;
            } else if (this._rightJoystick.deltaPosition.x > this._cameraJoystickThreshold) {
                this._camera.inertialAlphaOffset -= this._cameraAngularSpeed * delta;
            } else if (this._rightJoystick.deltaPosition.y > this._cameraJoystickThreshold) {
                this._camera.inertialBetaOffset += this._cameraAngularSpeed * delta;
            } else if (this._rightJoystick.deltaPosition.y < -this._cameraJoystickThreshold) {
                this._camera.inertialBetaOffset -= this._cameraAngularSpeed * delta;
            }
        }
    }
}
