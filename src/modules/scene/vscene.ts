/*
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

// This is disabled because TS complains about BABYLON's use of cap'ed function names
/* eslint-disable new-cap */

import * as BABYLON from "babylonjs";
import "babylonjs-loaders";
// General Modules
import Log from "@Modules/debugging/log";
// System Modules
import { v4 as uuidv4 } from "uuid";
import { VVector3 } from ".";

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
    _scene: BABYLON.Scene;
    _entities: Map<string, BABYLON.Mesh>;

    constructor(pEngine: BABYLON.Engine, pSceneId = 0) {
        this._entities = new Map<string, BABYLON.Mesh>();
        this._scene = new BABYLON.Scene(pEngine);
        this._sceneId = pSceneId;
    }

    getSceneId(): number {
        return this._sceneId;
    }

    getCameraLocation(pCameraId = 0): BABYLON.Vector3 {
        return this._scene.cameras[pCameraId].position.clone();
    }

    setCameraLocation(pLoc: VVector3, pCameraId = 0): void {
        this._scene.cameras[pCameraId].position.set(pLoc.x, pLoc.y, pLoc.z);
    }

    async importModel(name: string, modelUrl: string): Promise<BABYLON.Mesh> {
        const parsedUrl = new URL(modelUrl);
        const urlWithoutFilename = modelUrl.substring(0, modelUrl.lastIndexOf("/")) + "/";
        const filename = parsedUrl.pathname.split("/").pop();

        // eslint-disable-next-line new-cap
        const meshes = await BABYLON.SceneLoader.ImportMeshAsync(name, urlWithoutFilename, filename, this._scene);
        return meshes.meshes[0] as BABYLON.Mesh;
    }

    /**
     * Add an entity to the scene.
     *
     * The properties block passed specifies whether to create a primitive object (box,
     * sphere, ...) or to load a model from an URL. The created entity is added to the
     * world at the location/rotation described in the properties
     * @param {EntityProps} pProperties object describing entity to create (see EntityProps)
     * @returns {Promise<string>} Id of the created entity or 'null' if failure.
     */
    async addEntity(pProperties: EntityProps): Promise<Nullable<string>> {
        if (!pProperties.type) {
            Log.error(Log.types.ENTITIES, "Failed to specify entity type.");
            return null;
        }

        let entity: Nullable<BABYLON.Mesh> = undefined;

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
                            entity = BABYLON.MeshBuilder.CreateBox(pProperties.name, {}, this._scene);
                            break;
                        case "sphere":
                            entity = BABYLON.MeshBuilder.CreateSphere(pProperties.name, {}, this._scene);
                            break;
                        case "cylinder":
                            entity = BABYLON.MeshBuilder.CreateCylinder(pProperties.name, {}, this._scene);
                            break;
                        case "cone":
                            entity = BABYLON.MeshBuilder.CreateCylinder(pProperties.name, { diameterTop: 0 }, this._scene);
                            break;
                        case "triangle":
                            entity = BABYLON.MeshBuilder.CreateCylinder(pProperties.name, { tessellation: 3 }, this._scene);
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
                entity = BABYLON.MeshBuilder.CreateBox(pProperties.name, {}, this._scene);
                break;
        }

        if (entity) {
            // Set the ID.
            entity.id = pProperties.id;

            // Rotate and position the entity.
            entity.position = new BABYLON.Vector3(pProperties.position.x, pProperties.position.y, pProperties.position.z);
            entity.rotation = new BABYLON.Vector3(pProperties.rotation.x, pProperties.rotation.y, pProperties.rotation.z);

            // Scale the entity.
            entity.scaling = new BABYLON.Vector3(pProperties.dimensions.x, pProperties.dimensions.y, pProperties.dimensions.z);

            // Apply a color if requested.
            if (pProperties.color) {
                const colorMaterial = new BABYLON.StandardMaterial(pProperties.name + "-material", this._scene);
                colorMaterial.emissiveColor = new BABYLON.Color3(pProperties.color.r, pProperties.color.g, pProperties.color.b);
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

    /**
     * Build a simple test collection of entities in this scene. Also includes some testing operations.
     * @returns {Promise<void>} when completed
     */
    async buildTestScene(): Promise<void> {
        const aScene = this._scene;
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        aScene.clearColor = new BABYLON.Color4(0.8, 0.8, 0.8, 0.0);
        aScene.createDefaultCameraOrLight(true, true, true);
        aScene.createDefaultEnvironment();

        await this.addEntity({
            name: "box",
            type: "Shape",
            shape: "box",
            position: { x: -5, y: 0, z: 0 },
            rotation: { x: -0.2, y: -0.4, z: 0 },
            dimensions: { x: 3, y: 3, z: 3 },
            color: { r: 1, g: 0, b: 0 }
        });

        await this.addEntity({
            name: "sphere",
            type: "Shape",
            shape: "sphere",
            position: { x: -3, y: 0, z: 0 },
            rotation: { x: 0, y: -0.5, z: 0 },
            dimensions: { x: 3, y: 3, z: 3 },
            color: { r: 0, g: 0.58, b: 0.86 }
        });

        await this.addEntity({
            name: "cone",
            type: "Shape",
            shape: "cone",
            position: { x: -1, y: 0, z: 0 },
            rotation: { x: 0, y: -0.5, z: 0 },
            dimensions: { x: 1, y: 1, z: 1 },
            color: { r: 1, g: 0.58, b: 0.86 }
        });

        await this.addEntity({
            name: "cylinder",
            type: "Shape",
            shape: "cylinder",
            position: { x: 1, y: 0, z: 0 },
            rotation: { x: 0, y: -0.5, z: 0 },
            dimensions: { x: 1, y: 1, z: 1 },
            color: { r: 1, g: 0.58, b: 0.86 }
        });

        await this.addEntity({
            name: "triangle",
            type: "Shape",
            shape: "triangle",
            position: { x: 3, y: 0, z: 0 },
            rotation: { x: 0, y: -0.5, z: 0 },
            dimensions: { x: 1, y: 1, z: 1 },
            color: { r: 1, g: 0.58, b: 0.86 }
        });

        const entityToDeleteID = uuidv4();

        await this.addEntity({
            name: "entityToDeleteByID",
            id: entityToDeleteID,
            type: "Shape",
            shape: "triangle",
            position: { x: 3, y: -2, z: 0 },
            rotation: { x: 0, y: -0.5, z: 0 },
            dimensions: { x: 1, y: 1, z: 1 },
            color: { r: 1, g: 0.58, b: 0.86 }
        });
        this.deleteEntityById(entityToDeleteID);

        await this.addEntity({
            name: "entityToDeleteByName",
            type: "Shape",
            shape: "triangle",
            position: { x: 3, y: 2, z: 0 },
            rotation: { x: 0, y: -0.5, z: 0 },
            dimensions: { x: 1, y: 1, z: 1 },
            color: { r: 1, g: 0.58, b: 0.86 }
        });
        this.deleteEntityByName("entityToDeleteByName");

        await this.addEntity({
            name: "fox",
            type: "Model",
            modelUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Fox/glTF/Fox.gltf",
            position: { x: 5, y: 0, z: 0 },
            rotation: { x: 0, y: -0.5, z: 0 },
            dimensions: { x: 0.05, y: 0.05, z: 0.05 }
        });
    }
}
