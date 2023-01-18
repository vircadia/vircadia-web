//
//  inputController.ts
//
//  Created by Nolan Huang on 17 Jun 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    Vector3,
    AnimationGroup,
    Nullable,
    ArcRotateCamera,
    Quaternion,
    Ray,
    Scalar,
    ICameraInput,
    Tools
} from "@babylonjs/core";
import { Animator } from "../animator";
import { GameObject, MeshComponent } from "@Modules/object";
import { ScriptComponent, inspector, inspectorAccessor } from "@Modules/script";
import { AvatarState, Action, JumpSubState, State } from "./avatarState";
import { InputState, CameraMode } from "./inputState";
import { IInputHandler } from "./inputs/inputHandler";
import { KeyboardInput } from "./inputs/keyboardInput";
import { VirtualJoystickInput } from "./inputs/virtualJoystickInput";
import { Store } from "@Store/index";

// General Modules
// import Log from "@Modules/debugging/log";

// This is disabled because TS complains about BABYLON's use of cap'ed function names
/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-magic-numbers */

// Ccustom camera controls.
class ArcRotateCameraCustomInput implements ICameraInput<ArcRotateCamera> {
    camera: ArcRotateCamera;
    _keysPressed = [] as string[];
    sensibility = 0.01;
    _preventDefault = false;

    constructor(camera: ArcRotateCamera) {
        this.camera = camera;
    }

    // eslint-disable-next-line class-methods-use-this
    getClassName(): string {
        return "ArcRotateCameraCustomInput";
    }

    // eslint-disable-next-line class-methods-use-this
    getSimpleName(): string {
        return "customKeyboardRotate";
    }

    _onKeyDown: ((event: KeyboardEvent) => void) | undefined = undefined;

    _onKeyUp: ((event: KeyboardEvent) => void) | undefined = undefined;

    _onLostFocus(): void {
        this._keysPressed = [];
    }

    attachControl(preventDefault: boolean): void {
        this._preventDefault = preventDefault;
        const engine = this.camera.getEngine();
        const element = engine.getInputElement() as HTMLElement;
        if (!this._onKeyDown || !this._onKeyUp) {
            element.tabIndex = 1;
            // Define the keydown event handler.
            this._onKeyDown = (event: KeyboardEvent) => {
                if (this._preventDefault) {
                    event.preventDefault();
                }
                // Prevent any key from being added to the queue more than once.
                const index = this._keysPressed.indexOf(event.code);
                if (index === -1) {
                    this._keysPressed.push(event.code);
                }
            };
            element.addEventListener("keydown", (event) => {
                if (this._onKeyDown) {
                    this._onKeyDown(event);
                }
            }, false);
            // Define the keyup event handler.
            this._onKeyUp = (event: KeyboardEvent) => {
                if (this._preventDefault) {
                    event.preventDefault();
                }
                // Remove the key from the queue.
                const index = this._keysPressed.indexOf(event.code);
                if (index >= 0) {
                    this._keysPressed.splice(index, 1);
                }
            };
            element.addEventListener("keyup", (event) => {
                if (this._onKeyUp) {
                    this._onKeyUp(event);
                }
            }, false);
            // Prevent keys from getting stuck when the window loses focus.
            Tools.RegisterTopRootEvents(window, [
                { name: "blur", handler: () => {
                    this._onLostFocus();
                } }
            ]);
        }
    }

    detachControl() {
        const engine = this.camera.getEngine();
        const element = engine.getInputElement() as HTMLElement;
        if (this._onKeyDown || this._onKeyUp) {
            // Remove all event listeners.
            element.removeEventListener("keydown", (event) => {
                if (this._onKeyDown) {
                    this._onKeyDown(event);
                }
            });
            this._onKeyDown = undefined;
            element.removeEventListener("keyup", (event) => {
                if (this._onKeyUp) {
                    this._onKeyUp(event);
                }
            });
            this._onKeyUp = undefined;
            Tools.UnregisterTopRootEvents(window, [
                { name: "blur", handler: () => {
                    this._onLostFocus();
                } }
            ]);
            this._keysPressed = [];
        }
    }

    checkInputs() {
        if (this._onKeyDown) {
            for (let index = 0; index < this._keysPressed.length; index++) {
                const code = this._keysPressed[index];
                if (Store.state.controls.camera.yawLeft?.keybind === code) {
                    this.camera.alpha -= this.sensibility;
                } else if (Store.state.controls.camera.yawRight?.keybind === code) {
                    this.camera.alpha += this.sensibility;
                } else if (Store.state.controls.camera.pitchUp?.keybind === code) {
                    this.camera.beta += this.sensibility;
                } else if (Store.state.controls.camera.pitchDown?.keybind === code) {
                    this.camera.beta -= this.sensibility;
                }
            }
        }
    }
}


// Input controler.

class CameraObtacleDetectInfo {
    direction = Vector3.Zero();
    length = 0;
    isCameraSanpping = false;
    elapse = 0;
    detectDuration = 0.5;
}

export class InputController extends ScriptComponent {
    private _camera: Nullable<ArcRotateCamera> = null;
    private _cameraSkin = 0.1;
    private _cameraElastic = true;
    private _cameraViewTransitionThreshold = 1.5;
    private _animGroups: Nullable<Array<AnimationGroup>> = null;
    private _animator: Nullable<Animator> = null;
    private _avatarState: AvatarState = new AvatarState();
    private _avatarHeight = 0;
    private _inputState: InputState = new InputState();
    private _input: Nullable<IInputHandler> = null;
    private _isMobile = false;

    @inspector()
    private _defaultCameraTarget = new Vector3(0, 1.7, 0);

    private _defaultCameraAlpha = 0.5 * Math.PI;
    private _defaultCameraBeta = 0.5 * Math.PI;
    private _defaultCameraRadius = 6;
    private _defaultwheelDeltaPercentage = 0.005;

    private _cameraObtacleDetectInfo = new CameraObtacleDetectInfo();

    constructor() {
        super(InputController.typeName);
    }

    public set animGroups(value: AnimationGroup[]) {
        this._animGroups = value;
    }

    public set avatarHeight(value: number) {
        this._avatarHeight = value;
    }

    public set camera(value: Nullable<ArcRotateCamera>) {
        this._camera = value;

        if (this._camera) {
            this._camera.alpha = this._defaultCameraAlpha;
            this._camera.beta = this._defaultCameraBeta;
            this._camera.radius = this._defaultCameraRadius;
            this._camera.minZ = 0.1;
            this._camera.wheelDeltaPercentage = this._defaultwheelDeltaPercentage;
            this._camera.lowerRadiusLimit = 0.001;
            this._camera.upperRadiusLimit = 9;
            this._camera.angularSensibilityX = 5000;
            this._camera.angularSensibilityY = 5000;
            this._camera.checkCollisions = this._inputState.cameraCheckCollisions;
            this._camera.collisionRadius = new Vector3(this._cameraSkin, this._cameraSkin, this._cameraSkin);

            // Remove the default camera controls.
            this._camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput");

            // Bind the custom controls to the camera.
            this._camera.inputs.add(new ArcRotateCameraCustomInput(this._camera));
            this._camera.attachControl(this._scene.getEngine().getRenderingCanvas());
        }
    }

    @inspectorAccessor()
    public set cameraCheckCollisions(value: boolean) {
        this._inputState.cameraCheckCollisions = value;
    }

    public get cameraCheckCollisions() : boolean {
        return this._inputState.cameraCheckCollisions;
    }

    @inspectorAccessor()
    public set cameraElastic(value: boolean) {
        this._inputState.cameraElastic = value;
    }

    public get cameraElastic() : boolean {
        return this._inputState.cameraElastic;
    }

    @inspectorAccessor({ min: 0.1, max: 20 })
    public set walkSpeed(value: number) {
        this._avatarState.walkSpeed = value;
    }

    public get walkSpeed() : number {
        return this._avatarState.walkSpeed;
    }

    @inspectorAccessor({ min: 0.1, max: 20 })
    public set runSpeed(value: number) {
        this._avatarState.runSpeed = value;
    }

    public get runSpeed() : number {
        return this._avatarState.runSpeed;
    }

    @inspectorAccessor({ min: 0.1, max: 20 })
    public set landSpeed(value: number) {
        this._avatarState.landSpeed = value;
    }

    public get landSpeed() : number {
        return this._avatarState.landSpeed;
    }

    @inspectorAccessor({ min: 0.1, max: 20 })
    public set flySpeed(value: number) {
        this._avatarState.flySpeed = value;
    }

    public get flySpeed() : number {
        return this._avatarState.flySpeed;
    }

    public get isTeleported() : boolean {
        return this._avatarState.state === State.Teleport;
    }

    public set isTeleported(value : boolean) {
        if (value) {
            this._avatarState.moveDir = Vector3.Zero();
            this._avatarState.angularVelocity = 0;
            this._avatarState.state = State.Teleport;
            this._avatarState.action = Action.Idle;
        } else {
            this._avatarState.state = State.Idle;
        }

        this._avatarState.duration = 0;
    }

    public get isStopped() : boolean {
        return this._avatarState.state === State.Stop;
    }

    public set isStopped(value: boolean) {
        if (value) {
            this._avatarState.state = State.Stop;
            this._avatarState.action = Action.Idle;
            this._avatarState.moveDir = Vector3.Zero();
            this._avatarState.angularVelocity = 0;
        } else {
            this._avatarState.state = State.Idle;
        }

        this._avatarState.duration = 0;
    }

    // eslint-disable-next-line class-methods-use-this
    public get componentType():string {
        return InputController.typeName;
    }

    static get typeName(): string {
        return "InputController";
    }


    public onInitialize(): void {
        this._animator = new Animator(
            this._gameObject as GameObject,
            this._animGroups as AnimationGroup[]);

        const jumpAnim = this._animator.getAnimationGroup("jump_standing_land_settle_all");
        if (jumpAnim) {
            jumpAnim.onAnimationGroupEndObservable.add(() => {
                this._avatarState.state = State.Idle;
                this._avatarState.action = Action.Idle;
            });
        }

        this._avatarState.state = State.Idle;
        this._avatarState.action = Action.Idle;

        // Test if browser is a mobile device.
        const regexp = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/iu;
        this._isMobile = regexp.test(navigator.userAgent);

        this._inputState.onCameraCheckCollisionChangedObservable.add(() => {
            if (this._camera) {
                this._camera.checkCollisions = this._inputState.cameraCheckCollisions;
            }
        });

        this._inputState.onCameraModeChangedObservable.add(() => {
            if (this._camera && this._camera.lowerRadiusLimit) {
                if (this._inputState.cameraMode === CameraMode.FirstPersion) {
                    this._camera.radius = this._camera.lowerRadiusLimit;
                    this._cameraViewTransitionThreshold = this._camera.lowerRadiusLimit;
                } else {
                    this._camera.radius = this._camera.lowerRadiusLimit + 1.5;
                    this._cameraViewTransitionThreshold = 1.5;
                }
                this.setCameraMode(this._inputState.cameraMode);
            }
        });

        this._inputState.onCameraElasticChangedObservable.add(() => {
            this._cameraElastic = this._inputState.cameraElastic;
        });

        this._inputState.onInputModeChangedObservable.add(() => {
            // console.log("onInputModeChangedObservable", this._inputState.inputMode);
        });
    }


    public onStart():void {
        this._attachControl();
    }

    public onStop():void {
        this._detachControl();
    }

    public onUpdate():void {
        const delta = this._scene.getEngine().getDeltaTime() / 1000;

        this._handleInput(delta);

        this._inputState.update();

        this._updateAvatar(delta);

        this._updateCamera(delta);
    }

    private _updateAvatar(delta : number) {
        switch (this._avatarState.state) {
            case State.Idle:
                this._doIdle(delta);
                break;
            case State.Move:
                this._doMove(delta);
                break;
            case State.Jump:
                this._doJump(delta);
                break;
            case State.Fly:
                this._doFly(delta);
                break;
            case State.Teleport:
                this._doTeleport(delta);
                break;
            case State.Stop:
                this._doStop(delta);
                break;
            default:
        }

        this._animateAvatar();
    }

    private _attachControl() {
        // TODO: Make this configurable later as a selected input type rather, influenced by mobile by default.
        if (this._isMobile) {
            this._input = new VirtualJoystickInput(this._avatarState, this._scene);
        } else {
            this._input = new KeyboardInput(this._avatarState, this._inputState, this._scene);
        }

        this._input.attachControl();
    }

    private _detachControl() {
        if (this._input) {
            this._input.detachControl();
            this._input = null;
        }
    }

    private _handleInput(delta : number) {
        if (this._input) {
            this._input.handleInputs(delta);
        }
    }

    private _doStop(delta : number) {
        this._avatarState.duration += delta;
        if (this._avatarState.duration > 5.0) {
            if (this._avatarState.moveDir.x !== 0 || this._avatarState.moveDir.z !== 0) {
                this._avatarState.state = State.Idle;
            }
        }
    }

    private _doTeleport(delta : number) {
        this._avatarState.duration += delta;
        if (this._avatarState.duration > 1) {
            if (this._avatarState.moveDir.x !== 0 || this._avatarState.moveDir.z !== 0) {
                this._avatarState.state = State.Idle;
            }
        }
    }

    private _doIdle(delta : number) {
        this._avatarState.moveDir.x = 0;
        this._avatarState.moveDir.z = 0;
        this._avatarState.currentSpeed = 0;

        if (this._avatarState.action !== Action.Idle) {
            this._avatarState.action = Action.Idle;
        }

        // Reset the avatar's rotation (so that they are standing up).
        if (this._gameObject && this._gameObject.rotationQuaternion) {
            this._gameObject.rotationQuaternion.x = 0;
            this._gameObject.rotationQuaternion.z = 0;
        }
    }

    private _doJump(delta : number) {
        if (!this._gameObject || !this._gameObject.physicsImpostor) {
            return;
        }

        this._avatarState.duration += delta;

        switch (this._avatarState.jumpSubstate) {
            case JumpSubState.None:
                // Reset all jump-related variables.
                this._avatarState.isRunning = false;
                this._avatarState.duration = 0;
                this._avatarState.canImpluse = true;
                this._avatarState.landingDuration = 0;
                this._avatarState.jumpInPlace = false;
                // Reset the avatar's state back to Idle, ready for other actions.
                this._avatarState.state = State.Idle;
                this._avatarState.action = Action.Idle;
                break;
            case JumpSubState.Start:
                // Use the appropriate movement velocity if the avatar was running before the jump.
                this._avatarState.isRunning = this._avatarState.action === Action.RunForward;
                // Change to the next jump substate.
                this._avatarState.action = Action.Jump;
                this._avatarState.jumpSubstate = JumpSubState.Jumping;
                break;
            case JumpSubState.Jumping:
                // Boost the avatar into the air.
                if (this._avatarState.canImpluse) {
                    this._gameObject.physicsImpostor.applyImpulse(Vector3.Up().scale(this._avatarState.jumpImpluse),
                        this._gameObject.getAbsolutePosition());
                }
                // Prevent the impulse from firing more than once.
                this._avatarState.canImpluse = false;
                // Change to the next jump substate.
                this._avatarState.jumpSubstate = JumpSubState.Rising;
                break;
            case JumpSubState.Rising:
                {
                    // Allow the avatar to move in the air.
                    this._doMoveInJumping(delta);
                    const velocity = this._gameObject.physicsImpostor.getLinearVelocity();
                    // Change to the next jump substate once the avatar has started falling.
                    if (velocity && velocity.y < 0) {
                        this._avatarState.jumpSubstate = JumpSubState.Falling;
                        this._avatarState.previousPosY = this.position.y;
                    }
                }
                break;
            case JumpSubState.Falling:
                // Allow the avatar to move in the air.
                this._doMoveInJumping(delta);
                // Move to the nxt jump substate once the avatar touches the ground.
                if (this._detectGround()
                    || Math.abs(this._avatarState.previousPosY - this._gameObject.position.y) < 0.001) {
                    this._avatarState.jumpSubstate = JumpSubState.Landing;
                    this._avatarState.action = Action.Land;
                }
                this._avatarState.previousPosY = this._gameObject.position.y;
                break;
            case JumpSubState.Landing:
                this._avatarState.landingDuration += delta;
                if (
                    // End the landing animation if the avatar is moving.
                    (this._avatarState.moveDir.x !== 0 || this._avatarState.moveDir.z !== 0 || this._avatarState.jumpInPlace)
                    // With a small delay to smooth the transition.
                    && this._avatarState.landingDuration >= 0.15
                    // Or, once the landing animation has finished.
                    || this._avatarState.landingDuration >= 2.2
                ) {
                    this._avatarState.jumpSubstate = JumpSubState.None;
                }
                break;

            default:
                break;
        }
    }

    private _doFly(delta : number) {
        if (!this._gameObject || !this._camera) {
            return;
        }

        // Rotate the avatar relative to the yaw direction of the camera.
        const yawRotation = this._defaultCameraAlpha - this._camera.alpha;
        // Rotate the avatar relative to the pitch direction of the camera.
        const pitchRotation = this._camera.beta - this._defaultCameraBeta;
        Quaternion.FromEulerAnglesToRef(pitchRotation, yawRotation, 0, this._gameObject.rotationQuaternion as Quaternion);

        if (this._avatarState.moveDir.x !== 0 || this._avatarState.moveDir.z !== 0) {
            this._getCurrentSpeed();
            const velcoity = this._gameObject.calcMovePOV(this._avatarState.moveDir.x, 0, -this._avatarState.moveDir.z)
                .normalize()
                .scale(this._avatarState.currentSpeed * delta);
            this._gameObject.position.addInPlace(velcoity);
        }
    }

    private _doMove(delta : number) {
        if (!this._gameObject || !this._camera) {
            return;
        }

        // Rotate the avatar relative to the yaw direction of the camera.
        const angle = Vector3.GetAngleBetweenVectors(
            this._avatarState.moveDir.normalize(), Vector3.Forward(true), Vector3.Up());
        const rotation = this._defaultCameraAlpha + angle - this._camera.alpha;
        Quaternion.FromEulerAnglesToRef(0, rotation, 0, this._gameObject.rotationQuaternion as Quaternion);

        this._getCurrentSpeed();
        const velcoity = this._gameObject.calcMovePOV(0, 0, 1).normalize()
            .scale(this._avatarState.currentSpeed * delta);
        this._gameObject.position.addInPlace(velcoity);
    }

    private _doMoveInJumping(delta : number) {
        if (this._avatarState.moveDir.x !== 0 || this._avatarState.moveDir.z !== 0) {
            this._doMove(delta);
        }
    }

    private _getCurrentSpeed() : void {
        let speed = 0;
        switch (this._avatarState.action) {
            case Action.Idle:
                speed = 0;
                break;
            case Action.RunForward:
                speed = this._avatarState.runSpeed;
                break;
            case Action.Jump:
                speed = this._avatarState.isRunning ? this._avatarState.runSpeed : this._avatarState.walkSpeed;
                break;
            case Action.Land:
                speed = this._avatarState.landSpeed;
                break;
            case Action.Fly:
                speed = this._avatarState.flySpeed;
                break;
            default:
                speed = this._avatarState.walkSpeed;
        }

        this._avatarState.currentSpeed = Scalar.Lerp(Math.abs(this._avatarState.currentSpeed), speed, 0.1);
    }

    private _animateAvatar() {
        if (!this._animator) {
            return;
        }

        let anim = "idle02";
        switch (this._avatarState.action) {
            case Action.WalkForward:
                anim = "walk_fwd";
                break;
            case Action.RunForward:
                anim = "run_fast_fwd";
                break;
            case Action.WalkBackward:
                anim = "walk_bwd";
                break;
            case Action.WalkLeft:
                anim = "walk_left";
                break;
            case Action.WalkRight:
                anim = "walk_right";
                break;
            case Action.TurnLeft:
                anim = "turn_left";
                break;
            case Action.TurnRight:
                anim = "turn_right";
                break;
            case Action.Jump:
                anim = "jump_standing_apex_all";
                break;
            case Action.Land:
                anim = "jump_standing_land_settle_all";
                break;
            case Action.Fly:
                anim = "fly";
                break;
            case Action.Sit:
                anim = "sitting_crosslegged";
                break;
            default:
                anim = "idle02";
        }

        this._animator.play(anim);
        this._animator.update();
    }

    private _updateCamera(delta : number) : void {
        if (!this._camera || !this._gameObject) {
            return;
        }

        // Make the camera follow the avatar.
        this._defaultCameraTarget.y = this._avatarHeight;
        this._gameObject.position.addToRef(this._defaultCameraTarget, this._camera.target);

        // Update the FOV.
        this._camera.fov = Store.state.graphics.fieldOfView / 100;

        if (this._camera.lowerRadiusLimit) {
            if (this._cameraElastic) {
                this._snapCamera(delta);
            }

            const cameraMode = this._camera.radius <= this._cameraViewTransitionThreshold
                ? CameraMode.FirstPersion
                : CameraMode.ThirdPersion;
            if (cameraMode === CameraMode.FirstPersion) {
                this._cameraViewTransitionThreshold = this._camera.lowerRadiusLimit;
                this._camera.wheelDeltaPercentage = 1.0;
            } else {
                this._cameraViewTransitionThreshold = 1.5;
                this._camera.wheelDeltaPercentage = this._defaultwheelDeltaPercentage;
            }
            if (cameraMode !== this._inputState.cameraMode) {
                this.setCameraMode(cameraMode);
                this._inputState.cameraMode = cameraMode;
            }
        }
    }

    private _snapCamera(delta : number) : void {
        if (!this._camera || !this._camera.lowerRadiusLimit) {
            return;
        }

        this._cameraObtacleDetectInfo.elapse += delta;
        if (this._cameraObtacleDetectInfo.elapse < this._cameraObtacleDetectInfo.detectDuration) {
            return;
        }
        this._cameraObtacleDetectInfo.elapse -= this._cameraObtacleDetectInfo.detectDuration;

        let isCameraObstructed = false;
        if (this._camera.radius > this._camera.lowerRadiusLimit) {
            // detect whether camera obstructed
            const avatarToCamera = this._camera.position.subtract(this._camera.target);
            const length = avatarToCamera.length();
            const dir = avatarToCamera.normalize();
            const ray = new Ray(this._camera.target, dir, length);

            const pickInfo = this._scene.pickWithRay(ray);
            if (pickInfo && pickInfo.hit && pickInfo.pickedPoint) {
                if (!this._cameraObtacleDetectInfo.isCameraSanpping) {
                    // store camera state before camera is snapped
                    this._camera.storeState();
                    this._cameraObtacleDetectInfo.length = length;
                    this._cameraObtacleDetectInfo.direction = dir;
                    this._cameraObtacleDetectInfo.isCameraSanpping = true;
                }

                if (this._camera.checkCollisions) {
                    const newPos = this._camera.target.subtract(pickInfo.pickedPoint).normalize()
                        .scale(this._cameraSkin);
                    pickInfo.pickedPoint.addToRef(newPos, this._camera.position);
                } else {
                    this._camera.radius = pickInfo.pickedPoint.subtract(this._camera.target).length() - this._cameraSkin;
                }

                isCameraObstructed = true;
            }
        }

        if (!isCameraObstructed && this._cameraObtacleDetectInfo.isCameraSanpping) {
            // detect whether camera original position still obstructed or not
            const pickInfo = this._scene.pickWithRay(new Ray(this._camera.target,
                this._cameraObtacleDetectInfo.direction,
                this._cameraObtacleDetectInfo.length + this._cameraSkin));

            if (!pickInfo || !pickInfo.hit) {
                if (this._camera.checkCollisions) {
                    const cameraToAvatar = this._camera.target.subtract(this._camera.position).normalize();
                    this._camera.target.addToRef(
                        this._cameraObtacleDetectInfo.direction.scale(this._cameraObtacleDetectInfo.length),
                        this._camera.position);
                } else {
                    const target = this._camera.target.clone();
                    this._camera._restoreStateValues();
                    this._camera.target = target;
                }

                const vec = this._cameraObtacleDetectInfo.direction.scale(this._cameraObtacleDetectInfo.length);
                this._cameraObtacleDetectInfo.isCameraSanpping = false;
            }
        }
    }

    private _detectGround() : boolean {
        if (this._gameObject) {
            // position the raycast from bottom center of mesh
            const raycastPosition = this._gameObject.position.clone();

            const ray = new Ray(raycastPosition, Vector3.Down(), 1.3);

            const pick = this._scene.pickWithRay(ray, (mesh) => mesh.isPickable);

            if (pick && pick.hit && pick.pickedPoint && pick.pickedMesh) { // grounded
                return true;
            }
        }

        return false;
    }

    public setCameraMode(mode : CameraMode) : void {
        if (!this._gameObject || !this._camera) {
            return;
        }

        if (mode === CameraMode.FirstPersion) {
            this._setAvatarVisible(false);
            this._camera.checkCollisions = false;
        } else {
            this._setAvatarVisible(true);
            this._camera.checkCollisions = this._inputState.cameraCheckCollisions;
        }
    }

    public _setAvatarVisible(visible : boolean) : void {
        if (!this._gameObject) {
            return;
        }
        this._gameObject.isVisible = visible;
        // name tag
        const meshes = this._gameObject.getChildMeshes(true, (mesh) => mesh.name === "Nametag");
        if (meshes.length > 0) {
            meshes[0].isVisible = visible;
        }

        const meshComp = this._gameObject.getComponent(MeshComponent.typeName) as MeshComponent;
        if (meshComp) {
            meshComp.visible = visible;
        }
    }

}
