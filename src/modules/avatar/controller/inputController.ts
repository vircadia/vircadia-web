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

// This is disabled because TS complains about BABYLON's use of capitalized function names.
/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-magic-numbers */

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
import { AvatarState, Action, JumpSubState, State, AnimationMap } from "./avatarState";
import { InputState, CameraMode } from "./inputState";
import { IInputHandler } from "./inputs/inputHandler";
import { KeyboardInput } from "./inputs/keyboardInput";
import { VirtualJoystickInput } from "./inputs/virtualJoystickInput";
import { applicationStore, userStore } from "@Stores/index";
import { Renderer } from "@Modules/scene";
import { MouseSettingsController } from "@Modules/avatar/controller/inputs/mouseSettings";
import { Hysteresis } from "@Modules/utility/hysteresis";
import { IglooCamera } from "@Modules/apps/igloo/Igloo.js";

// Custom camera controls.
class ArcRotateCameraCustomInput implements ICameraInput<ArcRotateCamera> {
    className = "ArcRotateCameraCustomInput";
    simpleName = "customKeyboardRotate";
    camera: ArcRotateCamera;
    _keysPressed = new Array<string>();
    sensibility = 0.01;
    _preventDefault = false;

    constructor(camera: ArcRotateCamera) {
        this.camera = camera;
    }

    getClassName(): string {
        return this.className;
    }

    getSimpleName(): string {
        return this.simpleName;
    }

    _onKeyDown: ((event: KeyboardEvent) => void) | undefined = undefined;

    _onKeyUp: ((event: KeyboardEvent) => void) | undefined = undefined;

    _onLostFocus(): void {
        this._keysPressed = [];
    }

    attachControl(preventDefault: boolean): void {
        this._preventDefault = preventDefault;
        const engine = this.camera.getEngine();
        const element = engine.getInputElement();
        if (!this._onKeyDown || !this._onKeyUp) {
            if (element) {
                element.tabIndex = 1;
            }
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
            element?.addEventListener("keydown", (event) => {
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
            element?.addEventListener("keyup", (event) => {
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

    detachControl(): void {
        const engine = this.camera.getEngine();
        const element = engine.getInputElement();
        if (this._onKeyDown || this._onKeyUp) {
            // Remove all event listeners.
            element?.removeEventListener("keydown", (event) => {
                if (this._onKeyDown) {
                    this._onKeyDown(event);
                }
            });
            this._onKeyDown = undefined;
            element?.removeEventListener("keyup", (event) => {
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

    checkInputs(): void {
        if (this._onKeyDown) {
            for (let index = 0; index < this._keysPressed.length; index++) {
                const code = this._keysPressed[index];
                if (userStore.controls.keyboard.camera.yawLeft?.keycode === code) {
                    this.camera.alpha -= this.sensibility;
                } else if (userStore.controls.keyboard.camera.yawRight?.keycode === code) {
                    this.camera.alpha += this.sensibility;
                } else if (userStore.controls.keyboard.camera.pitchUp?.keycode === code) {
                    this.camera.beta += this.sensibility;
                } else if (userStore.controls.keyboard.camera.pitchDown?.keycode === code) {
                    this.camera.beta -= this.sensibility;
                }
            }
        }
    }
}


// Input controller.

class CameraObstacleDetectInfo {
    direction = Vector3.Zero();
    length = 0;
    isCameraSnapping = false;
    elapse = 0;
    detectDuration = 0.5;
}

export class InputController extends ScriptComponent {
    private _camera: Nullable<ArcRotateCamera> = null;
    private _cameraSkin = 0.1;
    private _cameraElastic = true;
    private _cameraViewTransitionThreshold = 1.5;
    private _cameraHeightHysteresis: Nullable<Hysteresis> = null;
    private _animGroups = new Array<AnimationGroup>();
    private _animator: Nullable<Animator> = null;
    private _avatarState = new AvatarState();
    private _avatarHeight = 0;
    private _avatarRoot: Nullable<Vector3> = null;
    private _inputState = new InputState();
    private _input: Nullable<IInputHandler> = null;
    private _isMobile = false;

    @inspector()
    private _defaultCameraTarget = new Vector3(0, 1.7, 0);

    private _defaultCameraAlpha = 0.5 * Math.PI;
    private _defaultCameraBeta = 0.5 * Math.PI;
    private _defaultCameraRadius = 6;
    private _defaultwheelDeltaPercentage = 0.005;

    private _cameraObstacleDetectInfo = new CameraObstacleDetectInfo();

    constructor() {
        super(InputController.typeName);
    }

    public set animGroups(value: AnimationGroup[]) {
        this._animGroups = value;
    }

    /**
     * The height of the avatar model.
     */
    public set avatarHeight(value: number) {
        this._avatarHeight = value;
    }

    /**
     * The root vector of the avatar model.
     */
    public set avatarRoot(value: Vector3) {
        this._avatarRoot = value;
    }

    public set camera(value: Nullable<ArcRotateCamera>) {
        this._camera = value;

        if (this._camera) {
            this._camera.alpha = this._defaultCameraAlpha;
            this._camera.beta = this._defaultCameraBeta;
            this._camera.radius = this._defaultCameraRadius;
            this._camera.minZ = 0.1;
            this._camera.maxZ = 250000;
            this._camera.wheelDeltaPercentage = this._defaultwheelDeltaPercentage;
            this._camera.lowerRadiusLimit = 0.001;
            this._camera.upperRadiusLimit = 9;
            this._camera.angularSensibilityX = MouseSettingsController.sensitivityComponents.angularSensibilityX;
            this._camera.angularSensibilityY = MouseSettingsController.sensitivityComponents.angularSensibilityY;
            this._camera.inertia = MouseSettingsController.sensitivityComponents.inertia;
            this._camera.checkCollisions = this._inputState.cameraCheckCollisions;
            this._camera.collisionRadius = new Vector3(this._cameraSkin, this._cameraSkin, this._cameraSkin);

            MouseSettingsController.on("sensitivity", (eventValue) => {
                if (this._camera) {
                    this._camera.angularSensibilityX = eventValue.angularSensibilityX;
                    this._camera.angularSensibilityY = eventValue.angularSensibilityY;
                    this._camera.inertia = eventValue.inertia;
                }
            });

            this._cameraHeightHysteresis = new Hysteresis(
                () => (this._avatarRoot?.y ?? this._avatarHeight / 2) + this._avatarHeight / 2,
                100,
                0.1
            );

            // Remove the default camera controls.
            this._camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput");

            // Bind the custom controls to the camera.
            this._camera.inputs.add(new ArcRotateCameraCustomInput(this._camera));
            this._camera.attachControl(this._scene.getEngine().getRenderingCanvas());

            // FIXME: Toss this into an app module.
            if (window.useIgloo) {
                window.IglooCameraInstance = new IglooCamera(null, this._scene);
            }
        }
    }

    @inspectorAccessor()
    public set cameraCheckCollisions(value: boolean) {
        this._inputState.cameraCheckCollisions = value;
    }

    public get cameraCheckCollisions(): boolean {
        return this._inputState.cameraCheckCollisions;
    }

    @inspectorAccessor()
    public set cameraElastic(value: boolean) {
        this._inputState.cameraElastic = value;
    }

    public get cameraElastic(): boolean {
        return this._inputState.cameraElastic;
    }

    @inspectorAccessor({ min: 0.1, max: 20 })
    public set walkSpeed(value: number) {
        this._avatarState.walkSpeed = value;
    }

    public get walkSpeed(): number {
        return this._avatarState.walkSpeed;
    }

    @inspectorAccessor({ min: 0.1, max: 20 })
    public set runSpeed(value: number) {
        this._avatarState.runSpeed = value;
    }

    public get runSpeed(): number {
        return this._avatarState.runSpeed;
    }

    @inspectorAccessor({ min: 0.1, max: 20 })
    public set landSpeed(value: number) {
        this._avatarState.landSpeed = value;
    }

    public get landSpeed(): number {
        return this._avatarState.landSpeed;
    }

    @inspectorAccessor({ min: 0.1, max: 20 })
    public set flySpeed(value: number) {
        this._avatarState.flySpeed = value;
    }

    public get flySpeed(): number {
        return this._avatarState.flySpeed;
    }

    public get isTeleported(): boolean {
        return this._avatarState.state === State.Teleport;
    }

    public set isTeleported(value: boolean) {
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

    public get isStopped(): boolean {
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
    public get componentType(): string {
        return InputController.typeName;
    }

    static get typeName(): string {
        return "InputController";
    }


    public onInitialize(): void {
        this._animator = new Animator(this._gameObject as GameObject, this._animGroups);

        // Jump animation-end handler.
        const jumpAnim = this._animator.getAnimationGroup("jump_standing_land_settle_all");
        jumpAnim?.onAnimationGroupEndObservable.add(() => {
            this._avatarState.state = State.Idle;
            this._avatarState.action = Action.Idle;
        });

        // Clap animation-end handler.
        const clapAnim = this._animator.getAnimationGroup("emote_clap01_all");
        clapAnim?.onAnimationGroupEndObservable.add(() => {
            this._avatarState.state = State.Idle;
            this._avatarState.action = Action.Idle;
        });

        // Salute animation-end handler.
        const saluteAnim = this._animator.getAnimationGroup("salute");
        saluteAnim?.onAnimationGroupEndObservable.add(() => {
            this._avatarState.state = State.Idle;
            this._avatarState.action = Action.Idle;
        });

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
                if (this._inputState.cameraMode === CameraMode.FirstPerson) {
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


    public onStart(): void {
        this._attachControl();
    }

    public onStop(): void {
        this._detachControl();
    }

    public onUpdate(): void {
        const delta = this._scene.getEngine().getDeltaTime() / 1000;

        this._handleInput(delta);

        this._inputState.update();

        this._updateAvatar(delta);

        this._updateCamera(delta);
    }

    private _updateAvatar(delta: number): void {
        applicationStore.interactions.isInteracting = false;
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
            case State.Pose:
                this._doPose(delta);
                break;
            case State.Stop:
                this._doStop(delta);
                break;
            default:
        }

        this._animateAvatar();
    }

    private _attachControl(): void {
        // TODO: Make this configurable as a selected input type, influenced by mobile by default.
        if (this._isMobile && !(this._input instanceof VirtualJoystickInput)) {
            this._input?.detachControl();
            this._input = new VirtualJoystickInput(this._avatarState, this._scene);
            this._input.attachControl();
        } else if (!(this._input instanceof KeyboardInput)) {
            this._input?.detachControl();
            this._input = new KeyboardInput(this._avatarState, this._inputState, this._scene);
            this._input.attachControl();
        }
    }

    private _detachControl(): void {
        if (this._input) {
            this._input.detachControl();
            this._input = null;
        }
    }

    private _handleInput(delta: number): void {
        if (this._input) {
            this._input.handleInputs(delta);
        }
    }

    private _doStop(delta: number): void {
        this._avatarState.duration += delta;
        if (this._avatarState.duration > 5.0) {
            if (this._avatarState.moveDir.x !== 0 || this._avatarState.moveDir.z !== 0) {
                this._avatarState.state = State.Idle;
            }
        }
    }

    private _doPose(delta: number): void {
        applicationStore.interactions.isInteracting = true;
        this._avatarState.duration += delta;
        if (this._avatarState.duration > 0.5) {
            if (this._avatarState.moveDir.x === 0 && this._avatarState.moveDir.z === 0) {
                return;
            }
            this._avatarState.state = State.Idle;
            Renderer.getScene().sceneController?.applyGravity();
        }
    }

    private _doTeleport(delta: number): void {
        this._avatarState.duration += delta;
        if (this._avatarState.duration > 1) {
            if (this._avatarState.moveDir.x !== 0 || this._avatarState.moveDir.z !== 0) {
                this._avatarState.state = State.Idle;
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _doIdle(delta: number): void {
        this._avatarState.moveDir.x = 0;
        this._avatarState.moveDir.z = 0;
        this._avatarState.currentSpeed = 0;

        if (this._avatarState.action !== Action.Idle) {
            this._avatarState.action = Action.Idle;
            this._avatarState.state = State.Idle;
            this._avatarState.jumpSubstate = JumpSubState.None;
        }

        // Reset the avatar's rotation (so that it is standing up).
        if (this._gameObject && this._gameObject.rotationQuaternion) {
            this._gameObject.rotationQuaternion.x = 0;
            this._gameObject.rotationQuaternion.z = 0;
        }

        // Rotate the avatar to follow the yaw direction of the camera.
        if (this._camera && this._gameObject && this._inputState.cameraMode === CameraMode.FirstPerson) {
            const angle = Vector3.GetAngleBetweenVectors(
                this._avatarState.moveDir.normalize(),
                Vector3.Forward(true),
                Vector3.Up()
            );
            const rotation = this._defaultCameraAlpha + angle - this._camera.alpha + Math.PI / 2;
            Quaternion.FromEulerAnglesToRef(0, rotation, 0, this._gameObject.rotationQuaternion as Quaternion);
        }
    }

    private _doJump(delta: number): void {
        if (this._avatarState.state === State.Fly) {
            return;
        }

        if (!this._gameObject || !this._gameObject.physicsImpostor) {
            return;
        }

        // Reset the avatar's rotation (so that it is standing upright).
        if (this._gameObject && this._gameObject.rotationQuaternion) {
            this._gameObject.rotationQuaternion.x = 0;
            this._gameObject.rotationQuaternion.z = 0;
        }

        Renderer.getScene().sceneController?.applyGravity();

        this._avatarState.duration += delta;

        switch (this._avatarState.jumpSubstate) {
            case JumpSubState.None:
                // Reset all jump-related variables.
                this._avatarState.isRunning = false;
                this._avatarState.duration = 0;
                this._avatarState.canImpulse = true;
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
                if (this._avatarState.canImpulse) {
                    this._gameObject.physicsImpostor.applyImpulse(Vector3.Up().scale(this._avatarState.jumpImpulse),
                        this._gameObject.getAbsolutePosition());
                }
                // Prevent the impulse from firing more than once.
                this._avatarState.canImpulse = false;
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
                // Move to the next jump substate once the avatar touches the ground or stops falling.
                if (this._detectGround() || Math.abs(this._avatarState.previousPosY - this._gameObject.position.y) < 0.001) {
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

    private _doFly(delta: number): void {
        if (!this._gameObject || !this._camera) {
            return;
        }

        this._avatarState.jumpSubstate = JumpSubState.None;

        // Rotate the avatar relative to the yaw direction of the camera.
        const yawRotation = this._defaultCameraAlpha - this._camera.alpha;
        // Rotate the avatar relative to the pitch direction of the camera.
        const pitchRotation = this._camera.beta - this._defaultCameraBeta;
        Quaternion.FromEulerAnglesToRef(pitchRotation, yawRotation, 0, this._gameObject.rotationQuaternion as Quaternion);

        if (this._avatarState.moveDir.x !== 0 || this._avatarState.moveDir.y !== 0 || this._avatarState.moveDir.z !== 0) {
            this._getCurrentSpeed();
            // Move on the X-Z plane, relative to the camera angle.
            const velocity = this._gameObject
                .calcMovePOV(this._avatarState.moveDir.x, 0, -this._avatarState.moveDir.z)
                .normalize()
                .scale(this._avatarState.currentSpeed * delta);
            this._gameObject.position.addInPlace(velocity);
            // Move on the Y axis, regardless of camera angle.
            const verticalSpeed = this._avatarState.action === Action.FlyFast
                ? this._avatarState.fastAscendSpeed
                : this._avatarState.ascendSpeed;
            this._gameObject.moveWithCollisions(new Vector3(0, this._avatarState.moveDir.y * verticalSpeed, 0));
        }
    }

    private _doMove(delta: number): void {
        if (!this._gameObject || !this._camera) {
            return;
        }

        // Rotate the avatar relative to the yaw direction of the camera.
        const angle = Vector3.GetAngleBetweenVectors(
            this._avatarState.moveDir.normalize(),
            Vector3.Forward(true),
            Vector3.Up()
        );
        const rotation = this._defaultCameraAlpha + angle - this._camera.alpha;
        Quaternion.FromEulerAnglesToRef(0, rotation, 0, this._gameObject.rotationQuaternion as Quaternion);

        this._getCurrentSpeed();
        const velocity = this._gameObject.calcMovePOV(0, 0, 1).normalize()
            .scale(this._avatarState.currentSpeed * delta);
        this._gameObject.position.addInPlace(velocity);
    }

    private _doMoveInJumping(delta: number): void {
        if (this._avatarState.moveDir.x !== 0 || this._avatarState.moveDir.z !== 0) {
            this._doMove(delta);
        }
    }

    private _getCurrentSpeed(): void {
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
            case Action.FlyFast:
                speed = this._avatarState.fastFlySpeed;
                break;
            default:
                speed = this._avatarState.walkSpeed;
        }

        this._avatarState.currentSpeed = Scalar.Lerp(Math.abs(this._avatarState.currentSpeed), speed, 0.1);
    }

    private _animateAvatar(): void {
        if (!this._animator) {
            return;
        }

        const anim = AnimationMap.get(this._avatarState.action);
        this._animator.play(anim?.name ?? "idle02");
        this._animator.update();
    }

    private _updateCamera(delta: number): void {
        if (!this._camera || !this._gameObject) {
            return;
        }

        const cameraMode = this._camera.radius <= this._cameraViewTransitionThreshold
            ? CameraMode.FirstPerson
            : CameraMode.ThirdPerson;

        // Make the camera follow the avatar.
        const smoothHeight = cameraMode === CameraMode.FirstPerson && userStore.graphics.cameraBobbing
            ? this._cameraHeightHysteresis?.getInstant()
            : this._cameraHeightHysteresis?.get();
        this._defaultCameraTarget.y = smoothHeight ?? this._avatarHeight;
        this._gameObject.position.addToRef(this._defaultCameraTarget, this._camera.target);

        // Update the FOV.
        this._camera.fov = userStore.graphics.fieldOfView / 100;

        if (this._camera.lowerRadiusLimit) {
            if (this._cameraElastic) {
                this._snapCamera(delta);
            }

            if (cameraMode === CameraMode.FirstPerson) {
                this._cameraViewTransitionThreshold = this._camera.lowerRadiusLimit;
                this._camera.wheelDeltaPercentage = MouseSettingsController.sensitivityComponents.wheelDeltaMultiplier;
            } else {
                this._cameraViewTransitionThreshold = 1.5;
                this._camera.wheelDeltaPercentage
                    = this._defaultwheelDeltaPercentage * MouseSettingsController.sensitivityComponents.wheelDeltaMultiplier;
            }
            if (cameraMode !== this._inputState.cameraMode) {
                this.setCameraMode(cameraMode);
                this._inputState.cameraMode = cameraMode;
            }
        }
    }

    private _snapCamera(delta: number): void {
        if (!this._camera || !this._camera.lowerRadiusLimit) {
            return;
        }

        if (window.useIgloo) {
            window.IglooCameraInstance.setPosition(this._camera.position);
        }

        this._cameraObstacleDetectInfo.elapse += delta;
        if (this._cameraObstacleDetectInfo.elapse < this._cameraObstacleDetectInfo.detectDuration) {
            return;
        }
        this._cameraObstacleDetectInfo.elapse -= this._cameraObstacleDetectInfo.detectDuration;

        let isCameraObstructed = false;
        if (this._camera.radius > this._camera.lowerRadiusLimit) {
            // detect whether camera obstructed
            const avatarToCamera = this._camera.position.subtract(this._camera.target);
            const length = avatarToCamera.length();
            const dir = avatarToCamera.normalize();
            const ray = new Ray(this._camera.target, dir, length);

            const pickInfo = this._scene.pickWithRay(ray);
            if (pickInfo && pickInfo.hit && pickInfo.pickedPoint) {
                if (!this._cameraObstacleDetectInfo.isCameraSnapping) {
                    // store camera state before camera is snapped
                    this._camera.storeState();
                    this._cameraObstacleDetectInfo.length = length;
                    this._cameraObstacleDetectInfo.direction = dir;
                    this._cameraObstacleDetectInfo.isCameraSnapping = true;
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

        if (!isCameraObstructed && this._cameraObstacleDetectInfo.isCameraSnapping) {
            // detect whether camera original position still obstructed or not
            const pickInfo = this._scene.pickWithRay(new Ray(this._camera.target,
                this._cameraObstacleDetectInfo.direction,
                this._cameraObstacleDetectInfo.length + this._cameraSkin));

            if (!pickInfo || !pickInfo.hit) {
                if (this._camera.checkCollisions) {
                    // TODO: Determine if the line below is necessary.
                    // const cameraToAvatar = this._camera.target.subtract(this._camera.position).normalize();
                    this._camera.target.addToRef(
                        this._cameraObstacleDetectInfo.direction.scale(this._cameraObstacleDetectInfo.length),
                        this._camera.position);
                } else {
                    const target = this._camera.target.clone();
                    this._camera._restoreStateValues();
                    this._camera.target = target;
                }

                // TODO: Determine if the line below is necessary.
                // const vec = this._cameraObstacleDetectInfo.direction.scale(this._cameraObstacleDetectInfo.length);
                this._cameraObstacleDetectInfo.isCameraSnapping = false;
            }
        }
    }

    /**
     * Check if there is a ground surface directly below the player's avatar.
     * @returns `true` if ground was detected, `false` if not.
     */
    private _detectGround(): boolean {
        if (this._gameObject) {
            // The avatar's root position is at the bottom center of the mesh.
            // Project the ray from just above this point in case the mesh has clipped into the ground slightly.
            const raycastVerticalOffset = 0.2;
            const raycastPosition = this._gameObject.position.clone();
            raycastPosition.y = raycastPosition.y + raycastVerticalOffset;

            // Make the ray long enough to cover this extra distance and extend into the expected ground surface slightly.
            const groundDetectionDistance = raycastVerticalOffset + 0.2;

            // Cast the detection ray.
            const ray = new Ray(raycastPosition, Vector3.Down(), groundDetectionDistance);
            const pick = this._scene.pickWithRay(ray, (mesh) => mesh.isPickable);

            // If the ray collided with a mesh, then the avatar is grounded.
            if (pick && pick.hit && pick.pickedPoint && pick.pickedMesh) {
                return true;
            }
        }

        return false;
    }

    public setCameraMode(mode: CameraMode): void {
        if (!this._gameObject || !this._camera) {
            return;
        }

        if (mode === CameraMode.FirstPerson) {
            this._setAvatarVisible(false);
            this._camera.checkCollisions = false;
        } else {
            this._setAvatarVisible(true);
            this._camera.checkCollisions = this._inputState.cameraCheckCollisions;
        }
    }

    public _setAvatarVisible(visible: boolean): void {
        if (!this._gameObject) {
            return;
        }

        // Set the visibility of the avatar.
        this._gameObject.isVisible = visible;

        // Set the visibility of the avatar's nametag.
        const meshes = this._gameObject.getChildMeshes(true, (mesh) => mesh.name === "Nametag");
        if (meshes.length > 0) {
            meshes[0].isVisible = visible;
        }

        // Set the visibility of the avatar's mesh.
        const meshComponent = this._gameObject.getComponent("Mesh");
        if (meshComponent instanceof MeshComponent) {
            meshComponent.visible = visible;
        }
    }
}
