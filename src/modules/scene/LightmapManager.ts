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

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-template-expressions */

import {
    type AbstractMesh,
    type Scene,
    PBRMaterial,
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

                if (!(mesh.material instanceof PBRMaterial)) {
                    Log.error(Log.types.ENTITIES,
                        `Material type of ${mesh.material} for: ${mesh.name} is not supported for lightmap application. Need PBRMaterial. Skipping...`);
                }

                const materialToUse = material as PBRMaterial;
                if (materialToUse && materialToUse.albedoTexture && mesh.material) {
                    (mesh.material as PBRMaterial).lightmapTexture = materialToUse.albedoTexture;
                    (mesh.material as PBRMaterial).useLightmapAsShadowmap = true;
                    (mesh.material as PBRMaterial).lightmapTexture!.coordinatesIndex = mesh.metadata.gltf.extras.vircadia_lightmap_texcoord;
                } else {
                    Log.error(Log.types.ENTITIES, `Could not find material or albedo texture for: ${mesh.name}`);
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
