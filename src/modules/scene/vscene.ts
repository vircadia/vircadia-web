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

import { AnimationGroup, Engine, Scene,
    ActionManager, ActionEvent, ExecuteCodeAction, ArcRotateCamera, StandardMaterial,
    Mesh, DefaultRenderingPipeline, Camera, AbstractMesh,
    TransformNode } from "@babylonjs/core";

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

// General Modules
import Log from "@Modules/debugging/log";
// System Modules
import { VVector3 } from ".";

const DefaultAvatarUrl = "https://staging.vircadia.com/O12OR634/UA92/sara.glb";
const AvatarAnimationUrl = "https://staging.vircadia.com/O12OR634/UA92/AnimationsBasic.glb";
const DefaultSceneUrl = "/assets/scenes/default.json";


/**
 * VScene is the interface to a single scene's state, entities, and operations.
 */
export class VScene {
    _sceneId: number;
    _engine: Engine;
    _scene: Scene;
    _preScene: Nullable<Scene> = null;
    _myAvatar: Nullable<GameObject> = null;
    _avatarList : Map<string, GameObject>;
    _camera : Nullable<Camera> = null;
    _avatarAnimationGroups : AnimationGroup[] = [];
    _resourceManager : Nullable<ResourceManager> = null;
    _incrementalMeshList : Nullable<Array<string>> = null;
    _rootUrl = "";
    _domainController : Nullable<DomainController> = null;
    _sceneManager : Nullable<GameObject> = null;

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

    render():void {
        this._scene.render();
    }

    public async load(sceneUrl ?: string, beforeLoading ?: ()=> void, afterLoading ?: ()=> void) : Promise<void> {
        this._engine.displayLoadingUI();
        this._scene.detachControl();
        this._preScene = this._scene;
        this._createScene();

        if (beforeLoading) {
            beforeLoading();
        }

        await this.loadMyAvatar();
        // setup avatar
        if (this._myAvatar) {
            this._myAvatar.position = new Vector3(0, 1, 0);
            // this._myAvatar.rotation = new Vector3(0, Math.PI, 0);
        }

        // setup camera
        const camera = this._camera as ArcRotateCamera;
        if (camera) {
            // camera.minZ = 0.1;
            // camera.maxZ = 2500;
            camera.minZ = 1;
            camera.maxZ = 250000;
            camera.alpha = Math.PI / 2;
            camera.beta = Math.PI / 2;
            camera.parent = this._myAvatar as Mesh;
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

    public loadEntity(entity: IEntity) : void {
        const entityBuilder = new EntityBuilder();
        entityBuilder.buildEntity(entity, this._scene);
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
        const entityBuilder = new EntityBuilder();
        entityDescription.Entities.forEach((props) => {
            entityBuilder.buildEntity(props, this._scene);
        });

        Log.info(Log.types.ENTITIES, "Load Entities done.");
    }

    public async loadSceneSpaceStation(): Promise<void> {
        await this.load("/assets/scenes/spacestation.json",
            () => {
                this._scene.createDefaultEnvironment(
                    { createGround: false,
                        createSkybox: false,
                        environmentTexture: "https://assets.babylonjs.com/textures/night.env" });

                const defaultPipeline = new DefaultRenderingPipeline("default", true, this._scene, this._scene.cameras);
                defaultPipeline.fxaaEnabled = true;

                defaultPipeline.glowLayerEnabled = true;
                if (defaultPipeline.glowLayer) {
                    defaultPipeline.glowLayer.blurKernelSize = 16;
                    defaultPipeline.glowLayer.intensity = 0.5;
                }
            },
            () => {
                if (this._myAvatar) {
                    this._myAvatar.position = new Vector3(0, 50.6, 0);
                }
            });
    }

    public async loadSceneUA92Campus(): Promise<void> {
        await this.load("/assets/scenes/campus.json",
            () => {
                this._scene.createDefaultEnvironment(
                    { createGround: false,
                        createSkybox: false,
                        environmentTexture: "https://assets.babylonjs.com/textures/country.env" });

                const defaultPipeline = new DefaultRenderingPipeline("default", true, this._scene, this._scene.cameras);
                defaultPipeline.fxaaEnabled = true;
            },
            () => { // setup avatar
                if (this._myAvatar) {
                    this._myAvatar.position = new Vector3(25, 1, 30);
                }
            });
    }

    public async loadMyAvatar(modelURL ?: string) : Promise<Nullable<GameObject>> {
        // Creates, angles, distances and targets the camera
        const camera = new ArcRotateCamera(
            "Camera", -Math.PI / 2, Math.PI / 2, 6,
            new Vector3(0, 1, 0), this._scene);

        // This attaches the camera to the canvas
        camera.attachControl(this._scene.getEngine().getRenderingCanvas(), false);
        camera.wheelPrecision = 50;

        this._scene.activeCamera = camera;
        this._camera = camera;

        if (this._resourceManager) {
            if (this._avatarAnimationGroups.length === 0) {

                const result = await this._resourceManager.loadAvatarAnimations(AvatarAnimationUrl);
                this._avatarAnimationGroups = result.animGroups;
            }

            this._myAvatar = new GameObject("MyAvatar", this._scene);

            const mesh = await this._resourceManager.loadMyAvatar(modelURL ?? DefaultAvatarUrl);
            if (mesh) {
                const meshComponent = new MeshComponent();
                meshComponent.mesh = mesh;
                this._myAvatar.addComponent(meshComponent);
            }
            const avatarController = new AvatarController();
            avatarController.animGroups = this._avatarAnimationGroups;
            this._myAvatar.addComponent(avatarController);

            this._myAvatar.addComponent(new MyAvatarController());
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
            case "Space":
                if (process.env.NODE_ENV === "development"
                    && evt.sourceEvent.shiftKey) {
                    await this.loadSceneSpaceStation();
                }
                break;
            case "KeyU":
                if (process.env.NODE_ENV === "development"
                        && evt.sourceEvent.shiftKey) {
                    await this.loadSceneUA92Campus();
                }
                break;
            case "KeyE":
                if (process.env.NODE_ENV === "development"
                            && evt.sourceEvent.shiftKey) {

                    await this.load(DefaultSceneUrl);
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
