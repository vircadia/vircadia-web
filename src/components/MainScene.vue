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
            :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
            ref="renderCanvas"
            class="renderCanvas"
        />
        <slot name="manager" />
    </q-page>
</template>

<script>
/* eslint-disable */
import { v4 as uuidv4 } from 'uuid';
import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';

export default {
    name: 'MainScene',

    data: () => ({
        // Babylon
        engine: undefined,
        scene: undefined,
        // Canvas
        canvasHeight: undefined,
        canvasWidth: undefined
    }),

    computed: {

    },

    methods: {
        onResize (newSize) {
            this.canvasHeight = newSize.height;
            this.canvasWidth = newSize.width;

            if (this.engine) {
                this.engine.resize();
            }
        },

        buildScene () {
            this.scene.clearColor = new BABYLON.Color3(0.8, 0.8, 0.8);
            this.scene.createDefaultCameraOrLight(true, true, true);
            this.scene.createDefaultEnvironment();

            this.$store.state.Entities.addEntity(this.scene, {
                name: 'box',
                type: 'Shape',
                shape: 'box',
                position: { x: -5, y: 0, z: 0 },
                rotation: { x: -0.2, y: -0.4, z: 0 },
                dimensions: { x: 3, y: 3, z: 3 },
                color: { r: 1, g: 0, b: 0 }
            }, {});

            this.$store.state.Entities.addEntity(this.scene, {
                'name': 'sphere',
                'type': 'Shape',
                'shape': 'sphere',
                'position': { 'x': -3, 'y': 0, 'z': 0 },
                'rotation': { 'x': 0, 'y': -0.5, 'z': 0 },
                'dimensions': { 'x': 3, 'y': 3, 'z': 3 },
                'color': { 'r': 0, 'g': 0.58, 'b': 0.86 }
            }, {});

            this.$store.state.Entities.addEntity(this.scene, {
                'name': 'cone',
                'type': 'Shape',
                'shape': 'cone',
                'position': { 'x': -1, 'y': 0, 'z': 0 },
                'rotation': { 'x': 0, 'y': -0.5, 'z': 0 },
                'dimensions': { 'x': 1, 'y': 1, 'z': 1 },
                'color': { 'r': 1, 'g': 0.58, 'b': 0.86 }
            }, {});

            this.$store.state.Entities.addEntity(this.scene, {
                'name': 'cylinder',
                'type': 'Shape',
                'shape': 'cylinder',
                'position': { 'x': 1, 'y': 0, 'z': 0 },
                'rotation': { 'x': 0, 'y': -0.5, 'z': 0 },
                'dimensions': { 'x': 1, 'y': 1, 'z': 1 },
                'color': { 'r': 1, 'g': 0.58, 'b': 0.86 }
            }, {});

            this.$store.state.Entities.addEntity(this.scene, {
                'name': 'triangle',
                'type': 'Shape',
                'shape': 'triangle',
                'position': { 'x': 3, 'y': 0, 'z': 0 },
                'rotation': { 'x': 0, 'y': -0.5, 'z': 0 },
                'dimensions': { 'x': 1, 'y': 1, 'z': 1 },
                'color': { 'r': 1, 'g': 0.58, 'b': 0.86 }
            }, {});

            var entityToDeleteID = uuidv4();

            this.$store.state.Entities.addEntity(this.scene, {
                'name': 'entityToDeleteByID',
                'id': entityToDeleteID,
                'type': 'Shape',
                'shape': 'triangle',
                'position': { 'x': 3, 'y': -2, 'z': 0 },
                'rotation': { 'x': 0, 'y': -0.5, 'z': 0 },
                'dimensions': { 'x': 1, 'y': 1, 'z': 1 },
                'color': { 'r': 1, 'g': 0.58, 'b': 0.86 }
            }, {}).then((result) => {
                this.$store.state.Entities.deleteEntityById(this.scene, entityToDeleteID);
            });

            this.$store.state.Entities.addEntity(this.scene, {
                'name': 'entityToDeleteByName',
                'type': 'Shape',
                'shape': 'triangle',
                'position': { 'x': 3, 'y': 2, 'z': 0 },
                'rotation': { 'x': 0, 'y': -0.5, 'z': 0 },
                'dimensions': { 'x': 1, 'y': 1, 'z': 1 },
                'color': { 'r': 1, 'g': 0.58, 'b': 0.86 }
            }, {}).then((result) => {
                this.$store.state.Entities.deleteEntityByName(this.scene, 'entityToDeleteByName');
            });

            this.$store.state.Entities.addEntity(this.scene, {
                'name': 'fox',
                'type': 'Model',
                'modelUrl': 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Fox/glTF/Fox.gltf',
                'position': { 'x': 5, 'y': 0, 'z': 0 },
                'rotation': { 'x': 0, 'y': -0.5, 'z': 0 },
                'dimensions': { 'x': 0.05, 'y': 0.05, 'z': 0.05 }
            }, {}).then((result) => {
                console.info(this.scene.rootNodes);
            });
        },

        renderLoop () {
            this.scene.render();
        }
    },

    created: function () {
    },

    mounted: function () {
        const canvas = this.$refs.renderCanvas;

        this.engine = new BABYLON.Engine(canvas);
        this.scene = new BABYLON.Scene(this.engine);

        this.buildScene();

        this.engine.runRenderLoop(this.renderLoop);
    }
}
</script>
