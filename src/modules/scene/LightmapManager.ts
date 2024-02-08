//
//  LightmapManager.ts
//
//  Created by Kalila on 08 Feb 2024.
//  Copyright 2024 Vircadia contributors.
//  Copyright 2024 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import {
    type AbstractMesh,
    type Scene,
} from "@babylonjs/core";
import Log from "../debugging/log";
import { glTF as MeshTypes } from "../../../types/vircadia_gameUse";

export class LightmapManager {
    public static applySceneLightmapsToMeshes(meshes: AbstractMesh[], scene: Scene): AbstractMesh[] {
        meshes.forEach((mesh) => {
            if (
                mesh.metadata &&
                mesh.metadata.gltf &&
                mesh.metadata.gltf.extras &&
                mesh.metadata.gltf.extras.vircadia_lightmap_default
            ) {
                Log.debug(
                    Log.types.ENTITIES,
                    `Mesh ${mesh.name} has lightmap metadata: ${mesh.metadata.gltf.extras.vircadia_lightmap_default}`
                );
                const lightmapMaterialName = mesh.metadata.gltf.extras.vircadia_lightmap_default;
                // Search for the material by name
                const material = scene.materials.find(
                    (m) => m.name === lightmapMaterialName
                );

                if (material && material.albedoTexture) {
                    mesh.material.lightmapTexture = material.albedoTexture;
                    mesh.material.useLightmapAsShadowmap = true;
                    mesh.material.lightmapTexture.coordinatesIndex =
                        mesh.metadata.gltf.extras.vircadia_lightmap_texcoord;
                    Log.info(
                        Log.types.ENTITIES,
                        `Applied albedo texture as lightmap texture for: ${mesh.name}`
                    );
                } else {
                    Log.error(
                        Log.types.ENTITIES,
                        `Could not find material or albedo texture for: ${mesh.name}`
                    );
                }
            }

            if (mesh.name.startsWith(MeshTypes.Lightmap.DATA_MESH_NAME)) {
                mesh.dispose(false, true); // This deletes the mesh without removing child textures or materials
                Log.debug(Log.types.ENTITIES, `Deleting lightmap data mesh: ${mesh.name}`);
            }
        });

        return meshes;
    }
}
