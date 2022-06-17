import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import {
    AbstractMesh,
    // Skeleton,
    ArcRotateCamera,
    Scene
    // DeviceSourceManager
} from "@babylonjs/core";

import Log from "@Modules/debugging/log";

/* eslint-disable @typescript-eslint/no-magic-numbers */
export class AvatarController {
    private _avatar: AbstractMesh;
    // private _skeleton: Skeleton = null;
    private _camera: ArcRotateCamera;
    private _scene: Scene;
    private _walkSpeed = 2;
    private _movement : BABYLON.Vector3;
    private _rotationSpeed = 10 * Math.PI / 180;
    private _rotation = 0;

    constructor(avatar: BABYLON.Nullable<AbstractMesh>, camera: ArcRotateCamera, scene: Scene) {
        this._avatar = avatar as AbstractMesh;
        this._camera = camera;
        this._scene = scene;
        this._movement = new BABYLON.Vector3();
    }

    public start():void {
        this._scene.registerBeforeRender(this._update.bind(this));
        const canvas = this._scene.getEngine().getRenderingCanvas() as HTMLCanvasElement;
        canvas.addEventListener("keyup", this._onKeyUp.bind(this), false);
        canvas.addEventListener("keydown", this._onKeyDown.bind(this), false);
    }


    private _update():void {
        // eslint-disable-next-line new-cap
        const dt = this._scene.getEngine().getDeltaTime() / 1000;
        const movement = this._movement.scale(dt);
        const rot = this._rotation * dt;

        // eslint-disable-next-line new-cap
        this._avatar.rotate(BABYLON.Vector3.Up(), rot);
        this._avatar.movePOV(movement.x, movement.y, movement.z);
    }

    private _onKeyDown(e: KeyboardEvent) {
        // Log.debug(Log.types.AVATAR, "key down:" + e.key.toLowerCase());
        if (!e.key) {
            return;
        }
        if (e.repeat) {
            return;
        }
        switch (e.key.toLowerCase()) {
            case "space":
                break;

            case "w":
            case "arrowup":
                this._movement.z = -this._walkSpeed;
                break;
            case "a":
            case "arrowleft":
                this._rotation = -this._rotationSpeed;
                break;
            case "d":
            case "arrowright":
                this._rotation = this._rotationSpeed;
                break;
            case "s":
            case "arrowdown":
                Log.debug(Log.types.AVATAR, "move backward");
                this._movement.z = this._walkSpeed;
                break;
            default:

        }
    }

    private _onKeyUp(e: KeyboardEvent) {
        // Log.debug(Log.types.AVATAR, "key up:" + e.key.toLowerCase());
        if (!e.key) {
            return;
        }
        if (e.repeat) {
            return;
        }

        switch (e.key.toLowerCase()) {
            case "space":
                Log.debug(Log.types.AVATAR, "jump");
                break;
            case "w":
            case "arrowup":
                this._movement.z = 0;
                break;
            case "a":
            case "arrowleft":
                this._rotation = 0;
                break;
            case "d":
            case "arrowright":
                this._rotation = 0;
                break;
            case "s":
            case "arrowdown":
                this._movement.z = 0;
                break;
            default:
        }
    }


}
