import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import {
    Mesh,
    Skeleton,
    ArcRotateCamera,
    Scene,
    ActionManager,
    ExecuteCodeAction
} from "@babylonjs/core";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Log from "@Modules/debugging/log";


/* eslint-disable @typescript-eslint/no-magic-numbers */
export class AvatarController {
    private _avatar: Mesh;
    private _skeleton: Skeleton;
    private _camera: ArcRotateCamera;
    private _scene: Scene;
    private _walkSpeed = 2;
    private _movement : BABYLON.Vector3;
    private _rotationSpeed = 20 * Math.PI / 180;
    private _rotation = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private _inputMap : any;
    // private _idleAni : AnimationGroup;
    // private _idleToWalkAni : AnimationGroup;

    constructor(avatar: Mesh, skeleton: Skeleton, camera: ArcRotateCamera, scene: Scene) {
        this._avatar = avatar;
        this._skeleton = skeleton;
        this._camera = camera;
        this._scene = scene;
        this._movement = new BABYLON.Vector3();
        this._inputMap = {};
        // this._idleAni = this._scene.getAnimationGroupByName("idle") as AnimationGroup;
        // this._idleToWalkAni = this._scene.getAnimationGroupByName("idle_to_walk") as AnimationGroup;
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
        /*
        const targetedAnimations = this._idleToWalkAni.targetedAnimations;
        // console.log(targetedAnimations);

        for (let i = 0; i < targetedAnimations.length; i++) {
            const targetAni = targetedAnimations[i];
            const target = targetAni.target as Mesh;
            // Log.debug(Log.types.AVATAR, "target:" + target.name);
            this._avatar.getChildren((node) => {
                if (target.name === node.name) {
                    Log.debug(Log.types.AVATAR, "apply:" + target.name);
                    targetAni.target = node;
                    return true;
                }
                return false;
            }, false);

        }

        // Log.debug(Log.types.AVATAR, `paly idle_to_walk form ${this._idleToWalkAni.from} to ${this._idleToWalkAni.to}`);
        this._idleToWalkAni.start(true, 1.0, this._idleToWalkAni.from, this._idleToWalkAni.to, false);
*/
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
        this._avatar.rotate(BABYLON.Vector3.Up(), rot);
        this._avatar.movePOV(movement.x, movement.y, movement.z);
    }
}
