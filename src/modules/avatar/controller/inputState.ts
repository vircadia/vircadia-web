//
//  inputMode.ts
//
//  Created by Nolan Huang on 11 Nov 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { Observable } from "@babylonjs/core";

export enum CameraMode {
    FirstPerson,
    ThirdPerson
}

export enum InputMode {
    Interactive,
    Detached
}

export interface IInputStateProperty {
    update(): void;
}

export class InputStateProperty<T> implements IInputStateProperty {
    private _value: T;
    private _isDirty = false;

    private _observable: Observable<T> = new Observable<T>();

    constructor(value: T) {
        this._value = value;
    }

    public get value(): T {
        return this._value;
    }

    public set value(value: T) {
        if (this._value !== value) {
            this._value = value;
            this._isDirty = true;
        }
    }

    public get observable(): Observable<T> {
        return this._observable;
    }

    public update(): void {
        if (this._isDirty) {
            this._observable.notifyObservers(this._value);
            this._isDirty = false;
        }
    }
}


export class InputState {
    private _cameraCheckCollisions = new InputStateProperty(true);
    private _cameraMode = new InputStateProperty(CameraMode.ThirdPerson);
    private _cameraElastic = new InputStateProperty(true);
    private _inputMode = new InputStateProperty(InputMode.Interactive);
    private _properties = new Array<IInputStateProperty>();

    constructor() {
        this._properties.push(this._cameraCheckCollisions);
        this._properties.push(this._cameraMode);
        this._properties.push(this._inputMode);
        this._properties.push(this._cameraElastic);
    }

    public get cameraCheckCollisions(): boolean {
        return this._cameraCheckCollisions.value;
    }

    public set cameraCheckCollisions(value: boolean) {
        this._cameraCheckCollisions.value = value;
    }

    public get onCameraCheckCollisionChangedObservable(): Observable<boolean> {
        return this._cameraCheckCollisions.observable;
    }

    public get cameraMode(): CameraMode {
        return this._cameraMode.value;
    }

    public set cameraMode(value: CameraMode) {
        this._cameraMode.value = value;
    }

    public get onCameraModeChangedObservable(): Observable<CameraMode> {
        return this._cameraMode.observable;
    }

    public get cameraElastic(): boolean {
        return this._cameraElastic.value;
    }

    public set cameraElastic(value: boolean) {
        this._cameraElastic.value = value;
    }

    public get onCameraElasticChangedObservable(): Observable<boolean> {
        return this._cameraElastic.observable;
    }

    public get inputMode(): InputMode {
        return this._inputMode.value;
    }

    public set inputMode(value: InputMode) {
        this._inputMode.value = value;
    }

    public get onInputModeChangedObservable(): Observable<InputMode> {
        return this._inputMode.observable;
    }

    public update(): void {
        this._properties.forEach((prop) => {
            prop.update();
        });
    }
}
