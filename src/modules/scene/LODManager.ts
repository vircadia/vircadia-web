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

interface Metadata {
    gltf: {
        extras: {
            vircadia_lod_mode: string;
            vircadia_lod_auto: boolean;
            vircadia_lod_distance: number;
            vircadia_lod_size: number;
        };
    };
}

export class LODManager {
    static readonly Modes = {
        DISTANCE: "DISTANCE",
        SIZE: "SIZE",
    };

    static readonly LODLevels = {
        LOD0: "LOD0",
        LOD1: "LOD1",
        LOD2: "LOD2",
        LOD3: "LOD3",
        LOD4: "LOD4",
        LODHIDE: "LODHIDE",
    };

    static readonly DistanceTargets = {
        LOD0: 0,
        LOD1: 15,
        LOD2: 30,
        LOD3: 60,
        LOD4: 120,
        LODHIDE: 100,
    };

    static readonly SizeTargets = {
        LOD0: 0.5,
        LOD1: 0.25,
        LOD2: 0.1,
        LOD3: 0.08,
        LOD4: 0.05,
        LODHIDE: 0.01,
    };

    static readonly AutoTargets = {
        LOD0: {
            quality: 0.9,
            distance: LODManager.DistanceTargets.LOD0,
            optimizeMesh: true,
        },
        LOD1: {
            quality: 0.3,
            distance: LODManager.DistanceTargets.LOD1,
            optimizeMesh: true,
        },
        LOD2: {
            quality: 0.1,
            distance: LODManager.DistanceTargets.LOD2,
            optimizeMesh: true,
        },
        LOD3: {
            quality: 0.05,
            distance: LODManager.DistanceTargets.LOD3,
            optimizeMesh: true,
        },
        LOD4: {
            quality: 0.01,
            distance: LODManager.DistanceTargets.LOD4,
            optimizeMesh: true,
        },
        LODHIDE: undefined,
    };

    public static parseMeshName(name: string): {
        prefix?: string;
        lodLevel?: string;
        suffix?: string;
    } {
        const lodPattern =
            /^(?<prefix>.*)_(?<lodLevel>LOD[0-4]|LODHIDE)(?<suffix>\.\d+)?$/u;
        const match = name.match(lodPattern);

        return {
            prefix: match?.groups?.prefix,
            lodLevel: match?.groups?.lodLevel,
            suffix: match?.groups?.suffix,
        };
    }

    public static setLODLevels(meshes: AbstractMesh[]): AbstractMesh[] {
        const simplificationSettings: ISimplificationSettings[] = [];
        const roots: {
            prefix: string | undefined;
            mesh: Mesh | undefined;
            suffix: string | undefined;
        }[] = [];

        for (let i = 0; i < meshes.length; i++) {
            const mesh = meshes[i];
            const name = mesh.name;
            const parse = LODManager.parseMeshName(name);
            if (parse?.lodLevel === LODManager.LODLevels.LOD0) {
                roots.push({
                    prefix: parse?.prefix,
                    mesh: mesh as Mesh,
                    suffix: parse?.suffix,
                });
            }
        }
        if (roots.length === 0) {
            return meshes;
        }

        roots.forEach((root) => {
            for (let i = 0; i < meshes.length; i++) {
                const mesh = meshes[i];
                const name = mesh.name;
                const parse = LODManager.parseMeshName(name);

                if (
                    parse.suffix !== root.suffix ||
                    parse.prefix !== root.prefix
                ) {
                    console.info("###continue", name, parse, root);
                    continue;
                }

                const metadata = mesh.metadata as Metadata;
                const level = parse?.lodLevel;
                let mode = LODManager.Modes.DISTANCE;

                if (
                    !level ||
                    (!(level in LODManager.DistanceTargets) &&
                        !(level in LODManager.SizeTargets) &&
                        !(level in LODManager.AutoTargets))
                ) {
                    console.info("###THISSHOULDNOTHAPPEN", level, mesh.name);
                    continue;
                }

                if (metadata.gltf.extras.vircadia_lod_mode) {
                    mode = metadata.gltf.extras.vircadia_lod_mode;
                }

                console.info("###wannaadd", level, mesh.name);
                if (metadata.gltf.extras.vircadia_lod_auto) {
                    const autoTarget =
                        LODManager.AutoTargets[
                            level as keyof typeof LODManager.AutoTargets
                        ];
                    if (autoTarget && autoTarget.optimizeMesh) {
                        simplificationSettings.push({
                            quality: autoTarget.quality,
                            distance:
                                metadata.gltf.extras.vircadia_lod_distance ??
                                autoTarget.distance,
                            optimizeMesh: true,
                        });
                    }
                } else {
                    switch (mode) {
                        case LODManager.Modes.DISTANCE: {
                            let distanceTarget =
                                LODManager.DistanceTargets[
                                    level as keyof typeof LODManager.DistanceTargets
                                ];

                            if (metadata.gltf.extras.vircadia_lod_distance) {
                                distanceTarget =
                                    metadata.gltf.extras.vircadia_lod_distance;
                            }

                            console.info("###addLODLevel", level, mesh.name);
                            root.mesh?.addLODLevel(
                                distanceTarget,
                                mesh as Mesh
                            );

                            break;
                        }
                        case LODManager.Modes.SIZE: {
                            let sizeTarget =
                                LODManager.SizeTargets[
                                    level as keyof typeof LODManager.SizeTargets
                                ];

                            if (metadata.gltf.extras.vircadia_lod_size) {
                                sizeTarget =
                                    metadata.gltf.extras.vircadia_lod_size;
                            }

                            console.info("$$$addLODLevel", level, mesh.name);
                            root.mesh?.addLODLevel(sizeTarget, mesh as Mesh);

                            break;
                        }
                        default:
                            break;
                    }
                }
            }
        });

        // FIXME: Auto mode is disabled for now. It's not working properly. (should retest with latest version + diff settings)
        // if (simplificationSettings.length > 0) {
        //     console.info(
        //         "LODManager.SimplificationSettings",
        //         simplificationSettings
        //     );
        //     (root as Mesh).simplify(simplificationSettings, false);
        // }

        return meshes;
    }
}
