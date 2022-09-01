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
    ActionManager, ActionEvent, ExecuteCodeAction, ArcRotateCamera, Camera, Observable } from "@babylonjs/core";

import { Quaternion, Vector3 } from "@babylonjs/core/Maths/math";
import "@babylonjs/loaders/glTF";
import "@babylonjs/core/Meshes/meshBuilder";
import { ResourceManager } from "./resource";
import { DomainController } from "./DomainController";
import { GameObject, MeshComponent } from "@Modules/object";
import { ScriptComponent, requireScript, requireScripts, reattachScript } from "@Modules/script";
import { AvatarController, MyAvatarController, ScriptAvatarController } from "@Modules/avatar";
import { IEntity, IEntityDescription, EntityBuilder } from "@Modules/entity";
import { ScriptAvatar } from "@vircadia/web-sdk";
import { CAMPUS_URL, SPACE_STATION_URL } from "@Base/config";
import { Utility } from "@Modules/utility";

// General Modules
import Log from "@Modules/debugging/log";
// System Modules
import { VVector3 } from ".";

const DefaultAvatarUrl = "https://staging.vircadia.com/O12OR634/UA92/sara.glb";
const AvatarAnimationUrl = "https://staging.vircadia.com/O12OR634/UA92/AnimationsBasic.glb";
const DefaultSceneUrl = "/assets/scenes/default.json";

type DomainName = "Campus" | "SpaceStation";

/**
 * VScene is the interface to a single scene's state, entities, and operations.
 */
export class VScene {
    _sceneId: number;
    _engine: Engine;
    _scene: Scene;
    _preScene: Nullable<Scene> = null;
    _myAvatar: Nullable<GameObject> = null;
    _myAvatarSpawnPosition:Vector3 = Vector3.Zero();
    _myAvatarSpawnOrientation:Quaternion = Quaternion.Identity();

    _avatarList : Map<string, GameObject>;
    _camera : Nullable<Camera> = null;
    _avatarAnimationGroups : AnimationGroup[] = [];
    _resourceManager : Nullable<ResourceManager> = null;
    _incrementalMeshList : Nullable<Array<string>> = null;
    _rootUrl = "";
    _domainController : Nullable<DomainController> = null;
    _sceneManager : Nullable<GameObject> = null;
    _currentDomain: DomainName = "Campus";
    private _myAvatarModelChangedObservable: Observable<GameObject> = new Observable<GameObject>();

    public get myAvatarModelChangedObservable(): Observable<GameObject> {
        return this._myAvatarModelChangedObservable;
    }

    constructor(pEngine: Engine, pSceneId = 0) {
        if (process.env.NODE_ENV === "development") {
            import("@babylonjs/core/Debug/debugLayer");
            import("@babylonjs/inspector");
        }

        this._engine = pEngine;
        this._scene = new Scene(pEngine);
        this._sceneId = pSceneId;
        this._avatarList = new Map<string, GameObject>();
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

    render():void {
        this._scene.render();
    }

    public async load(sceneUrl ?: string, avatarPos ?: Vector3, avatarQuat ?: Quaternion,
        beforeLoading ?: ()=> void, afterLoading ?: ()=> void) : Promise<void> {
        this._engine.displayLoadingUI();
        this._scene.detachControl();
        this._preScene = this._scene;
        this._createScene();

        if (beforeLoading) {
            beforeLoading();
        }

        // create camera
        const camera = new ArcRotateCamera(
            "Camera", -Math.PI / 2, Math.PI / 2, 6,
            new Vector3(0, 1, 0), this._scene);

        // This attaches the camera to the canvas
        camera.attachControl(this._scene.getEngine().getRenderingCanvas(), false);
        camera.wheelPrecision = 50;
        camera.minZ = 1;
        camera.maxZ = 250000;
        camera.alpha = Math.PI / 2;
        camera.beta = Math.PI / 2;

        this._scene.activeCamera = camera;
        this._camera = camera;

        await this.loadMyAvatar();
        // setup avatar
        if (this._myAvatar) {
            this._myAvatar.position = avatarPos ?? new Vector3(0, 1, 0);
            this._myAvatar.rotationQuaternion = avatarQuat ?? Quaternion.Identity();

            this._myAvatarSpawnPosition = this._myAvatar.position.clone();
            this._myAvatarSpawnOrientation = this._myAvatar.rotationQuaternion.clone();
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

        this._engine.hideLoadingUI();
    }

    public resetMyAvatarPositionAndOrientation() : void {
        if (this._myAvatar) {
            this.teleportMyAvatar(this._myAvatarSpawnPosition.clone(),
                this._myAvatarSpawnOrientation.clone());
        }
    }

    public setMyAvatarPosition(position: Vector3) : void {
        if (this._myAvatar) {
            this._myAvatar.position = position;
        }
    }

    public teleportMyAvatar(position: Vector3 | undefined, rotation: Quaternion | undefined) : void {
        if (this._myAvatar) {
            this._scene.detachControl();

            this._myAvatar.position = position ?? Vector3.Zero();
            this._myAvatar.rotationQuaternion = rotation ?? Quaternion.Identity();

            const controller = this._myAvatar.getComponent(AvatarController.typeName) as AvatarController;
            controller.isTeleported = true;

            this._scene.attachControl();
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

    public async loadSceneSpaceStation(): Promise<void> {
        this._currentDomain = "SpaceStation";

        await this.load("/assets/scenes/spacestation.json",
            new Vector3(0, 58, 0));
    }

    public async loadSceneUA92Campus(): Promise<void> {
        this._currentDomain = "Campus";

        await this.load("/assets/scenes/campus.json",
            new Vector3(25, 1, 30));
    }

    public async goToDomain(dest: string): Promise<void> {
        Log.info(Log.types.ENTITIES, `Go to domain: ${dest}`);
        const domain = dest.toLocaleUpperCase();
        if (domain.includes("campus")) {
            await Utility.connectionSetup(CAMPUS_URL);
        } else {
            await Utility.connectionSetup(SPACE_STATION_URL);
        }
    }

    public async switchDomain(): Promise<void> {
        if (this._currentDomain === "Campus") {
            await Utility.connectionSetup(SPACE_STATION_URL);
        } else {
            await Utility.connectionSetup(CAMPUS_URL);
        }
    }

    public async loadMyAvatar(modelURL ?: string) : Promise<Nullable<GameObject>> {
        if (this._resourceManager) {
            if (this._avatarAnimationGroups.length === 0) {

                const result = await this._resourceManager.loadAvatarAnimations(AvatarAnimationUrl);
                this._avatarAnimationGroups = result.animGroups;
            }


            let prevPos = undefined;
            let prevQuat = null;
            let prevMyAvatarInterface = undefined;
            if (this._myAvatar) {
                prevPos = this._myAvatar.position.clone();
                if (this._myAvatar.rotationQuaternion) {
                    prevQuat = this._myAvatar.rotationQuaternion.clone();
                }

                const controller = this._myAvatar.getComponent(MyAvatarController.typeName) as MyAvatarController;
                prevMyAvatarInterface = controller.myAvatar;
                if (this._camera) {
                    this._camera.parent = null;
                }

                this._myAvatar.dispose();
            }

            this._myAvatar = new GameObject("MyAvatar", this._scene);
            if (prevPos) {
                this._myAvatar.position = prevPos;
                this._myAvatar.rotationQuaternion = prevQuat;
            }

            const mesh = await this._resourceManager.loadMyAvatar(modelURL ?? DefaultAvatarUrl);
            if (mesh) {
                const meshComponent = new MeshComponent();
                meshComponent.mesh = mesh;
                this._myAvatar.addComponent(meshComponent);
            }
            const avatarController = new AvatarController();
            avatarController.animGroups = this._avatarAnimationGroups;
            this._myAvatar.addComponent(avatarController);

            const myAvatarController = new MyAvatarController();
            this._myAvatar.addComponent(myAvatarController);
            if (prevMyAvatarInterface) {
                myAvatarController.myAvatar = prevMyAvatarInterface;
            }
            myAvatarController.skeletonModelURL = modelURL;

            if (this._camera) {
                this._camera.parent = this._myAvatar;
            }

            this._myAvatarModelChangedObservable.notifyObservers(this._myAvatar);
        }

        return this._myAvatar;
    }

    public async loadAvatar(id: string, domain: ScriptAvatar) : Promise<Nullable<GameObject>> {
        Log.debug(Log.types.AVATAR,
            `Load avatar. id: ${id} url: ${domain.skeletonModelURL} `);

        let avatar = this._avatarList.get(id);
        if (avatar) {
            avatar.dispose();
        }

        if (this._resourceManager && domain.skeletonModelURL !== "") {
            avatar = new GameObject("ScriptAvatar_" + id, this._scene);
            const mesh = await this._resourceManager.loadAvatar(domain.skeletonModelURL);
            if (mesh) {
                avatar.id = id;
                const meshComponent = new MeshComponent();
                meshComponent.node = mesh;
                avatar.addComponent(meshComponent);
                avatar.addComponent(new ScriptAvatarController(domain));

                this._avatarList.set(id, avatar);
            }
            return avatar;
        }

        return null;
    }

    public unloadAvatar(id: string) : void {
        Log.debug(Log.types.AVATAR,
            `Load avatar. id: ${id}`);

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

    private _createScene() : void {
        this._scene = new Scene(this._engine);
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
        }

        if (this._domainController) {
            this._domainController.vscene = this;
        }

        this._scene.onReadyObservable.add(this._onSceneReady.bind(this));
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
            case "KeyR":
                if (evt.sourceEvent.shiftKey) {
                    this.resetMyAvatarPositionAndOrientation();
                }
                break;
            case "Space":
                if (evt.sourceEvent.shiftKey) {
                    await this.loadSceneSpaceStation();
                }
                break;
            case "KeyU":
                if (evt.sourceEvent.shiftKey) {
                    await this.loadSceneUA92Campus();
                }
                break;
            case "KeyM":
                if (process.env.NODE_ENV === "development" && evt.sourceEvent.shiftKey) {
                    await this.loadMyAvatar();
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

        if (this._incrementalMeshList) {
            this._scene.onBeforeRenderObservable.addOnce(() => {
                this._resourceManager?.addSceneObjectTasks("SceneIncrementalLoading",
                    this._rootUrl, this._incrementalMeshList as string[]);
                // eslint-disable-next-line no-void
                void this._resourceManager?.loadAsync();

                this._incrementalMeshList = null;
            });
        }

        if (!this._scene.activeCamera) {
            this._scene.createDefaultCamera(true, true, true);
        }
    }
}
