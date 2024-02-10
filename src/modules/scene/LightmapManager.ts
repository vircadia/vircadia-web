/* eslint-disable @typescript-eslint/no-non-null-assertion */
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
    PBRMaterial,
    Texture,
} from "@babylonjs/core";
import Log from "../debugging/log";
import { glTF as MeshTypes } from "../../../types/vircadia_gameUse";

export class LightmapManager {
    public static applySceneLightmapsToMeshes(meshes: AbstractMesh[], scene: Scene): AbstractMesh[] {
        meshes.forEach((mesh) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const metadataExtras = mesh?.metadata?.gltf?.extras ?? mesh?.parent?.metadata?.gltf?.extras;
            const metadata = new MeshTypes.Metadata(metadataExtras as Partial<MeshTypes.MetadataInterface>);

            if (
                metadata.vircadia_lightmap_default
                && metadata.vircadia_lightmap_texcoord
            ) {
                // Log.debug(
                //     Log.types.ENTITIES,
                //     `Mesh ${mesh.name} has lightmap metadata: ${metadata.vircadia_lightmap_default}`
                // );
                const lightmapMaterialName = metadata.vircadia_lightmap_default;
                // Search for the material by name
                const material = scene.materials.find(
                    (m) => m.name === lightmapMaterialName
                );

                if (!(mesh.material instanceof PBRMaterial)) {
                    Log.error(Log.types.ENTITIES,
                        `Material type of ${JSON.stringify(mesh.material)}
                        for: ${mesh.name} is not supported for lightmap application. Need PBRMaterial. Skipping...`);
                }

                const materialToUse = material as PBRMaterial;
                if (materialToUse
                    && materialToUse.albedoTexture
                    && mesh.material
                    && metadata.vircadia_lightmap_texcoord) {

                    Texture.WhenAllReady([materialToUse.albedoTexture], () => {
                        (mesh.material as PBRMaterial).lightmapTexture = materialToUse.albedoTexture;
                        (mesh.material as PBRMaterial).useLightmapAsShadowmap = true;

                        if ((mesh.material as PBRMaterial).lightmapTexture && metadata.vircadia_lightmap_texcoord) {
                            (mesh.material as PBRMaterial).lightmapTexture!.coordinatesIndex = metadata.vircadia_lightmap_texcoord;
                        }
                    });
                } else {
                    Log.error(Log.types.ENTITIES, `Could not find material or albedo texture for: ${mesh.name}`);
                }
            }

            if (mesh.name.startsWith(MeshTypes.Lightmap.DATA_MESH_NAME)) {
                mesh.dispose(true, false);
                Log.debug(Log.types.ENTITIES, `Deleting lightmap data mesh: ${mesh.name}`);
            }
        });

        return meshes;
    }
}
