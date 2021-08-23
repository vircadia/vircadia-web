/*
//  entities.js
//
//  Created by Kalila L. on May 10th, 2021.
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
import Debug from "../debugging/debug";
import Log from "../debugging/log";
// System Modules
import { v4 as uuidv4 } from "uuid";

interface entityProps {
    id?: string;
    type: string;
    shape?: string;
    name: string;
    modelUrl?: string;
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number; w?: number };
    dimensions: { x: number; y: number; z: number; };
    color?: { r: number; g: number; b: number; a?: number };
}

export class Entities {
    _entities: Map<string, BABYLON.Mesh>;

    constructor() {
        this._entities = new Map<string, BABYLON.Mesh>();
    }

    static async importModel(name: string, modelUrl: string, scene: BABYLON.Scene): Promise<BABYLON.Mesh> {
        const parsedUrl = new URL(modelUrl);
        const urlWithoutFilename = modelUrl.substring(0, modelUrl.lastIndexOf("/")) + "/";
        const filename = parsedUrl.pathname.split("/").pop();

        // eslint-disable-next-line new-cap
        const meshes = await BABYLON.SceneLoader.ImportMeshAsync(name, urlWithoutFilename, filename, scene);
        return meshes.meshes[0] as BABYLON.Mesh;
    }

    async addEntity(scene: BABYLON.Scene, properties: entityProps): Promise<Nullable<string>> {
        if (!properties.type) {
            Debug.error("ENTITIES", "Failed to specify entity type.");
            return null;
        }

        let entity: Nullable<BABYLON.Mesh> = undefined;

        // If no UUID is given for the entity, we"ll make one now.
        if (!properties.id) {
            properties.id = uuidv4();
        }

        // Create the entity.
        switch (properties.type) {
            case "Shape":
                if (properties.shape) {
                    if (properties.shape.toLowerCase() === "box") {
                        entity = BABYLON.MeshBuilder.CreateBox(properties.name, {}, scene);
                    } else if (properties.shape.toLowerCase() === "sphere") {
                        entity = BABYLON.MeshBuilder.CreateSphere(properties.name, {}, scene);
                    } else if (properties.shape.toLowerCase() === "cylinder") {
                        entity = BABYLON.MeshBuilder.CreateCylinder(properties.name, {}, scene);
                    } else if (properties.shape.toLowerCase() === "cone") {
                        entity = BABYLON.MeshBuilder.CreateCylinder(properties.name, { diameterTop: 0 }, scene);
                    } else if (properties.shape.toLowerCase() === "triangle") {
                        entity = BABYLON.MeshBuilder.CreateCylinder(properties.name, { tessellation: 3 }, scene);
                    } else {
                        Debug.error("ENTITIES", "Failed to create shape entity, unknown/unsupported shape type: "
                                    + properties.shape);
                        return null;
                    }
                } else {
                    Debug.error("ENTITIES", "Attempted to create type Shape with no shape specified");
                    return null;
                }
                break;
            case "Model":
                if (properties.modelUrl) {
                    entity = await Entities.importModel(properties.name, properties.modelUrl, scene);
                } else {
                    Debug.error("ENTITIES", "Attempted to create type Model with no modelUrl specified");
                    return null;
                }
                break;
            default:
                entity = BABYLON.MeshBuilder.CreateBox(properties.name, {}, scene);
                break;
        }

        if (entity) {
            // Set the ID.
            entity.id = properties.id;

            // Rotate and position the entity.
            entity.position = new BABYLON.Vector3(properties.position.x, properties.position.y, properties.position.z);
            entity.rotation = new BABYLON.Vector3(properties.rotation.x, properties.rotation.y, properties.rotation.z);

            // Scale the entity.
            entity.scaling = new BABYLON.Vector3(properties.dimensions.x, properties.dimensions.y, properties.dimensions.z);

            // Apply a color if requested.
            if (properties.color) {
                const colorMaterial = new BABYLON.StandardMaterial(properties.name + "-material", scene);
                colorMaterial.emissiveColor = new BABYLON.Color3(properties.color.r, properties.color.g, properties.color.b);
                entity.material = colorMaterial;
            }

            Log.print("ENTITIES", "INFO", "Successfully created entity: " + entity.id);

            this._entities.set(entity.id, entity);

            return entity.id;
        }
        Debug.error("ENTITIES", "Failed to create entity.");
        return null;
    }

    // Scripting would look like:
    // Entities.deleteById
    deleteEntityById(scene: BABYLON.Scene, id: string): void {
        const entityToDelete = scene.getNodeByID(id);

        if (entityToDelete) {
            entityToDelete.dispose();
            // eslint-disable-next-line @typescript-eslint/dot-notation
            this._entities.delete(id);
        } else {
            Debug.error("ENTITIES", "Failed to delete entity by ID: " + id);
        }
    }

    // Scripting would look like:
    // Entities.deleteByName
    deleteEntityByName(scene: BABYLON.Scene, name: string): void {
        const entityToDelete = scene.getNodeByName(name);

        if (entityToDelete) {
            // eslint-disable-next-line @typescript-eslint/dot-notation
            this._entities.delete(entityToDelete.id);
            entityToDelete.dispose();
        } else {
            Debug.error("ENTITIES", "Failed to delete entity by name: " + name);
        }
    }
}
