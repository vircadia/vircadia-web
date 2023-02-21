//
//  localShadowGenerator.ts
//
//  Created by Giga on 21 Feb 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable new-cap */

import { DirectionalLight, ShadowGenerator, Vector3 } from "@babylonjs/core";
import type { Mesh, Scene } from "@babylonjs/core";

const shadowResolutions = {
    low: 1024,
    medium: 2048,
    high: 4096,
    extreme: 10000
} as const;

type ShadowResolutionOptions = keyof typeof shadowResolutions;

interface LocalShadowGeneratorOptions {
    shadowResolution: ShadowResolutionOptions
}

/**
 * Create a localized directional light source with shadows around the player.
 */
export class LocalShadowGenerator {
    private scene: Scene;
    private avatar: Mesh;
    private light: DirectionalLight;
    private shadowGenerator: ShadowGenerator;
    private radius = 10;
    private maxZ = 10;
    private minZ = -10;
    private direction = new Vector3(-0.2, -1.0, 0);
    private intensity = 1.5;

    constructor(avatar: Mesh, options: LocalShadowGeneratorOptions, scene: Scene) {
        this.scene = scene;
        this.avatar = avatar;

        // Create the light source.
        this.light = new DirectionalLight("LocalShadows", this.direction, scene);
        this.light.intensity = this.intensity;

        // Create the shadow generator.
        this.shadowGenerator = new ShadowGenerator(
            shadowResolutions[options.shadowResolution],
            this.light,
            true
        );
        this.shadowGenerator.darkness = 0;
        this.shadowGenerator.useBlurExponentialShadowMap = true;
        this.shadowGenerator.addShadowCaster(avatar);

        this.scene.registerBeforeRender(() => {
            // Update the light position to follow the avatar.
            this.light.position.x = avatar.absolutePosition.x;
            this.light.position.y = avatar.absolutePosition.y;
            this.light.position.z = avatar.absolutePosition.z;

            // Update the shadow frustum.
            this.updateShadowCasters();
            this.light.autoUpdateExtends = false;
            this.light.orthoTop = this.radius;
            this.light.orthoRight = this.radius;
            this.light.orthoBottom = -this.radius;
            this.light.orthoLeft = -this.radius;
            this.light.shadowMaxZ = avatar.absolutePosition.y + this.maxZ;
            this.light.shadowMinZ = avatar.absolutePosition.y + this.minZ;
        });
    }

    get resolution(): ShadowResolutionOptions {
        const resolutions = Object.keys(shadowResolutions) as ShadowResolutionOptions[];
        return resolutions.find((value) => shadowResolutions[value] === this.shadowGenerator.mapSize) ?? "low";
    }

    set resolution(value: ShadowResolutionOptions) {
        this.shadowGenerator.mapSize = shadowResolutions[value];
    }

    private updateShadowCasters(): void {
        this.scene.meshes.forEach((mesh) => {
            if (Object.getOwnPropertyDescriptor(mesh, "receiveShadows")?.set) {
                mesh.receiveShadows = true;
            }
            this.shadowGenerator.removeShadowCaster(mesh);
            if (mesh.position.subtract(this.avatar.position).length() < this.radius) {
                this.shadowGenerator.addShadowCaster(mesh);
            }
        });
    }
}
