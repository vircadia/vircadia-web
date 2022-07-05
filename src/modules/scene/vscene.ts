/*
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

// This is disabled because TS complains about BABYLON's use of cap'ed function names
/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { AnimationGroup, Engine, MeshBuilder, Scene, SceneLoader,
    ActionManager, ActionEvent, ExecuteCodeAction, ArcRotateCamera, StandardMaterial,
    Mesh, HemisphericLight, DefaultRenderingPipeline, Camera, AbstractMesh,
    AssetsManager } from "@babylonjs/core";

import { AdvancedDynamicTexture, TextBlock, Control } from "@babylonjs/gui";

import { Color3, Color4, Vector3 } from "@babylonjs/core/Maths/math";
import "@babylonjs/loaders/glTF";
import "@babylonjs/core/Meshes/meshBuilder";
// General Modules
import Log from "@Modules/debugging/log";
// System Modules
import { v4 as uuidv4 } from "uuid";
import { VVector3 } from ".";
import { AvatarController } from "@Modules/avatar";


/**
 * this.addEntity() takes parameters describing the entity to create and add to
 * the scene. This interface defines the parameters in the definition object
 * passed to addEntity()
 * @typedef Object EntityProps
 */
interface EntityProps {
    id?: string;        // lookup identifier. One is generated if no specified
    name: string;
    type: "Shape" | "Model";
    shape?: "box" | "sphere" | "cylinder" | "cone" | "triangle" ; // if type=="Shape"
    modelUrl?: string;  // if type=="Model"
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number; w?: number };
    dimensions: { x: number; y: number; z: number; };   // scaling
    color?: { r: number; g: number; b: number; a?: number };
}

interface ILoadAvatarAssetsResult {
    readonly avatar:Mesh,
    readonly camera:Camera
}

/**
 * VScene is the interface to a single scene's state, entities, and operations.
 */
export class VScene {
    _sceneId: number;
    _scene: Scene;
    _assetsManager : AssetsManager;
    _entities: Map<string, Mesh>;
    _sceneMeshes: Map<string, AbstractMesh>;
    _avatar : Nullable<AbstractMesh> = null;
    _avatarAnimMesh :Nullable<AbstractMesh> = null;
    _camera : Nullable<Camera> = null;
    _avatarController : Nullable<AvatarController>;
    _avatarAnimationGroups : AnimationGroup[] = [];
    _defaultPipeline : Nullable<DefaultRenderingPipeline>;
    _incrementalLoading = false;
    _defaultEnviroment = false;
    _debugOverlay: Nullable<AdvancedDynamicTexture>;

    constructor(pEngine: Engine, pSceneId = 0) {
        if (process.env.NODE_ENV === "development") {
            import("@babylonjs/core/Debug/debugLayer");
            import("@babylonjs/inspector");
        }

        this._entities = new Map<string, Mesh>();
        this._sceneMeshes = new Map<string, AbstractMesh>();
        this._scene = new Scene(pEngine);
        this._assetsManager = new AssetsManager(this._scene);
        this._scene.actionManager = new ActionManager(this._scene);
        this._scene.actionManager.registerAction(
            new ExecuteCodeAction(ActionManager.OnKeyUpTrigger,
                this._onKeyUp.bind(this))
        );

        this._sceneId = pSceneId;

        this._scene.registerBeforeRender(this._befeforeRender.bind(this));
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

    /**
     * Use the Babylon loader to load a model from an URL and return the Mesh
     * @param name asset name to assign to the loaded mesh
     * @param modelUrl URL to load model from
     * @returns Mesh
     * @throws if loading failed
     */
    async importModel(name: string, modelUrl: string): Promise<Mesh> {
        const parsedUrl = new URL(modelUrl);
        const urlWithoutFilename = modelUrl.substring(0, modelUrl.lastIndexOf("/")) + "/";
        const filename = parsedUrl.pathname.split("/").pop();

        // eslint-disable-next-line new-cap
        const meshes = await SceneLoader.ImportMeshAsync(name, urlWithoutFilename, filename, this._scene);
        return meshes.meshes[0] as Mesh;
    }

    /**
     * Add an entity to the scene.
     *
     * The properties block passed specifies whether to create a primitive object (box,
     * sphere, ...) or to load a model from an URL. The created entity is added to the
     * world at the location/rotation described in the properties
     *
     * @param {EntityProps} pProperties object describing entity to create (see EntityProps)
     * @returns {Promise<string>} Id of the created entity or 'null' if failure.
     */
    async addEntity(pProperties: EntityProps): Promise<Nullable<string>> {
        if (!pProperties.type) {
            Log.error(Log.types.ENTITIES, "Failed to specify entity type.");
            return null;
        }

        let entity: Nullable<Mesh> = undefined;

        // If no UUID is given for the entity, we"ll make one now.
        if (!pProperties.id) {
            pProperties.id = uuidv4();
        }

        // Create the entity.
        switch (pProperties.type) {
            case "Shape":
                if (pProperties.shape) {
                    switch (pProperties.shape.toLowerCase()) {
                        case "box":
                            entity = MeshBuilder.CreateBox(pProperties.name, {}, this._scene);
                            break;
                        case "sphere":
                            entity = MeshBuilder.CreateSphere(pProperties.name, {}, this._scene);
                            break;
                        case "cylinder":
                            entity = MeshBuilder.CreateCylinder(pProperties.name, {}, this._scene);
                            break;
                        case "cone":
                            entity = MeshBuilder.CreateCylinder(pProperties.name, { diameterTop: 0 }, this._scene);
                            break;
                        case "triangle":
                            entity = MeshBuilder.CreateCylinder(pProperties.name, { tessellation: 3 }, this._scene);
                            break;
                        default:
                            Log.error(Log.types.ENTITIES, "Failed to create shape entity, unknown/unsupported shape type: "
                                    + pProperties.shape);
                            return null;
                    }
                } else {
                    Log.error(Log.types.ENTITIES, "Attempted to create type Shape with no shape specified");
                    return null;
                }
                break;
            case "Model":
                if (pProperties.modelUrl) {
                    entity = await this.importModel(pProperties.name, pProperties.modelUrl);
                } else {
                    Log.error(Log.types.ENTITIES, "Attempted to create type Model with no modelUrl specified");
                    return null;
                }
                break;
            default:
                Log.error(Log.types.ENTITIES, `Unspecified entity type. props=${JSON.stringify(pProperties)}`);
                entity = MeshBuilder.CreateBox(pProperties.name, {}, this._scene);
                break;
        }

        if (entity) {
            // Set the ID.
            entity.id = pProperties.id;

            // Rotate and position the entity.
            entity.position = new Vector3(pProperties.position.x, pProperties.position.y, pProperties.position.z);
            entity.rotation = new Vector3(pProperties.rotation.x, pProperties.rotation.y, pProperties.rotation.z);

            // Scale the entity.
            entity.scaling = new Vector3(pProperties.dimensions.x, pProperties.dimensions.y, pProperties.dimensions.z);

            // Apply a color if requested.
            if (pProperties.color) {
                const colorMaterial = new StandardMaterial(pProperties.name + "-material", this._scene);
                colorMaterial.emissiveColor = new Color3(pProperties.color.r, pProperties.color.g, pProperties.color.b);
                entity.material = colorMaterial;
            }

            Log.info(Log.types.ENTITIES, "Successfully created entity: " + entity.id);

            this._entities.set(entity.id, entity);

            return entity.id;
        }
        Log.error(Log.types.ENTITIES, "Failed to create entity.");
        return null;
    }

    // Scripting would look like:
    // sceneInstance.deleteById
    deleteEntityById(id: string): void {
        const entityToDelete = this._scene.getNodeByID(id);

        if (entityToDelete) {
            entityToDelete.dispose();
            // eslint-disable-next-line @typescript-eslint/dot-notation
            this._entities.delete(id);
        } else {
            Log.error(Log.types.ENTITIES, `Failed to delete entity by ID: ${id}`);
        }
    }

    // Scripting would look like:
    // sceneInstance.deleteByName
    deleteEntityByName(name: string): void {
        const entityToDelete = this._scene.getNodeByName(name);

        if (entityToDelete) {
            // eslint-disable-next-line @typescript-eslint/dot-notation
            this._entities.delete(entityToDelete.id);
            entityToDelete.dispose();
        } else {
            Log.error(Log.types.ENTITIES, `Failed to delete entity by name: ${name}`);
        }
    }

    public createDefaultEnvionment():void {
        this._scene.createDefaultEnvironment(
            { createGround: false,
                createSkybox: false });

        // this._scene.clearColor = new Color4(0.5, 0.5, 0.5, 1.0);
        // this._scene.ambientColor = new Color3(0.3, 0.3, 0.3);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        // const light = new HemisphericLight("ambient", new Vector3(0, 1, 0), this._scene);
    }

    public async loadSceneSpaceStation(): Promise<void> {
        this._scene.getEngine().displayLoadingUI();

        this._unloadEnvionment();

        await this.loadAvatarAssets();
        // setup avatar
        if (this._avatar) {
            this._avatar.position = new Vector3(0, 49.6, 0);
            this._avatar.rotation = new Vector3(0, 0, 0);
        }

        // setup camera
        const camera = this._camera as ArcRotateCamera;
        if (camera) {
            camera.minZ = 1;
            camera.maxZ = 250000;
            camera.alpha = -Math.PI / 2;
            camera.beta = Math.PI / 2;
            camera.parent = this._avatar as Mesh;
        }

        await this.loadSpaceStationEnvironment();

        await this._scene.whenReadyAsync();
        this._scene.getEngine().hideLoadingUI();
    }

    public async loadSceneUA92Campus(): Promise<void> {
        this._scene.getEngine().displayLoadingUI();

        this._unloadEnvionment();

        await this.loadAvatarAssets();
        // setup avatar
        if (this._avatar) {
            this._avatar.position = new Vector3(25, 0, 30);
            this._avatar.rotation = new Vector3(0, Math.PI, 0);
        }

        // setup camera
        const camera = this._camera as ArcRotateCamera;
        if (camera) {
            camera.minZ = 1;
            camera.maxZ = 2000;
            camera.alpha = -Math.PI / 2;
            camera.beta = Math.PI / 2;
            camera.parent = this._avatar as Mesh;
        }

        await this.loadUA92CampusEnvironment();

        await this._scene.whenReadyAsync();
        this._scene.getEngine().hideLoadingUI();
    }

    public async loadAvatarAssets(): Promise<void> {
        await this._loadAvatarAssets();
        if (this._avatar && this._camera) {
            this._avatarController = new AvatarController(this._avatar, this._camera,
                this._scene, this._avatarAnimationGroups);
            this._avatarController.start();
        }
    }

    public async loadSpaceStationEnvironment(): Promise<void> {
        await this._loadEnvionment("https://staging.vircadia.com/O12OR634/SpaceStation/",
            ["SpaceStation_Inside_Floor.glb"],
            [
                "SpaceStation_HDRI.glb",
                "SpaceStation_Inside_Desk.glb",
                "SpaceStation_Inside_Furniture.glb",
                "SpaceStation_Inside_Light.glb",
                "SpaceStation_Inside_Tableware.glb",
                "SpaceStation_Light.glb",
                "SpaceStation_Planet_A.glb",
                "SpaceStation_Planet_B.glb",
                "SpaceStation_Station_Body_01.glb",
                "SpaceStation_Station_Body_02.glb",
                "SpaceStation_Station_Station_Part.glb",
                "SpaceStation_Stone.glb",
                "SpaceStation_Ship.glb"
            ]
        );

        if (this._defaultPipeline) {
            this._defaultPipeline.glowLayerEnabled = true;
            if (this._defaultPipeline.glowLayer) {
                this._defaultPipeline.glowLayer.blurKernelSize = 16;
                this._defaultPipeline.glowLayer.intensity = 0.5;
            }

            this._defaultPipeline.fxaaEnabled = true;
        }
    }

    public async loadUA92CampusEnvironment(): Promise<void> {
        await this._loadEnvionment("https://staging.vircadia.com/O12OR634/UA92/",
            ["UA92_7-5-2022a.glb"], null
        );

        if (this._defaultPipeline) {
            this._defaultPipeline.fxaaEnabled = true;
        }

    }

    _processSceneMesh(mesh : AbstractMesh) : void {
        mesh.id = uuidv4();
        this._sceneMeshes.set(mesh.id, mesh);

        VScene._applySceneMeshRule(mesh);

        const nodes = mesh.getChildren();
        nodes.forEach((node) => {
            VScene._applySceneMeshRule(node as AbstractMesh);
        });
    }

    static _applySceneMeshRule(mesh : AbstractMesh) : void {
        if (mesh.name !== "Inside_Floor_B_01" && mesh.name !== "Inside_Floor_D_01") {
            mesh.isPickable = false;
        }
    }

    _befeforeRender() : void {
        if (this._incrementalLoading) {
            this._assetsManager.load();
            this._incrementalLoading = false;
        }
    }

    async _loadAvatarAnimations(modelUrl: string): Promise<AbstractMesh> {
        const parsedUrl = new URL(modelUrl);
        const urlWithoutFilename = modelUrl.substring(0, modelUrl.lastIndexOf("/")) + "/";
        const filename = parsedUrl.pathname.split("/").pop();

        const result = await SceneLoader.ImportMeshAsync("",
            urlWithoutFilename, filename, this._scene);

        const mesh = result.meshes[0].getChildren()[0] as AbstractMesh;

        result.animationGroups.forEach((sourceAnimGroup) => {

            const animGroup = new AnimationGroup(sourceAnimGroup.name);
            // scale of Armature
            const scale = mesh.scaling;

            // trim unnecessary animation data
            sourceAnimGroup.targetedAnimations.forEach((targetAnim) => {
                // scale postion animation of Hips node
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                if (targetAnim.target.name === "Hips" && targetAnim.animation.targetProperty === "position") {
                    const anim = targetAnim.animation.clone();
                    const keys = anim.getKeys();
                    keys.forEach((keyFrame) => {
                        const pos = keyFrame.value as Vector3;
                        keyFrame.value = pos.multiply(scale);
                    });

                    animGroup.addTargetedAnimation(anim, targetAnim.target);
                // keep rotationQuaternion animation of all nodes
                } else if (targetAnim.animation.targetProperty === "rotationQuaternion") {
                    animGroup.addTargetedAnimation(targetAnim.animation, targetAnim.target);
                }
            });
            this._avatarAnimationGroups.push(animGroup);

            sourceAnimGroup.dispose();
        });

        mesh.parent?.dispose();

        return mesh;
    }


    private async _loadAvatarAssets() : Promise<void> {
        // load avatar animation
        if (!this._avatarAnimMesh) {
            this._avatarAnimMesh = await this._loadAvatarAnimations(
                "https://staging.vircadia.com/O12OR634/UA92/AnimationsBasic.glb");
        }
        // load avatar mesh
        if (!this._avatar) {
            const result = await SceneLoader.ImportMeshAsync("",
                "https://staging.vircadia.com/O12OR634/UA92/", "sara.glb", this._scene);
            result.meshes.forEach((mesh) => {
                mesh.isPickable = false;
            });

            const avatar = result.meshes[0];
            avatar.scaling = new Vector3(1, 1, 1);

            const avatarMesh = avatar.getChildren()[0] as AbstractMesh;
            avatarMesh.rotationQuaternion = this._avatarAnimMesh.rotationQuaternion;

            // Creates, angles, distances and targets the camera
            if (!this._camera) {
                const camera = new ArcRotateCamera(
                    "Camera", -Math.PI / 2, Math.PI / 2, 6,
                    new Vector3(0, 1, 0), this._scene);

                // This attaches the camera to the canvas
                camera.attachControl(this._scene.getEngine().getRenderingCanvas(), true);
                camera.wheelPrecision = 50;

                this._scene.activeCamera = camera;
                this._camera = camera;
            }

            this._avatar = avatar;
        }
    }


    private async _loadEnvionment(rootUrl:string,
        meshList:string[],
        incrementalMeshList:string[] | null | undefined) : Promise<void> {

        meshList.forEach((filename) => {
            const task = this._assetsManager.addMeshTask("SceneIncrementalLoading", "", rootUrl, filename);
            task.onSuccess = (meshAssetTask) => {
                meshAssetTask.loadedMeshes.forEach(this._processSceneMesh.bind(this));
            };
        });
        await this._assetsManager.loadAsync();

        if (incrementalMeshList) {
            incrementalMeshList.forEach((filename) => {
                const task = this._assetsManager.addMeshTask("SceneIncrementalLoading", "", rootUrl, filename);
                task.onSuccess = (meshAssetTask) => {
                    meshAssetTask.loadedMeshes.forEach(this._processSceneMesh.bind(this));
                };
            });

            this._incrementalLoading = true;
        } else {
            this._incrementalLoading = false;
        }

        // Create default pipeline
        if (!this._defaultPipeline) {
            this._defaultPipeline = new DefaultRenderingPipeline("default", true, this._scene, this._scene.cameras);
        }
    }

    private _unloadEnvionment() : void {
        this._sceneMeshes.forEach((mesh) => {
            mesh.dispose();
        });
        this._sceneMeshes.clear();

        if (this._defaultPipeline) {
            this._defaultPipeline.glowLayerEnabled = false;
        }
    }

    private _unloadAvatar() {
        if (this._avatar) {
            if (this._camera) {
                this._camera.parent = null;
            }

            this._avatar.dispose();
            this._avatar = null;

            if (this._avatarController) {
                this._avatarController.stop();
                this._avatarController = null;
            }
        }
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
                        await this._scene.debugLayer.show();
                    }
                }
                break;
            case "Backslash":
                if (process.env.NODE_ENV === "development"
                    && evt.sourceEvent.shiftKey) {
                    if (!this._debugOverlay) {
                        this._createDebugOverlay();
                    } else {
                        this._debugOverlay.dispose();
                        this._debugOverlay = null;
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
            default:
                break;
        }
    }

    private _createDebugOverlay():void {
        this._debugOverlay = AdvancedDynamicTexture.CreateFullscreenUI("UI");

        const fps = new TextBlock();
        fps.text = "fps";
        fps.fontSize = "24px";
        fps.top = -100;
        fps.left = -100;
        fps.color = "white";
        fps.resizeToFit = true;
        fps.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        fps.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this._debugOverlay.addControl(fps);

        this._scene.registerBeforeRender(() => {
            const f = this._scene.getEngine().getFps()
                .toPrecision(2);
            fps.text = "fps:" + f;

        });
    }
}
