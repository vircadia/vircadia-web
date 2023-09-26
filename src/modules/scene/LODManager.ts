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

export class LODManager {
    static readonly Modes = {
        DISTANCE: "DISTANCE",
        SIZE: "SIZE",
        AUTO: "AUTO",
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

    public static parseMeshName(
        name: string
    ): { lodLevel?: string; mode?: string; overrideTarget?: number } | null {
        const lodPattern = new RegExp(
            `.*_((LOD[0-4]|LODHIDE))(_)?(${LODManager.Modes.DISTANCE}|${LODManager.Modes.SIZE}|${LODManager.Modes.AUTO})?(_([a-zA-Z0-9.]+))?`,
            "u"
        );
        const match = name.match(lodPattern);

        if (match) {
            return {
                lodLevel: match[1] || undefined,
                mode: match[4] || undefined,
                overrideTarget: parseFloat(match[6]) || undefined,
            };
        }

        return null;
    }

    public static setLODLevels(
        root: AbstractMesh,
        meshes: AbstractMesh[]
    ): AbstractMesh {
        const simplificationSettings: ISimplificationSettings[] = [];

        for (let i = 0; i < meshes.length; i++) {
            const parse = LODManager.parseMeshName(meshes[i].name);
            const level = parse?.lodLevel;
            const mode = parse?.mode || LODManager.Modes.DISTANCE; // Default to DISTANCE mode
            const overrideTarget = parse?.overrideTarget;

            if (
                !level ||
                (!(level in LODManager.DistanceTargets) &&
                    !(level in LODManager.SizeTargets) &&
                    !(level in LODManager.AutoTargets))
            ) {
                continue;
            }

            if (mode === LODManager.Modes.SIZE) {
                (root as Mesh).useLODScreenCoverage = true;
            }

            if (overrideTarget) {
                (root as Mesh).addLODLevel(overrideTarget, meshes[i] as Mesh);
            } else if (mode === LODManager.Modes.DISTANCE) {
                (root as Mesh).addLODLevel(
                    LODManager.DistanceTargets[
                        level as keyof typeof LODManager.DistanceTargets
                    ],
                    meshes[i] as Mesh
                );
            } else if (mode === LODManager.Modes.SIZE) {
                (root as Mesh).addLODLevel(
                    LODManager.SizeTargets[
                        level as keyof typeof LODManager.SizeTargets
                    ],
                    meshes[i] as Mesh
                );
            } else if (mode === LODManager.Modes.AUTO) {
                const autoTarget =
                    LODManager.AutoTargets[
                        level as keyof typeof LODManager.AutoTargets
                    ];
                if (autoTarget && autoTarget.optimizeMesh) {
                    simplificationSettings.push({
                        quality: autoTarget.quality,
                        distance: overrideTarget ?? autoTarget.distance,
                        optimizeMesh: true,
                    });
                }
            }
        }

        // FIXME: Auto mode is disabled for now. It's not working properly. (should retest with latest version + diff settings)
        // if (simplificationSettings.length > 0) {
        //     console.info(
        //         "LODManager.SimplificationSettings",
        //         simplificationSettings
        //     );
        //     (root as Mesh).simplify(simplificationSettings, false);
        // }

        return root;
    }
}
