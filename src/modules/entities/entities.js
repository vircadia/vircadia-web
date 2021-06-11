/*
//  entities.js
//
//  Created by Kalila L. on May 10th, 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';

import Log from '../debugging/log.js';

import { v4 as uuidv4 } from 'uuid';

export class Entities {
    constructor (store, prop) {
        this.importModel = async (name, modelUrl, scene) => {
            return new Promise(function (resolve, reject) {
                const parsedUrl = new URL(modelUrl);
                const urlWithoutFilename = modelUrl.substring(0, modelUrl.lastIndexOf('/')) + '/';
                const filename = parsedUrl.pathname.split('/').pop();

                BABYLON.SceneLoader.ImportMeshAsync(name, urlWithoutFilename, filename, scene).then((result) => {
                    resolve(result.meshes[0]);
                });
            });
        };
    }

    async addEntity (scene, properties, entityHostType) {
        if (!properties.type) {
            Log.print('ENTITIES', 'ERROR', 'Failed to specify entity type.');
            return false;
        }

        let entity;

        // If no UUID is given for the entity, we'll make one now.
        if (!properties.id) {
            properties.id = uuidv4();
        }

        // Create the entity.
        switch (properties.type) {
        case 'Shape':
            if (properties.shape.toLowerCase() === 'box') {
                entity = BABYLON.MeshBuilder.CreateBox(properties.name, {}, scene);
            } else if (properties.shape.toLowerCase() === 'sphere') {
                entity = BABYLON.MeshBuilder.CreateSphere(properties.name, {}, scene);
            } else if (properties.shape.toLowerCase() === 'cylinder') {
                entity = BABYLON.MeshBuilder.CreateCylinder(properties.name, {}, scene);
            } else if (properties.shape.toLowerCase() === 'cone') {
                entity = BABYLON.MeshBuilder.CreateCylinder(properties.name, { diameterTop: 0 }, scene);
            } else if (properties.shape.toLowerCase() === 'triangle') {
                entity = BABYLON.MeshBuilder.CreateCylinder(properties.name, { tessellation: 3 }, scene);
            } else {
                Log.print('ENTITIES', 'ERROR', 'Failed to create shape entity, unknown/unsupported shape type: ' + properties.shape);
                return;
            }
            break;
        case 'Model':
            entity = await this.importModel(properties.name, properties.modelUrl, scene);
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
                const colorMaterial = new BABYLON.StandardMaterial(properties.name + '-material', scene);
                colorMaterial.emissiveColor = new BABYLON.Color3(properties.color.r, properties.color.g, properties.color.b);
                entity.material = colorMaterial;
            }

            Log.print('ENTITIES', 'INFO', 'Successfully created entity: ' + entity.id);
            return entity.id;
        } else {
            Log.print('ENTITIES', 'ERROR', 'Failed to create entity.');
        }
    };

    // Scripting would look like:
    // Entities.deleteById
    async deleteEntityById (scene, id) {
        const entityToDelete = scene.getNodeByID(id);

        if (entityToDelete) {
            entityToDelete.dispose();
        } else {
            Log.print('ENTITIES', 'ERROR', 'Failed to delete entity by ID: ' + id);
        }
    };

    // Scripting would look like:
    // Entities.deleteByName
    async deleteEntityByName (scene, name) {
        const entityToDelete = scene.getNodeByName(name);

        if (entityToDelete) {
            entityToDelete.dispose();
        } else {
            Log.print('ENTITIES', 'ERROR', 'Failed to delete entity by name: ' + name);
        }
    };
};
