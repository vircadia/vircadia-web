//
//  LODManager.ts
//
//  Created by Kalila on 26 Sep 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import {
    type AbstractMesh,
    type ISimplificationSettings,
    type InstancedMesh,
    Mesh
} from "@babylonjs/core";
import Log from "../debugging/log";
import { Mesh as MeshTypes } from "../../../types/vircadia_gameUse";

export const StringsAsBillboardModes: { [key: string]: MeshTypes.BillboardModes } = {
    none: MeshTypes.BillboardModes.BILLBOARDMODE_NONE,
    x: MeshTypes.BillboardModes.BILLBOARDMODE_X,
    y: MeshTypes.BillboardModes.BILLBOARDMODE_Y,
    z: MeshTypes.BillboardModes.BILLBOARDMODE_Z,
    all: MeshTypes.BillboardModes.BILLBOARDMODE_ALL,
};

export const DistanceTargets: { [key in MeshTypes.LOD.Levels]: number } = {
    LOD0: 0,
    LOD1: 15,
    LOD2: 30,
    LOD3: 60,
    LOD4: 120,
};

export const SizeTargets: { [key in MeshTypes.LOD.Levels]: number } = {
    LOD0: 1.0,
    LOD1: 0.25,
    LOD2: 0.1,
    LOD3: 0.08,
    LOD4: 0.05,
};

export interface AutoTarget {
    quality: number;
    distance: number;
    optimizeMesh: boolean;
}
export const AutoTargets: { [key in MeshTypes.LOD.Levels]?: AutoTarget } = {
    LOD0: {
        quality: 0.9,
        distance: DistanceTargets.LOD0,
        optimizeMesh: true,
    },
    LOD1: {
        quality: 0.3,
        distance: DistanceTargets.LOD1,
        optimizeMesh: true,
    },
    LOD2: {
        quality: 0.1,
        distance: DistanceTargets.LOD2,
        optimizeMesh: true,
    },
    LOD3: {
        quality: 0.05,
        distance: DistanceTargets.LOD3,
        optimizeMesh: true,
    },
    LOD4: {
        quality: 0.01,
        distance: DistanceTargets.LOD4,
        optimizeMesh: true,
    },
};

export class LODManager {
    public static parseMeshName(name: string): {
        prefix?: string;
        lodLevel?: string;
        name?: string;
        suffix?: string;
    } {
        const lodPattern = /^(?<prefix>.*)_(?<lodLevel>LOD[0-4])(?<suffix>.*)?$/u;
        const match = name.match(lodPattern);

        return {
            prefix: match?.groups?.prefix,
            lodLevel: match?.groups?.lodLevel,
            name,
            suffix: match?.groups?.suffix,
        };
    }

    private static getMetadataFromMesh(mesh: AbstractMesh | Mesh | InstancedMesh) {
        const meshExtras = mesh.metadata?.gltf?.extras;
        const parentExtras = mesh.parent?.metadata?.gltf?.extras;

        const meshMetadata: MeshTypes.Metadata = {
            vircadia_lod_mode: undefined,
            vircadia_lod_auto: undefined,
            vircadia_lod_distance: undefined,
            vircadia_lod_size: undefined,
            vircadia_lod_hide: undefined,
            vircadia_billboard_mode: undefined
        };

        if (meshExtras === null || meshExtras === undefined && parentExtras !== null || parentExtras !== undefined) {
            meshMetadata.vircadia_lod_mode = parentExtras?.vircadia_lod_mode;
            meshMetadata.vircadia_lod_auto = parentExtras?.vircadia_lod_auto;
            meshMetadata.vircadia_lod_distance = parentExtras?.vircadia_lod_distance;
            meshMetadata.vircadia_lod_size = parentExtras?.vircadia_lod_size;
            meshMetadata.vircadia_lod_hide = parentExtras?.vircadia_lod_hide;
            meshMetadata.vircadia_billboard_mode = parentExtras?.vircadia_billboard_mode;
        } else {
            meshMetadata.vircadia_lod_mode = meshExtras?.vircadia_lod_mode;
            meshMetadata.vircadia_lod_auto = meshExtras?.vircadia_lod_auto;
            meshMetadata.vircadia_lod_distance = meshExtras?.vircadia_lod_distance;
            meshMetadata.vircadia_lod_size = meshExtras?.vircadia_lod_size;
            meshMetadata.vircadia_lod_hide = meshExtras?.vircadia_lod_hide;
            meshMetadata.vircadia_billboard_mode = meshExtras?.vircadia_billboard_mode;
        }

        return meshMetadata;
    }

    private static setBillboardMode(
        mesh: Mesh | AbstractMesh | InstancedMesh,
        modeAsString: string | undefined
    ): void {
        if (modeAsString !== undefined) {
            const mode = StringsAsBillboardModes[modeAsString];
            mesh.scaling.x *= -1;
            mesh.billboardMode = mode;
            Log.debug(
                Log.types.ENTITIES,
                `Set billboard mode to ${modeAsString} for mesh ${mesh.name}.`
            );
        }
    }

    private static setLODHide(
        mesh: Mesh,
        hideAtDistance: number | undefined
    ): void {
        if (hideAtDistance !== undefined) {
            mesh.addLODLevel(hideAtDistance, null);
            Log.debug(
                Log.types.ENTITIES,
                `Added LOD hide level ${hideAtDistance} to mesh ${mesh.name}.`
            );
        }
    }

    private static setLODMode(mesh: Mesh, mode: MeshTypes.LOD.Modes): void {
        if (mode === MeshTypes.LOD.Modes.SIZE) {
            mesh.useLODScreenCoverage = true;
            Log.debug(
                Log.types.ENTITIES,
                `Set LOD mode to ${mode} for mesh ${mesh.name}.`
            );
        }
    }

    private static setLODLevel(root: Mesh, lodMesh: Mesh, value: number): void {
        root.addLODLevel(value, lodMesh);
        Log.debug(
            Log.types.ENTITIES,
            `Added LOD value ${value} with mesh ${lodMesh.name} to root ${root.name}.`
        );
    }

    public static setLODLevels(meshes: AbstractMesh[]): AbstractMesh[] {
        // TODO: Move this out of here.
        for (let i = 0; i < meshes.length; i++) {
            const mesh = meshes[i];
            const meta = LODManager.getMetadataFromMesh(mesh);
            if (meta.vircadia_lod_auto === true) {
                const simplificationSettings: ISimplificationSettings[] = [];

                Object.values(AutoTargets).forEach((autoTarget) => {
                    if (autoTarget) {
                        simplificationSettings.push({
                            quality: autoTarget.quality,
                            distance: autoTarget.distance,
                            optimizeMesh: true,
                        });
                    }
                });

                Log.debug(
                    Log.types.ENTITIES,
                    `Using auto LOD for ${mesh.name}.`
                );

                (mesh as Mesh)?.simplify(
                    simplificationSettings,
                    false,
                    undefined,
                    () => {
                        Log.debug(
                            Log.types.ENTITIES,
                            `Added auto LOD level to root ${mesh.name}.`
                        );
                    }
                );
            }
        }

        const roots: {
            prefix: string | undefined;
            suffix: string | undefined;
            name: string | undefined;
            mesh: Mesh;
            metadata: MeshTypes.Metadata;
            lodLevel: string | undefined;
            simplificationSettings: ISimplificationSettings[];
        }[] = [];

        // Get all root LOD0 meshes.
        for (let i = 0; i < meshes.length; i++) {
            const mesh = meshes[i];
            const name = mesh.name;
            const parse = LODManager.parseMeshName(name);
            const metadata: MeshTypes.Metadata = LODManager.getMetadataFromMesh(mesh);
            if (
                // (mesh.constructor.name === "Mesh" ||
                //     mesh.constructor.name === "AbstractMesh") &&
                parse?.lodLevel === MeshTypes.LOD.Levels.LOD0
            ) {
                roots.push({
                    prefix: parse?.prefix,
                    suffix: parse?.suffix,
                    name: parse?.name,
                    mesh: mesh as Mesh,
                    metadata,
                    lodLevel: parse?.lodLevel,
                    simplificationSettings: [],
                });
            } else {
                Log.debug(
                    Log.types.ENTITIES,
                    `Root mesh ${mesh.name} not added.\nMesh type ${mesh.constructor.name
                    }.\nLOD level ${parse?.lodLevel ?? "Unknown"}.`
                );
                continue;
            }
        }

        for (let root = 0; root < roots.length; root++) {
            // Process metadata for root mesh.
            LODManager.setLODMode(
                roots[root].mesh,
                roots[root].metadata.vircadia_lod_mode ?? MeshTypes.LOD.Modes.DISTANCE
            );
            LODManager.setLODHide(
                roots[root].mesh,
                roots[root].metadata.vircadia_lod_hide
            );
            LODManager.setBillboardMode(
                roots[root].mesh,
                roots[root].metadata.vircadia_billboard_mode
            );

            for (const mesh of meshes) {
                if (!(mesh instanceof Mesh)) {
                    continue;
                }

                const parse = LODManager.parseMeshName(mesh.name);
                if (
                    parse.suffix === roots[root].suffix &&
                    parse.prefix === roots[root].prefix
                ) {
                    const metadata: MeshTypes.Metadata =
                        LODManager.getMetadataFromMesh(mesh);

                    LODManager.setBillboardMode(
                        mesh,
                        metadata.vircadia_billboard_mode
                    );

                    const level = parse.lodLevel;
                    let mode = MeshTypes.LOD.Modes.DISTANCE;

                    if (
                        !level ||
                        (!(level in DistanceTargets) &&
                            !(level in SizeTargets) &&
                            !(level in AutoTargets)) ||
                        level === MeshTypes.LOD.Levels.LOD0
                    ) {
                        continue;
                    }

                    if (metadata.vircadia_lod_mode) {
                        mode = metadata.vircadia_lod_mode;
                    }

                    switch (mode) {
                        case MeshTypes.LOD.Modes.DISTANCE: {
                            let distanceTarget =
                                DistanceTargets[
                                level as keyof typeof DistanceTargets
                                ];

                            if (metadata.vircadia_lod_distance) {
                                distanceTarget = metadata.vircadia_lod_distance;
                            }

                            LODManager.setLODLevel(
                                roots[root].mesh,
                                mesh,
                                distanceTarget
                            );

                            break;
                        }
                        case MeshTypes.LOD.Modes.SIZE: {
                            let sizeTarget =
                                SizeTargets[level as keyof typeof SizeTargets];

                            if (metadata.vircadia_lod_size) {
                                sizeTarget = metadata.vircadia_lod_size;
                            }

                            LODManager.setLODLevel(
                                roots[root].mesh,
                                mesh,
                                sizeTarget
                            );

                            break;
                        }
                        default: {
                            break;
                        }
                    }
                }
            }
        }

        return meshes;
    }
}
