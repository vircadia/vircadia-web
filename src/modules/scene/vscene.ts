/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-unused-vars */
/*
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

// This is disabled because TS complains about BABYLON's use of cap'ed function names
/* eslint-disable new-cap */

import { AnimationGroup, Engine, MeshBuilder, Scene, SceneLoader,
    ActionManager, ActionEvent, ExecuteCodeAction, ArcRotateCamera, StandardMaterial,
    Mesh, HemisphericLight, DefaultRenderingPipeline } from "@babylonjs/core";

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

/**
 * VScene is the interface to a single scene's state, entities, and operations.
 */
export class VScene {
    _sceneId: number;
    _scene: Scene;
    _entities: Map<string, Mesh>;
    _avatarController : Nullable<AvatarController>;
    _avatarAnimationGroups : AnimationGroup[] = [];

    constructor(pEngine: Engine, pSceneId = 0) {
        if (process.env.NODE_ENV === "development") {
            import("@babylonjs/core/Debug/debugLayer");
            import("@babylonjs/inspector");
        }

        this._entities = new Map<string, Mesh>();
        this._scene = new Scene(pEngine);

        this._scene.actionManager = new ActionManager(this._scene);
        this._scene.actionManager.registerAction(
            new ExecuteCodeAction(ActionManager.OnKeyUpTrigger,
                this._onKeyUp.bind(this))
        );

        this._sceneId = pSceneId;

        this._loadSecondarySceneAsync = this._loadSecondarySceneAsync.bind(this);
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

    async loadAvatarAnimations(modelUrl: string): Promise<Mesh> {
        const parsedUrl = new URL(modelUrl);
        const urlWithoutFilename = modelUrl.substring(0, modelUrl.lastIndexOf("/")) + "/";
        const filename = parsedUrl.pathname.split("/").pop();

        const result = await SceneLoader.ImportMeshAsync("",
            urlWithoutFilename, filename, this._scene);

        const mesh = result.meshes[0].getChildren()[0] as Mesh;

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

    async _loadSceneMesh(rootUrl: string, filename: string): Promise<void> {
        const result = await SceneLoader.ImportMeshAsync("", rootUrl, filename, this._scene);

        result.meshes.forEach((mesh) => {
            const nodes = mesh.getChildren(undefined, false);
            nodes.forEach((node) => {
                const subMesh = node as Mesh;
                if (subMesh.name !== "Inside_Floor_B_01" && subMesh.name !== "Inside_Floor_D_01") {
                    subMesh.isPickable = false;
                }
            });
        });
    }

    _loadSceneMeshAsync(rootUrl: string, filename: string): void {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        SceneLoader.ImportMeshAsync("", rootUrl, filename, this._scene).then((result) => {
            result.meshes.forEach((mesh) => {
                const nodes = mesh.getChildren(undefined, false);
                nodes.forEach((node) => {
                    const subMesh = node as Mesh;
                    if (subMesh.name !== "Inside_Floor_B_01" && subMesh.name !== "Inside_Floor_D_01") {
                        subMesh.isPickable = false;
                    }
                });
            });
        });
    }

    async _loadPrimaryScene(): Promise<void> {
        this._scene.clearColor = new Color4(0.5, 0.5, 0.5, 1.0);
        this._scene.ambientColor = new Color3(0.3, 0.3, 0.3);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const light = new HemisphericLight("light", new Vector3(0, 1, 0), this._scene);

        const sceneRootUrl = "http://localhost:8080/assets/scenes/SpaceStation/";

        await this._loadSceneMesh(sceneRootUrl, "SpaceStation_Inside_Floor.glb");
    }

    _loadSecondarySceneAsync() : void {
        const sceneRootUrl = "http://localhost:8080/assets/scenes/SpaceStation/";

        this._loadSceneMeshAsync(sceneRootUrl, "SpaceStation_HDRI.glb");
        this._loadSceneMeshAsync(sceneRootUrl, "SpaceStation_Inside_Desk.glb");
        this._loadSceneMeshAsync(sceneRootUrl, "SpaceStation_Inside_Furniture.glb");
        this._loadSceneMeshAsync(sceneRootUrl, "SpaceStation_Inside_Light.glb");
        this._loadSceneMeshAsync(sceneRootUrl, "SpaceStation_Inside_Tableware.glb");
        this._loadSceneMeshAsync(sceneRootUrl, "SpaceStation_Light.glb");
        this._loadSceneMeshAsync(sceneRootUrl, "SpaceStation_Planet_A.glb");
        this._loadSceneMeshAsync(sceneRootUrl, "SpaceStation_Planet_B.glb");
        this._loadSceneMeshAsync(sceneRootUrl, "SpaceStation_Station_Body_01.glb");
        this._loadSceneMeshAsync(sceneRootUrl, "SpaceStation_Station_Body_02.glb");
        this._loadSceneMeshAsync(sceneRootUrl, "SpaceStation_Station_Station_Part.glb");
        this._loadSceneMeshAsync(sceneRootUrl, "SpaceStation_Stone.glb");

        // eslint-disable-next-line @typescript-eslint/unbound-method
        this._scene.unregisterBeforeRender(this._loadSecondarySceneAsync);
    }

    /**
     * Build a simple test collection of entities in this scene. Also includes some testing operations.
     * @returns {Promise<void>} when completed
     */
    async buildTestScene(): Promise<void> {
        const aScene = this._scene;

        await this._loadPrimaryScene();

        // eslint-disable-next-line @typescript-eslint/unbound-method
        this._scene.registerBeforeRender(this._loadSecondarySceneAsync);

        const animMesh = await this.loadAvatarAnimations(
            "http://localhost:8080/assets/avatars/animations/AnimationsBasic.glb");

        // load avatar mesh
        const result = await SceneLoader.ImportMeshAsync("",
            "http://localhost:8080/assets/avatars/meshes/", "nolan.glb", aScene);

        const avatar = result.meshes[0] as Mesh;

        avatar.scaling = new Vector3(1, 1, 1);
        avatar.position = new Vector3(0, 49.6, 0);

        const avatarMesh = avatar.getChildren()[0] as Mesh;
        avatarMesh.rotationQuaternion = animMesh.rotationQuaternion;

        // Creates, angles, distances and targets the camera
        const camera = new ArcRotateCamera(
            "Camera", -Math.PI / 2, Math.PI / 2, 6,
            new Vector3(0, 1, 0), aScene);

        // This attaches the camera to the canvas
        camera.attachControl(aScene.getEngine().getRenderingCanvas(), true);
        camera.parent = avatar;
        camera.minZ = 1;
        camera.maxZ = 250000;
        camera.wheelPrecision = 50;

        this._avatarController = new AvatarController(avatar, camera, aScene, this._avatarAnimationGroups);
        this._avatarController.start();

        // Create default pipeline
        const defaultPipeline = new DefaultRenderingPipeline("default", true, this._scene, [camera]);
        defaultPipeline.glowLayerEnabled = true;
        if (defaultPipeline.glowLayer) {
            defaultPipeline.glowLayer.blurKernelSize = 16;
            defaultPipeline.glowLayer.intensity = 0.5;
        }

        defaultPipeline.fxaaEnabled = true;
    }

    // eslint-disable-next-line class-methods-use-this
    private _onKeyUp(evt: ActionEvent) :void {
        /* eslint-disable @typescript-eslint/no-unsafe-member-access */
        switch (evt.sourceEvent.code) {
            case "Slash":
                if (process.env.NODE_ENV === "development"
                && evt.sourceEvent.shiftKey) {
                    if (this._scene.debugLayer.isVisible()) {
                        this._scene.debugLayer.hide();
                    } else {
                        // eslint-disable-next-line @typescript-eslint/no-floating-promises
                        this._scene.debugLayer.show();
                    }
                }
                break;

            default:
                break;
        }
        /* eslint-enbale @typescript-eslint/no-unsafe-member-access */
    }
}
