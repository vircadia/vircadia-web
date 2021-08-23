<!--
//  MainScene.vue
//
//  Created by Kalila L. on May 9th, 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
-->

<style lang="scss" scoped>
</style>

<template>
    <q-page class="full-height">
        <q-resize-observer @resize="onResize" />
        <canvas
            :height="canvasHeight"
            :width="canvasWidth"
            :style="{ width: canvasWidth+'px', height: canvasHeight + 'px' }"
            ref="renderCanvas"
            class="renderCanvas"
        />
        <slot name="manager" />
    </q-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { v4 as uuidv4 } from "uuid";
import * as BABYLON from "babylonjs";
import "babylonjs-loaders";

export interface ResizeShape {
    height: number,
    width: number
}

export default defineComponent({
    name: "MainScene",

    data: () => ({
        // Babylon
        engine: null as unknown as BABYLON.Engine,
        scene: null as unknown as BABYLON.Scene,
        // Canvas
        canvasHeight: 200,
        canvasWidth: 200
    }),

    computed: {

    },

    methods: {
        onResize(newSize: ResizeShape) {
            this.canvasHeight = newSize.height;
            this.canvasWidth = newSize.width;

            if (this.engine) {
                this.engine.resize();
            }
        },

        async buildScene() {
            const aScene = <BABYLON.Scene> this.scene;
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            aScene.clearColor = new BABYLON.Color4(0.8, 0.8, 0.8, 0.0);
            aScene.createDefaultCameraOrLight(true, true, true);
            aScene.createDefaultEnvironment();

            await this.$store.state.entities.addEntity(aScene, {
                name: "box",
                type: "Shape",
                shape: "box",
                position: { x: -5, y: 0, z: 0 },
                rotation: { x: -0.2, y: -0.4, z: 0 },
                dimensions: { x: 3, y: 3, z: 3 },
                color: { r: 1, g: 0, b: 0 }
            });

            await this.$store.state.entities.addEntity(aScene, {
                name: "sphere",
                type: "Shape",
                shape: "sphere",
                position: { x: -3, y: 0, z: 0 },
                rotation: { x: 0, y: -0.5, z: 0 },
                dimensions: { x: 3, y: 3, z: 3 },
                color: { r: 0, g: 0.58, b: 0.86 }
            });

            await this.$store.state.entities.addEntity(aScene, {
                name: "cone",
                type: "Shape",
                shape: "cone",
                position: { x: -1, y: 0, z: 0 },
                rotation: { x: 0, y: -0.5, z: 0 },
                dimensions: { x: 1, y: 1, z: 1 },
                color: { r: 1, g: 0.58, b: 0.86 }
            });

            await this.$store.state.entities.addEntity(aScene, {
                name: "cylinder",
                type: "Shape",
                shape: "cylinder",
                position: { x: 1, y: 0, z: 0 },
                rotation: { x: 0, y: -0.5, z: 0 },
                dimensions: { x: 1, y: 1, z: 1 },
                color: { r: 1, g: 0.58, b: 0.86 }
            });

            await this.$store.state.entities.addEntity(aScene, {
                name: "triangle",
                type: "Shape",
                shape: "triangle",
                position: { x: 3, y: 0, z: 0 },
                rotation: { x: 0, y: -0.5, z: 0 },
                dimensions: { x: 1, y: 1, z: 1 },
                color: { r: 1, g: 0.58, b: 0.86 }
            });

            const entityToDeleteID = uuidv4();

            await this.$store.state.entities.addEntity(aScene, {
                name: "entityToDeleteByID",
                id: entityToDeleteID,
                type: "Shape",
                shape: "triangle",
                position: { x: 3, y: -2, z: 0 },
                rotation: { x: 0, y: -0.5, z: 0 },
                dimensions: { x: 1, y: 1, z: 1 },
                color: { r: 1, g: 0.58, b: 0.86 }
            });
            this.$store.state.entities.deleteEntityById(aScene, entityToDeleteID);

            await this.$store.state.entities.addEntity(aScene, {
                name: "entityToDeleteByName",
                type: "Shape",
                shape: "triangle",
                position: { x: 3, y: 2, z: 0 },
                rotation: { x: 0, y: -0.5, z: 0 },
                dimensions: { x: 1, y: 1, z: 1 },
                color: { r: 1, g: 0.58, b: 0.86 }
            });
            this.$store.state.entities.deleteEntityByName(aScene, "entityToDeleteByName");

            await this.$store.state.entities.addEntity(aScene, {
                name: "fox",
                type: "Model",
                modelUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Fox/glTF/Fox.gltf",
                position: { x: 5, y: 0, z: 0 },
                rotation: { x: 0, y: -0.5, z: 0 },
                dimensions: { x: 0.05, y: 0.05, z: 0.05 }
            });
            console.info(this.scene.rootNodes);
        },

        renderLoop() {
            this.scene.render();
        }
    },

    created: function(): boolean {
        return Boolean(this.scene);
    },

    mounted: async function() {
        const canvas = this.$refs.renderCanvas as HTMLCanvasElement;

        this.engine = new BABYLON.Engine(canvas);
        this.scene = new BABYLON.Scene(this.engine as BABYLON.Engine);

        await this.buildScene();

        // eslint-disable-next-line @typescript-eslint/unbound-method
        this.engine.runRenderLoop(this.renderLoop);
    }
});
</script>
