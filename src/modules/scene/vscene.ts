/*
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

// This is disabled because TS complains about BABYLON's use of cap'ed function names
/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable class-methods-use-this */

import { AnimationGroup, Engine, Scene,
    ActionManager, ActionEvent, ExecuteCodeAction, ArcRotateCamera, Camera,
    Observable, Nullable, AmmoJSPlugin, Quaternion, Vector3, StandardMaterial,
    Mesh, MeshBuilder, DynamicTexture, Color4, DefaultRenderingPipeline } from "@babylonjs/core";

import "@babylonjs/loaders/glTF";
import { ResourceManager } from "./resource";
import { DomainController, SceneController } from "./controllers";
import { GameObject, MeshComponent, CapsuleColliderComponent,
    DEFAULT_MESH_RENDER_GROUP_ID, MASK_MESH_RENDER_GROUP_ID } from "@Modules/object";
import { ScriptComponent, requireScript, requireScripts, reattachScript } from "@Modules/script";
import { InputController, MyAvatarController, ScriptAvatarController, AvatarMapper } from "@Modules/avatar";
import { IEntity, IEntityDescription, EntityBuilder, EntityEvent } from "@Modules/entity";
import { ScriptAvatar } from "@vircadia/web-sdk";
import { Utility } from "@Modules/utility";
import { Location } from "@Modules/domain/location";
import { DataMapper } from "@Modules/domain/dataMapper";
import { AvatarStoreInterface } from "@Modules/avatar/StoreInterface";
import { Store } from "@Base/store";
import { CSS3DRenderer } from "./css3DRenderer";

// General Modules
import Log from "@Modules/debugging/log";
// System Modules
import { VVector3 } from ".";
import { DomainMgr } from "../domain";

// File containing all avatar animations.
const AvatarAnimationUrl = "assets/AnimationsBasic.glb";

/**
 * VScene is the interface to a single scene's state, entities, and operations.
 */
export class VScene {
    _sceneId: number;
    _engine: Engine;
    _scene: Scene;
    _preScene: Nullable<Scene> = null;
    private _css3DRenderer: Nullable<CSS3DRenderer> = null;
    _myAvatar: Nullable<GameObject> = null;
    _myAvatarModelURL = AvatarStoreInterface.getActiveModelData("file") as string;

    _avatarList : Map<string, GameObject>;
    _avatarIsLoading = false;
    _avatarLoadQueue = [] as (string | undefined)[];
    _camera : Nullable<Camera> = null;
    _avatarAnimationGroups : AnimationGroup[] = [];
    _resourceManager : Nullable<ResourceManager> = null;
    _domainController : Nullable<DomainController> = null;
    _sceneController : Nullable<SceneController> = null;
    _sceneManager : Nullable<GameObject> = null;
    _currentSceneURL = "";
    private _onMyAvatarModelChangedObservable: Observable<GameObject> = new Observable<GameObject>();
    private _onEntityEventObservable: Observable<EntityEvent> = new Observable<EntityEvent>();

    constructor(pEngine: Engine, pSceneId = 0) {
        if (process.env.NODE_ENV === "development") {
            import("@babylonjs/core/Debug/debugLayer");
            import("@babylonjs/inspector");
        }

        this._engine = pEngine;
        this._scene = new Scene(pEngine);
        this._sceneId = pSceneId;
        this._avatarList = new Map<string, GameObject>();
        this._css3DRenderer = new CSS3DRenderer(pEngine.getRenderingCanvas() as HTMLCanvasElement);
        this._css3DRenderer.scene = this._scene;
    }

    getSceneId(): number {
        return this._sceneId;
    }

    getCameraLocation(pCameraId = 0): Vector3 {
        return this._scene.cameras[pCameraId].position.clone();
    }

    setCameraLocation(pLoc: VVector3, pCameraId = 0): void {
        this._scene.cameras[pCameraId].position.set(pLoc.x, pLoc.y, pLoc.z);
    }

    getMyAvatar() : Nullable<GameObject> {
        return this._myAvatar;
    }

    public get onMyAvatarModelChangedObservable(): Observable<GameObject> {
        return this._onMyAvatarModelChangedObservable;
    }

    public get onEntityEventObservable(): Observable<EntityEvent> {
        return this._onEntityEventObservable;
    }

    public get camera() : Nullable<Camera> {
        return this._camera;
    }

    public get myAvatarModelURL() : string {
        return this._myAvatarModelURL;
    }

    public get css3DRenderer(): Nullable<CSS3DRenderer> {
        return this._css3DRenderer;
    }

    public render():void {
        this._scene.render();

        if (this._camera) {
            this._css3DRenderer?.render(this._camera);
        }
    }

    public showLoadingUI() : void {
        this._engine.displayLoadingUI();
        this._scene.detachControl();
    }

    public hideLoadingUI() : void {
        this._scene.attachControl();
        this._engine.hideLoadingUI();
    }

    public async load(sceneUrl ?: string, avatarModelURL ?: string, avatarPos ?: Vector3, avatarQuat ?: Quaternion,
        beforeLoading ?: ()=> void, afterLoading ?: ()=> void) : Promise<void> {
        if (sceneUrl !== "" && this._currentSceneURL === sceneUrl) {
            return;
        }

        this._currentSceneURL = sceneUrl ?? "";

        this._engine.displayLoadingUI();
        this._preScene = this._scene;
        this._createScene();
        this._scene.detachControl();

        if (beforeLoading) {
            beforeLoading();
        }

        // create camera
        const camera = new ArcRotateCamera(
            "MainCamera", -Math.PI / 2, Math.PI / 2, 6,
            new Vector3(0, 1, 0), this._scene);

        camera.minZ = 1;
        camera.maxZ = 250000;

        this._scene.activeCamera = camera;
        this._camera = camera;

        await this.loadMyAvatar(avatarModelURL);
        // setup avatar
        if (this._myAvatar) {
            this._myAvatar.position = avatarPos ?? new Vector3(0, 1, 0);
            this._myAvatar.rotationQuaternion = avatarQuat ?? Quaternion.Identity();
        }

        if (sceneUrl) {
            this._scene.onAfterRenderObservable.addOnce(() => {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                this.loadEntities(sceneUrl);
            });
        }

        await this._scene.whenReadyAsync();

        if (afterLoading) {
            afterLoading();
        }

        if (this._preScene) {
            this._preScene.dispose();
            this._preScene = null;
        }

        this.hideLoadingUI();
    }

    public dispose() : void {
        this._scene.dispose();
        this._css3DRenderer?.removeAllCSS3DObjects();
    }

    public resetMyAvatarPositionAndOrientation() : void {
        if (this._myAvatar) {
            const location = DomainMgr.ActiveDomain
                ? DomainMgr.ActiveDomain?.Location
                : new Location("/0,1.05,0/0,0,0,1");
            this.teleportMyAvatar(location);
        }
    }

    public teleportMyAvatar(location : Location) : void {
        // keep the avatar's orientation when orientation is empty
        const q = location.orientation.length > 0
            ? AvatarMapper.mapDomainOrientation(DataMapper.mapStringToQuaternion(location.orientation))
            : undefined;

        this._teleportMyAvatar(
            AvatarMapper.mapDomainPosition(DataMapper.mapStringToVec3(location.position)), q);
    }

    public teleportMyAvatarToOtherPeople(sessionId : string) : void {
        Log.info(Log.types.AVATAR, `teleport MyAvatar to avatar ${sessionId}`);
        const avatar = this._avatarList.get(sessionId);
        if (avatar) {
            const positionOffset = avatar.calcMovePOV(0, 0, 1.5);
            const position = avatar.position.add(positionOffset);
            this._teleportMyAvatar(position);

            this._myAvatar?.lookAt(avatar.position, Math.PI);
        }
    }

    public stopMyAvatar() : void {
        if (this._myAvatar) {
            const controller = this._myAvatar.getComponent(InputController.typeName) as InputController;
            if (controller) {
                controller.isStopped = true;
            }
        }
    }

    // Note:
    // The position and orientation coordinate of babylon.js and doamin are different.
    // Replace this functin with teleportMyAvatar with location to prevent mess.
    private _teleportMyAvatar(position: Vector3 | undefined, rotation?: Quaternion | undefined) : void {
        if (this._myAvatar) {
            if (position) {
                this._myAvatar.position = position;
            }

            if (rotation) {
                this._myAvatar.rotationQuaternion = rotation;
            }

            const controller = this._myAvatar.getComponent(InputController.typeName) as InputController;
            if (controller) {
                controller.isTeleported = true;
            }
        }
    }

    public loadEntity(entity: IEntity) : void {
        EntityBuilder.createEntity(entity, this._scene);
    }

    public removeEntity(id: string) : void {
        const mesh = this._scene.getMeshById(id);
        if (mesh) {
            this._scene.removeMesh(mesh, true);
        }
    }

    public async loadEntities(url: string) : Promise<void> {
        const response = await fetch(url);
        const json = await response.json();
        const entityDescription = json as IEntityDescription;
        Log.info(Log.types.ENTITIES, `Load Entities from ${url}`);
        Log.info(Log.types.ENTITIES,
            `DataVersion: ${entityDescription.DataVersion}
             Id: ${entityDescription.Id}
             Version: ${entityDescription.Version}`);

        Log.info(Log.types.ENTITIES, "Create Entities.");
        // create entities
        entityDescription.Entities.forEach((props) => {
            EntityBuilder.createEntity(props, this._scene);
        });

        Log.info(Log.types.ENTITIES, "Load Entities done.");
    }

    /**
     * Load an avatar model for the current player.
     * @param modelURL The URL to load the model from.
     * @param reload Whether the model is required to be re-downloaded
     * (otherwise repeated attempts to load the same model will be ignored).
     * @returns A reference to the player's avatar.
     */
    public async loadMyAvatar(modelURL?: string, reload?: boolean) : Promise<Nullable<GameObject>> {
        this._avatarLoadQueue.push(modelURL); // Queue load requests.
        if (!this._avatarIsLoading && this._resourceManager) {
            this._avatarIsLoading = true;
            const lastQueuedModelURL = this._avatarLoadQueue.pop(); // Only load the last model in the request queue.
            if (this._avatarAnimationGroups.length === 0) {
                const result = await this._resourceManager.loadAvatarAnimations(AvatarAnimationUrl);
                this._avatarAnimationGroups = result.animGroups;
            }
            if (lastQueuedModelURL) {
                // Ignore repeated attempts to load the same model, unless required.
                if (this._myAvatarModelURL === lastQueuedModelURL && this._myAvatar && !reload) {
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

            Log.info(Log.types.AVATAR, `Load MyAvatar: ${this._myAvatarModelURL}`);
            const previousAvatar = this._myAvatar;
            this._myAvatar = new GameObject("MyAvatar", this._scene);
            if (previousAvatar) {
                this._myAvatar.position = previousAvatar.position;
                this._myAvatar.rotationQuaternion = previousAvatar.rotationQuaternion;
                previousAvatar.dispose();
            }

            const result = await this._resourceManager.loadMyAvatar(this._myAvatarModelURL);
            let boundingVectors = {
                max: Vector3.Zero(),
                min: Vector3.Zero()
            };
            if (result.mesh) {
                // Initialize the avatar mesh.
                const meshComponent = new MeshComponent();
                meshComponent.mesh = result.mesh;
                meshComponent.skeleton = result.skeleton;
                // Get the bounding vectors of the avatar mesh.
                const boundingMesh = meshComponent.mesh.refreshBoundingInfo(Boolean(meshComponent.skeleton));
                boundingVectors = boundingMesh.getHierarchyBoundingVectors();
                // meshComponent.mesh.setPivotPoint(new Vector3(0, boundingVectors.min.y, 0));
                meshComponent.mesh.position = Vector3.Zero();
                this._myAvatar.addComponent(meshComponent);
            }
            const avatarHeight = boundingVectors.max.y - boundingVectors.min.y;

            const defaultColliderProperties = {
                radius: 0.3,
                height: 1.8,
                offset: new Vector3(0, -0.1, -0.04), // Offset coordinates are local (relative to the avatar).
                mass: 1,
                friction: 3
            };
            const capsuleCollider = new CapsuleColliderComponent(
                this._scene,
                defaultColliderProperties.mass,
                defaultColliderProperties.friction
            );
            // Create a collider based on the dimensions of the avatar model.
            capsuleCollider.createCollider(
                // eslint-disable-next-line @typescript-eslint/no-extra-parens
                ((boundingVectors.max.x - boundingVectors.min.x) + (boundingVectors.max.z - boundingVectors.min.z)) / 4
                || defaultColliderProperties.radius,
                avatarHeight || defaultColliderProperties.height,
                new Vector3(
                    defaultColliderProperties.offset.x,
                    boundingVectors.max.y - defaultColliderProperties.offset.y,
                    defaultColliderProperties.offset.z
                )
            );
            capsuleCollider.setAngularFactor(0, 1, 0);
            if (capsuleCollider.collider) {
                capsuleCollider.collider.isPickable = false;
            }
            this._myAvatar.addComponent(capsuleCollider);

            const avatarController = new InputController();
            avatarController.animGroups = this._avatarAnimationGroups;
            avatarController.avatarHeight = avatarHeight;
            avatarController.camera = this._camera as ArcRotateCamera;
            this._myAvatar.addComponent(avatarController);

            const myAvatarController = new MyAvatarController();
            this._myAvatar.addComponent(myAvatarController);
            if (DomainMgr.ActiveDomain && DomainMgr.ActiveDomain.AvatarClient?.MyAvatar) {
                myAvatarController.myAvatar = DomainMgr.ActiveDomain.AvatarClient?.MyAvatar;
            }
            myAvatarController.skeletonModelURL = lastQueuedModelURL;

            this._onMyAvatarModelChangedObservable.notifyObservers(this._myAvatar);

            let nametag = undefined as Mesh | undefined;
            if (Store.state.avatar.showNametags) {
                nametag = this._loadNametag(this._myAvatar, avatarHeight, Store.state.avatar.displayName);
            }
            // Update the nametag when the displayName is changed in the Store.
            Store.watch((state) => state.avatar.displayName, (value: string) => {
                if (nametag) {
                    this._unloadNametag(nametag);
                    if (this._myAvatar && Store.state.avatar.showNametags) {
                        nametag = this._loadNametag(this._myAvatar, avatarHeight, value);
                    }
                }
            });
            // Show/Hide the nametag when showNametags is changed in the Store.
            Store.watch((state) => state.avatar.showNametags, (value: boolean) => {
                if (nametag) {
                    if (value && this._myAvatar) { // Nametags are enabled.
                        nametag = this._loadNametag(this._myAvatar, avatarHeight, Store.state.avatar.displayName);
                    } else { // Nametags are disabled.
                        this._unloadNametag(nametag);
                    }
                }
            });

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

    public async loadAvatar(id: string, domain: ScriptAvatar) : Promise<Nullable<GameObject>> {
        let avatar = this._avatarList.get(id);
        if (avatar) {
            avatar.dispose();
        }

        if (this._resourceManager && domain.skeletonModelURL !== "") {
            avatar = new GameObject("ScriptAvatar_" + id, this._scene);
            const result = await this._resourceManager.loadAvatar(domain.skeletonModelURL);
            let boundingVectors = {
                max: Vector3.Zero(),
                min: Vector3.Zero()
            };
            let avatarHeight = 1.8;
            if (result.mesh) {
                // Initialize the avatar mesh.
                avatar.id = id;
                const meshComponent = new MeshComponent();
                meshComponent.mesh = result.mesh;
                meshComponent.skeleton = result.skeleton;
                if (meshComponent.mesh && "refreshBoundingInfo" in meshComponent.mesh) {
                    // Get the bounding vectors of the avatar mesh.
                    const boundingMesh = meshComponent.mesh.refreshBoundingInfo(Boolean(meshComponent.skeleton));
                    boundingVectors = boundingMesh.getHierarchyBoundingVectors();
                    avatarHeight = boundingVectors.max.y - boundingVectors.min.y;
                    meshComponent.mesh.position = Vector3.Zero();
                }
                avatar.addComponent(meshComponent);
                avatar.addComponent(new ScriptAvatarController(domain));

                this._avatarList.set(id, avatar);

                let nametag = undefined as Mesh | undefined;
                if (Store.state.avatar.showNametags) {
                    nametag = this._loadNametag(avatar, avatarHeight, domain.displayName);
                }
                // Update the nametag when the displayName is changed
                domain.displayNameChanged.connect(() => {
                    if (nametag) {
                        this._unloadNametag(nametag);
                        const nametagAvatar = this._avatarList.get(id);
                        if (nametagAvatar && Store.state.avatar.showNametags) {
                            nametag = this._loadNametag(nametagAvatar, avatarHeight, domain.displayName);
                        }
                    }
                });
                // Show/Hide the nametag when showNametags is changed in the Store
                Store.watch((state) => state.avatar.showNametags, (value: boolean) => {
                    if (nametag) {
                        const nametagAvatar = this._avatarList.get(id);
                        if (value && nametagAvatar) { // Nametags are enabled
                            nametag = this._loadNametag(nametagAvatar, avatarHeight, domain.displayName);
                        } else { // Nametags are disabled
                            this._unloadNametag(nametag);
                        }
                    }
                });
            }
            return avatar;
        }

        return null;
    }

    public unloadAvatar(id: string) : void {
        const avatar = this._avatarList.get(id);
        if (avatar) {
            avatar.dispose();
            // eslint-disable-next-line @typescript-eslint/dot-notation
            this._avatarList.delete(id);
        }

    }

    public unloadAllAvatars() : void {
        this._avatarList.forEach((gameObj) => {
            gameObj.dispose();
        });
        this._avatarList.clear();
    }

    // TODO: Move all nametag code into a dedicated module.
    private _loadNametag(avatar: GameObject, avatarHeight: number, name: string) : Mesh {
        const characterWidth = 38.5;
        const tagWidth = (name.length + 2) * characterWidth;

        // Texture.
        const nametagTextureResolution = 100;
        const nametagTexture = new DynamicTexture("NametagTexture", {
            width: tagWidth,
            height: nametagTextureResolution
        }, this._scene);
        nametagTexture.drawText(
            name,
            tagWidth / 2 - name.length / 2 * characterWidth, // Center the name on the tag.
            70,
            "70px monospace",
            "white",
            "#121212",
            true,
            true
        );

        // Material.
        const nametagMaterial = new StandardMaterial("NametagMaterial", this._scene);
        nametagMaterial.diffuseTexture = nametagTexture;
        nametagMaterial.specularTexture = nametagTexture;
        nametagMaterial.emissiveTexture = nametagTexture;
        nametagMaterial.disableLighting = true;

        // Mesh.
        const nametagPlane = MeshBuilder.CreatePlane("Nametag", {
            width: 0.1 * tagWidth / nametagTextureResolution,
            height: 0.1,
            sideOrientation: Mesh.DOUBLESIDE,
            updatable: true
        }, this._scene);
        nametagPlane.material = nametagMaterial;
        nametagPlane.billboardMode = Mesh.BILLBOARDMODE_Y;
        nametagPlane.parent = avatar;
        nametagPlane.isPickable = false;
        nametagPlane.renderingGroupId = MASK_MESH_RENDER_GROUP_ID;
        // Position the nametag above the center of the avatar.
        const positionOffset = new Vector3(0, 0.15, 0);
        nametagPlane.position = new Vector3(
            positionOffset.x,
            avatarHeight + positionOffset.y,
            positionOffset.z
        );

        return nametagPlane;
    }

    private _unloadNametag(nametag: Mesh) : void {
        nametag.dispose();
    }

    private _createScene() : void {
        this._scene = new Scene(this._engine);
        // use right handed system to match vircadia coordinate system
        this._scene.useRightHandedSystem = true;
        this._resourceManager = new ResourceManager(this._scene);
        this._scene.actionManager = new ActionManager(this._scene);
        this._scene.actionManager.registerAction(
            new ExecuteCodeAction(ActionManager.OnKeyUpTrigger,
                this._onKeyUp.bind(this))
        );

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
        this._scene.onReadyObservable.add(
            () => {
                this._sceneController?.onSceneReady();
            });

        // Enable physics
        this._scene.enablePhysics(Vector3.Zero(), new AmmoJSPlugin());
        // Prevent to clear the buffer of mask mesh render groud
        this._scene.setRenderingAutoClearDepthStencil(DEFAULT_MESH_RENDER_GROUP_ID, false);
        // Needs to be transparent for web entity to be seen
        this._scene.clearColor = new Color4(0, 0.0, 0.0, 0);

        if (this._css3DRenderer) {
            this._css3DRenderer.removeAllCSS3DObjects();
            this._css3DRenderer.scene = this._scene;
        }
        this._scene.collisionsEnabled = true;
    }

    private _updateRenderPipelineSettings(): void {
        // Get the dafault rendering pipeline.
        let defaultPipeline
        = this._scene.postProcessRenderPipelineManager.supportedPipelines.find((pipeline) => pipeline.name === "default");
        // If the default pipeline doesn't exist, create it.
        if (!defaultPipeline) {
            defaultPipeline = new DefaultRenderingPipeline("default", true, this._scene, this._scene.cameras);
        }
        // Update the rendering pipeline from the Store.
        if (defaultPipeline instanceof DefaultRenderingPipeline) {
            defaultPipeline.bloomEnabled = Boolean(Store.state.graphics.bloom);
            defaultPipeline.fxaaEnabled = Boolean(Store.state.graphics.fxaaEnabled);
            defaultPipeline.samples = Number(Store.state.graphics.msaa);
            defaultPipeline.sharpenEnabled = Boolean(Store.state.graphics.sharpen);
        }
    }

    private _handleDontDestroyOnLoadObjects() : void {
        if (!this._preScene) {
            return;
        }

        GameObject.dontDestroyOnLoadList.forEach((gameObj) => {
            if (this._preScene === gameObj.getScene()) {
                // remove GameObject form pervious scene
                this._preScene.removeMesh(gameObj, true);
                // add GameObject to new scene
                gameObj._scene = this._scene;
                gameObj.uniqueId = this._scene.getUniqueId();
                this._scene.addMesh(gameObj, true);

                const nodes = gameObj.getChildTransformNodes(false);

                nodes.forEach((component) => {
                    if (component instanceof ScriptComponent) {
                        // remove component form pervious scene
                        this._preScene?.removeTransformNode(component);
                        // add component to new scene
                        component._scene = this._scene;
                        component.uniqueId = this._scene.getUniqueId();
                        this._scene.addTransformNode(component);

                        reattachScript(this._scene, component);
                    }
                });
            }
        });
    }

    // TODO: Move this code/set of code into its own module.
    private _onKeyUp(evt: ActionEvent) : void {
        // eslint-disable-next-line no-void
        void this._handleKeyUp(evt);
    }

    private async _handleKeyUp(evt: ActionEvent) :Promise<void> {
        /* eslint-disable @typescript-eslint/no-unsafe-member-access */
        switch (evt.sourceEvent.code) {
            case "Slash":
                if (process.env.NODE_ENV === "development"
                && evt.sourceEvent.shiftKey) {
                    if (this._scene.debugLayer.isVisible()) {
                        this._scene.debugLayer.hide();
                    } else {
                        await this._scene.debugLayer.show({ overlay: true });
                    }
                }
                break;
            case Store.state.controls.other.resetPosition?.keybind:
                this.resetMyAvatarPositionAndOrientation();
                break;
            case "KeyM":
                if (process.env.NODE_ENV === "development" && evt.sourceEvent.shiftKey) {
                    await this.loadMyAvatar();
                }
                break;
            case "KeyG":
                if (process.env.NODE_ENV === "development") {
                    this._sceneController?.applyGravity();
                }
                break;
            case "KeyP":
                if (process.env.NODE_ENV === "development") {
                    this._scene.meshes.forEach((mesh, index) => {
                        console.log(`${mesh.name}:${index} `);
                    });
                }
                break;
            default:
                break;
        }
    }

    private _onSceneReady():void {
        requireScripts(this._scene, this._scene.transformNodes);

        this._handleDontDestroyOnLoadObjects();

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

        // Update the rendering pipeline when graphics settings are changed.
        this._updateRenderPipelineSettings();
        Store.watch((state) => state.graphics, () => {
            this._updateRenderPipelineSettings();
        });
    }
}
