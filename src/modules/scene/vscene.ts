//
//  vscene.ts
//
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

// This is disabled because TS complains about BABYLON's use of capitalized function names.

/* eslint-disable @typescript-eslint/no-magic-numbers */

import { ScriptAvatar, Uuid } from "@vircadia/web-sdk";
import {
    AnimationGroup,
    Engine,
    Scene,
    Color3,
    ArcRotateCamera,
    Camera,
    Observable,
    Nullable,
    Quaternion,
    Vector3,
    Color4,
    WebGPUEngine,
} from "@babylonjs/core";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import { PhysicsCharacterController } from "@babylonjs/core";
import HavokPhysics from "@babylonjs/havok";
import "@babylonjs/loaders/glTF";
import { watch } from "vue";
import { DomainController, SceneController } from "./controllers";
import { CSS3DRenderer } from "./css3DRenderer";
import { ResourceManager } from "./resource";
import {
    GameObject,
    MeshComponent,
    DEFAULT_MESH_RENDER_GROUP_ID,
} from "@Modules/object";
import {
    ScriptComponent,
    requireScript,
    requireScripts,
} from "@Modules/script";
import {
    InputController,
    MyAvatarController,
    ScriptAvatarController,
    AvatarMapper,
} from "@Modules/avatar";
import {
    IEntity,
    IEntityDescription,
    EntityBuilder,
    EntityEvent,
} from "@Modules/entity";
import { LabelEntity } from "@Modules/entity/entities";
import { DomainManager } from "@Modules/domain";
import { Location } from "@Modules/domain/location";
import { DataMapper } from "@Modules/domain/dataMapper";
import { AvatarStoreInterface } from "@Modules/avatar/StoreInterface";
import { applicationStore, userStore } from "@Stores/index";
import Log from "@Modules/debugging/log";

// File containing all avatar animations.
const AvatarAnimationUrl = "/assets/animations/AnimationsBasic.glb";

/**
 * VScene is the interface to a single scene's state, entities, and operations.
 */
export class VScene {
    _sceneId: number;
    _engine: Engine | WebGPUEngine;
    _scene: Scene;
    private _css3DRenderer: Nullable<CSS3DRenderer> = null;
    _myAvatar: Nullable<GameObject> = null;
    _myAvatarModelURL = AvatarStoreInterface.getActiveModelData("file");

    _avatarList: Map<string, GameObject>;
    _avatarIsLoading = false;
    _avatarLoadQueue: (string | undefined)[] = [];
    _camera: Nullable<Camera> = null;
    _avatarAnimationGroups: AnimationGroup[] = [];
    _resourceManager: Nullable<ResourceManager> = null;
    _domainController: Nullable<DomainController> = null;
    _sceneController: Nullable<SceneController> = null;
    _sceneManager: Nullable<GameObject> = null;
    _currentSceneURL = "";
    private _onMyAvatarModelChangedObservable: Observable<GameObject> =
        new Observable<GameObject>();

    private _onEntityEventObservable: Observable<EntityEvent> =
        new Observable<EntityEvent>();

    constructor(pEngine: Engine, pSceneId = 0) {
        if (process.env.NODE_ENV === "development") {
            import("@babylonjs/core/Debug/debugLayer");
            import("@babylonjs/inspector");
        }

        this._engine = pEngine;
        this._scene = new Scene(this._engine);
        this._sceneId = pSceneId;
        this._avatarList = new Map<string, GameObject>();
        this._css3DRenderer = new CSS3DRenderer(
            this._engine.getRenderingCanvas() as HTMLCanvasElement,
            this._scene
        );
    }

    getSceneId(): number {
        return this._sceneId;
    }

    getCameraLocation(pCameraId = 0): Vector3 {
        return this._scene.cameras[pCameraId].position.clone();
    }

    setCameraLocation(pLoc: Vector3, pCameraId = 0): void {
        this._scene.cameras[pCameraId].position.set(pLoc.x, pLoc.y, pLoc.z);
    }

    getMyAvatar(): Nullable<GameObject> {
        return this._myAvatar;
    }

    public get onMyAvatarModelChangedObservable(): Observable<GameObject> {
        return this._onMyAvatarModelChangedObservable;
    }

    public get onEntityEventObservable(): Observable<EntityEvent> {
        return this._onEntityEventObservable;
    }

    public get camera(): Nullable<Camera> {
        return this._camera;
    }

    public get myAvatarModelURL(): string {
        return this._myAvatarModelURL;
    }

    public get css3DRenderer(): Nullable<CSS3DRenderer> {
        return this._css3DRenderer;
    }

    public get sceneController(): Nullable<SceneController> {
        return this._sceneController;
    }

    public render(): void {
        this._scene.render();

        if (this._camera) {
            this._css3DRenderer?.render(this._camera);
        }
    }

    public showLoadingUI(): void {
        this._engine.displayLoadingUI();
        this._scene.detachControl();
    }

    public hideLoadingUI(): void {
        this._scene.attachControl();
        this._engine.hideLoadingUI();
    }

    public async load(
        sceneUrl?: string,
        avatarModelURL?: string,
        avatarPos?: Vector3,
        avatarQuat?: Quaternion,
        beforeLoading?: () => void,
        afterLoading?: () => void
    ): Promise<void> {
        if (sceneUrl !== "" && this._currentSceneURL === sceneUrl) {
            return;
        }
        this._currentSceneURL = sceneUrl ?? "";

        this.showLoadingUI();
        await this._createScene();

        beforeLoading?.();

        // create camera
        if (!this._camera) {
            const defaultAlpha = -Math.PI / 2;
            const defaultBeta = Math.PI / 2;
            const defaultRadius = 6;
            const defaultTarget = new Vector3(0, 1, 0);
            this._camera = new ArcRotateCamera(
                "MainCamera",
                defaultAlpha,
                defaultBeta,
                defaultRadius,
                defaultTarget,
                this._scene
            );
            this._scene.activeCamera = this._camera;
        }

        // setup avatar
        await this.loadMyAvatar(avatarModelURL);
        if (this._myAvatar) {
            this._myAvatar.position = avatarPos ?? new Vector3(0, 1, 0);
            this._myAvatar.rotationQuaternion =
                avatarQuat ?? Quaternion.Identity();
        }

        if (sceneUrl) {
            this._scene.onAfterRenderObservable.addOnce(() => {
                void this.loadEntities(sceneUrl);
            });
        }

        await this._scene.whenReadyAsync();

        afterLoading?.();

        this.hideLoadingUI();
    }

    public dispose(): void {
        this._scene.dispose();
        this._css3DRenderer?.removeAllCSS3DObjects();
    }

    public resetMyAvatarPositionAndOrientation(): void {
        if (this._myAvatar) {
            const location = DomainManager.ActiveDomain
                ? DomainManager.ActiveDomain?.Location
                : new Location("/0,1.05,0/0,0,0,1");
            this.teleportMyAvatar(location);
        }
    }

    public teleportMyAvatar(location: Location): void {
        // keep the avatar's orientation when orientation is empty
        const q =
            location.orientation.length > 0
                ? AvatarMapper.mapToLocalOrientation(
                    DataMapper.stringToQuaternion(location.orientation)
                )
                : undefined;

        this._teleportMyAvatar(
            AvatarMapper.mapToLocalPosition(
                DataMapper.stringToVec3(location.position)
            ),
            q
        );
    }

    public teleportMyAvatarToOtherPeople(sessionId: string): void {
        Log.info(Log.types.AVATAR, `teleport MyAvatar to avatar ${sessionId}`);
        const avatar = this._avatarList.get(sessionId);
        if (avatar) {
            const positionOffset = avatar.calcMovePOV(0, 0, 1.5);
            const position = avatar.position.add(positionOffset);
            this._teleportMyAvatar(position);

            this._myAvatar?.lookAt(avatar.position, Math.PI);
        }
    }

    public stopMyAvatar(): void {
        const controller = this._myAvatar?.getComponent(
            InputController.typeName
        );
        if (controller instanceof InputController) {
            controller.isStopped = true;
        }
    }

    // Note:
    // The position and orientation coordinate of babylon.js and domain are different.
    // Replace this function with teleportMyAvatar with location to prevent mess.
    private _teleportMyAvatar(
        position: Vector3 | undefined,
        rotation?: Quaternion | undefined
    ): void {
        if (this._myAvatar) {
            if (position) {
                this._myAvatar.position = position;
            }

            if (rotation) {
                this._myAvatar.rotationQuaternion = rotation;
            }

            const controller = this._myAvatar.getComponent(
                InputController.typeName
            );
            if (controller instanceof InputController) {
                controller.isTeleported = true;
            }
        }
    }

    public loadEntity(entity: IEntity): void {
        EntityBuilder.createEntity(entity, this._scene);
    }

    public removeEntity(id: string): void {
        const mesh = this._scene.getMeshById(id);
        if (mesh) {
            this._scene.removeMesh(mesh, true);
        }
    }

    public async loadEntities(url: string): Promise<void> {
        const response = await fetch(url);
        const json = (await response.json()) as IEntityDescription;
        const entityDescription = json;
        Log.info(Log.types.ENTITIES, `Load Entities from ${url}`);
        Log.info(
            Log.types.ENTITIES,
            `DataVersion: ${entityDescription.DataVersion}
             Id: ${entityDescription.Id}
             Version: ${entityDescription.Version}`
        );

        Log.info(Log.types.ENTITIES, "Create Entities.");
        // create entities
        entityDescription.Entities.forEach((props) => {
            EntityBuilder.createEntity(props, this._scene);
        });

        Log.info(Log.types.ENTITIES, "Load Entities done.");
    }

    /**
     * Load an avatar model for the current player.
     * @param url The URL to load the model from.
     * @param reload Whether the model is required to be re-downloaded
     * (otherwise repeated attempts to load the same model will be ignored).
     * @returns A reference to the player's avatar.
     */
    public async loadMyAvatar(url?: string, reload?: boolean): Promise<Nullable<GameObject>> {
        this._avatarLoadQueue.push(url); // Queue load requests.
        if (!this._avatarIsLoading && this._resourceManager) {
            this._avatarIsLoading = true;
            const lastQueuedModelURL = this._avatarLoadQueue.pop(); // Only load the last model in the request queue.
            if (lastQueuedModelURL) {
                // Ignore repeated attempts to load the same model, unless required.
                if (
                    this._myAvatarModelURL === lastQueuedModelURL &&
                    this._myAvatar &&
                    !reload
                ) {
                    // Prevent multiple avatar models from being equipped.
                    this._avatarIsLoading = false;
                    if (this._avatarLoadQueue.length > 1) {
                        const finalModelURL = this._avatarLoadQueue.pop();
                        this._avatarLoadQueue = [];
                        await this.loadMyAvatar(finalModelURL);
                    }

                    return this._myAvatar;
                }
                this._myAvatarModelURL = lastQueuedModelURL;
            }

            Log.info(
                Log.types.AVATAR,
                `Load MyAvatar: ${this._myAvatarModelURL}`
            );
            const previousAvatar = this._myAvatar;
            this._myAvatar = new GameObject("MyAvatar", this._scene);
            if (previousAvatar) {
                this._myAvatar.position = previousAvatar.position;
                this._myAvatar.rotationQuaternion =
                    previousAvatar.rotationQuaternion;
                previousAvatar.dispose();
            }

            // Enable collision detection for the avatar
            this._myAvatar.checkCollisions = true;

            const result = await this._resourceManager.loadMyAvatar(
                this._myAvatarModelURL
            );
            let boundingVectors = {
                max: Vector3.Zero(),
                min: Vector3.Zero(),
            };
            if (result.mesh) {
                // Initialize the avatar mesh.
                const meshComponent = new MeshComponent();
                meshComponent.mesh = result.mesh;
                meshComponent.skeleton = result.skeleton;
                // Get the bounding vectors of the avatar mesh.
                const boundingMesh = meshComponent.mesh.refreshBoundingInfo({
                    applySkeleton: Boolean(meshComponent.skeleton),
                    applyMorph: false,
                    updatePositionsArray: true
                });
                boundingVectors = boundingMesh.getHierarchyBoundingVectors();
                meshComponent.mesh.position = Vector3.Zero();
                this._myAvatar.addComponent(meshComponent);
            }
            const avatarHeight = boundingVectors.max.y - boundingVectors.min.y;

            const hipBone = result.skeleton?.bones.find(
                (bone) => bone.name === "Hips"
            );
            const hipPosition = hipBone?.position;

            // Reload the avatar animations file in case the new avatar is a different size than the previous one.
            // The browser cache will prevent this from being fetched over the network if the avatar is switched frequently.
            const animResult = await this._resourceManager.loadAvatarAnimations(
                AvatarAnimationUrl,
                hipPosition
            );
            this._avatarAnimationGroups = animResult.animGroups;

            // Create character controller instead of manual physics body
            const physicsEngine = this._scene.getPhysicsEngine();
            if (physicsEngine) {
                const characterRadius = (boundingVectors.max.x -
                    boundingVectors.min.x +
                    (boundingVectors.max.z - boundingVectors.min.z)) /
                    4 || 0.3;
                const characterHeight = avatarHeight || 1.8;

                // Create character controller using the same pattern as Babylon.js example
                const characterController = new PhysicsCharacterController(
                    this._myAvatar.position.add(new Vector3(0, characterHeight * 0.5, 0)),
                    {
                        capsuleHeight: characterHeight,
                        capsuleRadius: characterRadius
                    },
                    this._scene
                );

                // Configure character controller properties
                characterController.maxCharacterSpeedForSolver = 10.0;
                characterController.maxSlopeCosine = Math.cos(Math.PI / 4); // 45 degrees
                characterController.staticFriction = 0.2;
                characterController.dynamicFriction = 0.1;
                characterController.acceleration = 0.5;
                characterController.maxAcceleration = 50.0;

                // Store controller reference on avatar
                (this._myAvatar as any).characterController = characterController;
                // Store character state
                (this._myAvatar as any).characterState = "ON_GROUND";
                (this._myAvatar as any).characterGravity = new Vector3(0, -9.81, 0);
            }

            // Character controller handles collision detection, no need for manual ellipsoid

            const myAvatarController = new MyAvatarController();
            const avatarController = new InputController();
            avatarController.animGroups = this._avatarAnimationGroups;
            avatarController.avatarHeight = avatarHeight;
            avatarController.avatarRoot =
                myAvatarController.skeletonRootPosition;
            avatarController.camera = this._camera as ArcRotateCamera;
            const labelHeightGetter = () =>
                myAvatarController.skeletonRootPosition.y + avatarHeight / 2;
            this._myAvatar.addComponent(avatarController);
            this._myAvatar.addComponent(myAvatarController);
            if (DomainManager.ActiveDomain?.AvatarClient?.MyAvatar) {
                myAvatarController.myAvatar =
                    DomainManager.ActiveDomain.AvatarClient?.MyAvatar;
            }
            myAvatarController.skeletonModelURL = lastQueuedModelURL;

            this._onMyAvatarModelChangedObservable.notifyObservers(
                this._myAvatar
            );

            // Add a label to the avatar.
            let labelColor = userStore.account.isAdmin
                ? Color3.FromHexString(applicationStore.theme.colors.primary)
                : undefined;
            LabelEntity.create(
                this._myAvatar,
                labelHeightGetter,
                userStore.avatar.displayName,
                false,
                labelColor
            );
            // Update the label color when the player's admin state is changed in the Store.
            watch(
                () => userStore.account.isAdmin,
                (value: boolean) => {
                    labelColor = value
                        ? Color3.FromHexString(
                            applicationStore.theme.colors.primary
                        )
                        : undefined;
                    LabelEntity.removeAll(this._myAvatar);
                    if (this._myAvatar) {
                        LabelEntity.create(
                            this._myAvatar,
                            labelHeightGetter,
                            userStore.avatar.displayName,
                            false,
                            labelColor
                        );
                    }
                }
            );
            // Update the label when the displayName is changed in the Store.
            watch(
                () => userStore.avatar.displayName,
                (value: string) => {
                    LabelEntity.removeAll(this._myAvatar);
                    if (this._myAvatar) {
                        LabelEntity.create(
                            this._myAvatar,
                            labelHeightGetter,
                            value,
                            false,
                            labelColor
                        );
                    }
                }
            );

            // Prevent multiple avatar models from being equipped.
            this._avatarIsLoading = false;
            if (this._avatarLoadQueue.length > 1) {
                const finalModelURL = this._avatarLoadQueue.pop();
                this._avatarLoadQueue = [];
                await this.loadMyAvatar(finalModelURL);
            }
        }

        return this._myAvatar;
    }

    public async loadAvatar(
        id: Uuid,
        domain: ScriptAvatar
    ): Promise<Nullable<GameObject>> {
        if (!this._resourceManager || domain.skeletonModelURL === "") {
            return null;
        }

        const stringId = id.stringify();
        let avatar = this._avatarList.get(stringId);
        avatar?.dispose();
        avatar = new GameObject("ScriptAvatar_" + stringId, this._scene);
        avatar.id = stringId;

        const { mesh, skeleton } = await this._resourceManager.loadAvatar(
            domain.skeletonModelURL
        );

        if (mesh) {
            // Initialize the avatar mesh.
            const meshComponent = new MeshComponent();
            meshComponent.mesh = mesh;
            meshComponent.skeleton = skeleton;

            let boundingVectors = {
                max: Vector3.Zero(),
                min: Vector3.Zero(),
            };
            let avatarHeight = 1.8;

            if (
                meshComponent.mesh &&
                "refreshBoundingInfo" in meshComponent.mesh
            ) {
                // Get the bounding vectors of the avatar mesh.
                const boundingMesh = meshComponent.mesh.refreshBoundingInfo({
                    applySkeleton: Boolean(meshComponent.skeleton),
                    applyMorph: false,
                    updatePositionsArray: true,
                });
                boundingVectors = boundingMesh.getHierarchyBoundingVectors();
                avatarHeight = boundingVectors.max.y - boundingVectors.min.y;
                meshComponent.mesh.position = Vector3.Zero();
            }
            avatar.addComponent(meshComponent);
            avatar.addComponent(new ScriptAvatarController(domain));

            const hipBone = meshComponent.skeleton?.bones.find(
                (bone) => bone.name === "Hips"
            );
            const hipPosition = hipBone?.position;
            const labelHeight = () =>
                (hipPosition?.y ?? avatarHeight / 2) + avatarHeight / 2;

            this._avatarList.set(stringId, avatar);

            // Add a label to the avatar.
            let labelColor = applicationStore.avatars.avatarsInfo.get(id)
                ?.isAdmin
                ? Color3.FromHexString(applicationStore.theme.colors.primary)
                : undefined;
            LabelEntity.create(
                avatar,
                labelHeight,
                domain.displayName,
                false,
                labelColor
            );
            // Update the label color when the player's admin state is changed.
            watch(
                () =>
                    Boolean(
                        applicationStore.avatars.avatarsInfo.get(id)?.isAdmin
                    ),
                (value: boolean) => {
                    labelColor = value
                        ? Color3.FromHexString(
                            applicationStore.theme.colors.primary
                        )
                        : undefined;
                    const labelAvatar = this._avatarList.get(stringId);
                    LabelEntity.removeAll(labelAvatar);
                    if (labelAvatar) {
                        LabelEntity.create(
                            labelAvatar,
                            labelHeight,
                            domain.displayName,
                            false,
                            labelColor
                        );
                    }
                }
            );
            // Update the label when the displayName is changed.
            domain.displayNameChanged.connect(() => {
                const labelAvatar = this._avatarList.get(stringId);
                LabelEntity.removeAll(labelAvatar);
                if (labelAvatar) {
                    LabelEntity.create(
                        labelAvatar,
                        labelHeight,
                        domain.displayName,
                        false,
                        labelColor
                    );
                }
            });
        }
        return avatar;
    }

    public unloadAvatar(id: Uuid): void {
        const stringId = id.stringify();
        const avatar = this._avatarList.get(stringId);
        if (avatar) {
            avatar.dispose();
            this._avatarList.delete(stringId);
        }
    }

    public unloadAllAvatars(): void {
        this._avatarList.forEach((gameObj) => {
            gameObj.dispose();
        });
        this._avatarList.clear();
    }

    private async _createScene(): Promise<void> {
        if (!this._scene) {
            this._scene = new Scene(this._engine);
        }
        // use right handed system to match vircadia coordinate system
        this._scene.useRightHandedSystem = true;
        this._resourceManager = new ResourceManager(this._scene);

        if (!this._sceneManager) {
            this._sceneManager = new GameObject("SceneManager", this._scene);

            this._domainController = new DomainController();
            this._sceneManager.addComponent(this._domainController);

            this._sceneController = new SceneController(this);
            this._sceneManager.addComponent(this._sceneController);
        }

        if (this._domainController) {
            this._domainController.vscene = this;
        }

        this._scene.onReadyObservable.add(this._onSceneReady.bind(this));
        this._scene.onReadyObservable.add(() => {
            this._sceneController?.onSceneReady();
        });

        // Enable physics (Havok)
        const baseUrl = (import.meta as any).env?.BASE_URL ?? "/";
        const hk = await HavokPhysics({
            locateFile: (file) => `${baseUrl}wasm/${file}`,
        });
        this._scene.enablePhysics(
            Vector3.Zero(),
            new HavokPlugin(true, hk)
        );
        // Don't clear the buffer for the default mesh render group.
        this._scene.setRenderingAutoClearDepthStencil(
            DEFAULT_MESH_RENDER_GROUP_ID,
            false
        );
        // Needs to be transparent for web entity to be seen.
        this._scene.clearColor = new Color4(0, 0, 0, 0);

        if (this._css3DRenderer) {
            this._css3DRenderer.removeAllCSS3DObjects();
            this._css3DRenderer.scene = this._scene;
        }

        this._scene.collisionsEnabled = true;
    }

    private _onSceneReady(): void {
        requireScripts(this._scene, this._scene.transformNodes);

        // handle dynamic loaded script
        this._scene.onNewTransformNodeAddedObservable.add((node) => {
            if (node instanceof ScriptComponent) {
                this._scene.onBeforeRenderObservable.addOnce(() => {
                    requireScript(this._scene, node);
                });
            }
        });

        if (!this._scene.activeCamera) {
            this._scene.createDefaultCamera(true, true, true);
        }
    }
}
