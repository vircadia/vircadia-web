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

import { AbstractMesh, ISimplificationSettings, Mesh } from "@babylonjs/core";
import _ from "lodash";

// TODO: Move these types and consts to a central types file for Vircadia: vircadia/types (repo)
export interface MeshMetadata {
    lod_mode?: string;
    lod_auto?: boolean;
    lod_distance?: number;
    lod_size?: number;
}

export enum LODLevels {
    LOD0 = "LOD0",
    LOD1 = "LOD1",
    LOD2 = "LOD2",
    LOD3 = "LOD3",
    LOD4 = "LOD4",
    LODHIDE = "LODHIDE",
}

export const DistanceTargets: { [key in LODLevels]: number } = {
    LOD0: 0,
    LOD1: 15,
    LOD2: 30,
    LOD3: 60,
    LOD4: 120,
    LODHIDE: 100,
};

export const SizeTargets: { [key in LODLevels]: number } = {
    LOD0: 1.0,
    LOD1: 0.25,
    LOD2: 0.1,
    LOD3: 0.08,
    LOD4: 0.05,
    LODHIDE: 0.01,
};

export interface AutoTarget {
    quality: number;
    distance: number;
    optimizeMesh: boolean;
}
export const AutoTargets: { [key in LODLevels]?: AutoTarget } = {
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
    LODHIDE: undefined,
};

export enum Modes {
    DISTANCE = "DISTANCE",
    SIZE = "SIZE",
}

export class LODManager {
    public static parseMeshName(name: string): {
        prefix?: string;
        lodLevel?: string;
        name?: string;
        suffix?: string;
    } {
        const lodPattern =
            /^(?<prefix>.*)_(?<lodLevel>LOD[0-4]|LODHIDE)(?<suffix>\.\d+)?$/u;
        const match = name.match(lodPattern);

        return {
            prefix: match?.groups?.prefix,
            lodLevel: match?.groups?.lodLevel,
            name,
            suffix: match?.groups?.suffix,
        };
    }

    public static setLODLevels(meshes: AbstractMesh[]): AbstractMesh[] {
        const roots: {
            prefix: string | undefined;
            mesh: Mesh;
            name: string | undefined;
            lodLevel: string | undefined;
            suffix: string | undefined;
            simplificationSettings: ISimplificationSettings[];
        }[] = [];

        // Get all root LOD0 meshes.
        for (let i = 0; i < meshes.length; i++) {
            const mesh = meshes[i];
            const name = mesh.name;
            const parse = LODManager.parseMeshName(name);
            if (parse?.lodLevel === LODLevels.LOD0 && mesh) {
                roots.push({
                    prefix: parse?.prefix,
                    mesh: mesh as Mesh,
                    name: parse?.name,
                    lodLevel: parse?.lodLevel,
                    suffix: parse?.suffix,
                    simplificationSettings: [],
                });
            }
        }

        for (let root = 0; root < roots.length; root++) {
            _.forEach(meshes, (mesh, index) => {
                // FIXME: Without using optional chaining, this bugs out the whole function but NO ERRORS ARE THROWN.
                // Find out why and fix that, could affect us elsewhere.
                const metadata: MeshMetadata = {
                    lod_mode:
                        mesh.metadata?.gltf?.extras?.vircadia_lod_mode ??
                        undefined,
                    lod_auto:
                        mesh.metadata?.gltf?.extras?.vircadia_lod_auto ??
                        undefined,
                    lod_distance:
                        mesh.metadata?.gltf?.extras?.vircadia_lod_distance ??
                        undefined,
                    lod_size:
                        mesh.metadata?.gltf?.extras?.vircadia_lod_size ??
                        undefined,
                };

                const parse = LODManager.parseMeshName(mesh.name);
                // if (parse.name?.includes("LOD")) {
                //     window.alert("found 1: " + JSON.stringify(parse));
                // }
                if (
                    parse.suffix === roots[root].suffix &&
                    parse.prefix === roots[root].prefix
                ) {
                    const level = parse.lodLevel;
                    let mode = Modes.DISTANCE;

                    if (
                        !level ||
                        (!(level in DistanceTargets) &&
                            !(level in SizeTargets) &&
                            !(level in AutoTargets)) ||
                        level === LODLevels.LOD0
                    ) {
                        return;
                    }

                    if (metadata.lod_mode) {
                        mode = metadata.lod_mode as Modes;
                    }

                    if (metadata.lod_auto) {
                        const autoTarget =
                            AutoTargets[level as keyof typeof AutoTargets];
                        if (autoTarget && autoTarget.optimizeMesh) {
                            roots[root].simplificationSettings.push({
                                quality: autoTarget.quality,
                                distance:
                                    metadata.lod_distance ??
                                    autoTarget.distance,
                                optimizeMesh: true,
                            });
                        }
                    } else {
                        switch (mode) {
                            case Modes.DISTANCE: {
                                let distanceTarget =
                                    DistanceTargets[
                                        level as keyof typeof DistanceTargets
                                    ];

                                if (metadata.lod_distance) {
                                    distanceTarget = metadata.lod_distance;
                                }

                                roots[root].mesh.addLODLevel(
                                    distanceTarget,
                                    meshes[index] as Mesh
                                );

                                break;
                            }
                            case Modes.SIZE: {
                                let sizeTarget =
                                    SizeTargets[
                                        level as keyof typeof SizeTargets
                                    ];

                                if (metadata.lod_size) {
                                    sizeTarget = metadata.lod_size;
                                }

                                roots[root].mesh?.addLODLevel(
                                    sizeTarget,
                                    meshes[index] as Mesh
                                );

                                break;
                            }
                            default: {
                                break;
                            }
                        }
                    }
                }
            });
        }

        return meshes;
    }
}
