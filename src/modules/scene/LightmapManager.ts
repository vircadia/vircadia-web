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
        // ////
        // //// HANDLE MASTER LIGHTMAP DATA
        // ////

        let lightmapColorSpace = null;
        let lightmapLevel = null;
        let lightmapMode = null;

        const foundLightmapMesh = meshes.find((m) => m.name.startsWith(MeshTypes.Lightmap.DATA_MESH_NAME));
        if (foundLightmapMesh) {
            Log.debug(Log.types.ENTITIES, `Found lightmap mesh: ${foundLightmapMesh.name}`);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const metadataExtras = foundLightmapMesh?.metadata?.gltf?.extras ?? foundLightmapMesh?.parent?.metadata?.gltf?.extras;
            const metadata = new MeshTypes.Metadata(metadataExtras as Partial<MeshTypes.MetadataInterface>);

            if (metadata.vircadia_lightmap_mode) {
                Log.debug(Log.types.ENTITIES, `Found lightmap mode for all meshes as ${metadata.vircadia_lightmap_mode}`);
                lightmapMode = String(metadata.vircadia_lightmap_mode) as unknown as MeshTypes.Light.LightmapMode;
            }

            if (metadata.vircadia_lightmap_level) {
                Log.debug(Log.types.ENTITIES, `Found lightmap level for all meshes as ${metadata.vircadia_lightmap_level}`);
                lightmapLevel = Number(metadata.vircadia_lightmap_level);
            }

            if (metadata.vircadia_lightmap_color_space) {
                Log.debug(Log.types.ENTITIES, `Found lightmap color space for all meshes as ${metadata.vircadia_lightmap_color_space}`);
                lightmapColorSpace = String(metadata.vircadia_lightmap_color_space) as unknown as MeshTypes.Texture.ColorSpace;
            }

            foundLightmapMesh.dispose(true, false);
            Log.debug(Log.types.ENTITIES, `Deleting lightmap data mesh: ${foundLightmapMesh.name}`);
        }

        const lights = scene.lights;
        lights.forEach((light) => {
            switch (lightmapMode) {
                case MeshTypes.Light.LightmapMode.DEFAULT:
                    light.lightmapMode = 0;
                    break;
                case MeshTypes.Light.LightmapMode.SHADOWSONLY:
                    light.lightmapMode = 1;
                    break;
                case MeshTypes.Light.LightmapMode.SPECULAR:
                    light.lightmapMode = 2;
                    break;
                default:
                    light.lightmapMode = 0;
                    break;
            }
            Log.debug(Log.types.ENTITIES, `Setting lightmap mode for ${light.name}: ${light.lightmapMode}`);
        });

        // ////
        // //// APPLY LIGHTMAPS TO MESHES FOR EACH MESH
        // ////

        meshes.forEach((mesh) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const metadataExtras = mesh?.metadata?.gltf?.extras ?? mesh?.parent?.metadata?.gltf?.extras;
            const metadata = new MeshTypes.Metadata(metadataExtras as Partial<MeshTypes.MetadataInterface>);

            if (
                metadata.vircadia_lightmap
                && metadata.vircadia_lightmap_texcoord
            ) {
                // Log.debug(
                //     Log.types.ENTITIES,
                //     `Mesh ${mesh.name} has lightmap metadata: ${metadata.vircadia_lightmap}`
                // );
                const lightmapMaterialName = metadata.vircadia_lightmap;
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
                        (mesh.material as PBRMaterial).useLightmapAsShadowmap = metadata.vircadia_lightmap_use_as_shadowmap ?? true;

                        if ((mesh.material as PBRMaterial).lightmapTexture && metadata.vircadia_lightmap_texcoord) {
                            (mesh.material as PBRMaterial).lightmapTexture!.coordinatesIndex = metadata.vircadia_lightmap_texcoord;
                        }
                    });
                } else {
                    Log.error(Log.types.ENTITIES, `Could not find material or albedo texture for: ${mesh.name}`);
                }
            }

            mesh.material?.getActiveTextures().forEach((texture) => {
                if (texture instanceof Texture) {
                    if (lightmapLevel) {
                        texture.level = lightmapLevel;
                    }

                    if (lightmapColorSpace) {
                        switch (lightmapColorSpace) {
                            case MeshTypes.Texture.ColorSpace.LINEAR:
                                Log.debug(Log.types.ENTITIES, `Setting color space for ${mesh.name} to linear.`);
                                texture.gammaSpace = false;
                                break;
                            case MeshTypes.Texture.ColorSpace.GAMMA:
                                Log.debug(Log.types.ENTITIES, `Setting color space for ${mesh.name} to gamma.`);
                                texture.gammaSpace = true;
                                break;
                            default:
                                Log.debug(Log.types.ENTITIES, `Setting color space for ${mesh.name} to linear.`);
                                texture.gammaSpace = false;
                                break;
                        }
                    }
                }
            });
        });

        return meshes;
    }
}
