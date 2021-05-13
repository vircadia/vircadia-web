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
        <!-- <Audio /> -->
        <ChatWindow />
    </q-page>
</template>

<script>
/* eslint-disable */
import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';

// Modules
import Entities from '../modules/entities/entities.js';
// Components
import Audio from './overlays/settings/Audio'
import ChatWindow from './overlays/chat/ChatWindow'

export default {
    name: 'MainScene',

    components: {
        Audio,
        ChatWindow
    },

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
            var camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 0, -10), this.scene);
            var light = new BABYLON.PointLight("light", new BABYLON.Vector3(10, 10, 0), this.scene);

            var item = BABYLON.Mesh.CreateBox('box', 2, this.scene);

            item.rotation.x = -0.2;
            item.rotation.y = -0.4;

            const boxMaterial = new BABYLON.StandardMaterial('material', this.scene);
            boxMaterial.emissiveColor = new BABYLON.Color3(0, 0.58, 0.86);
            item.material = boxMaterial;
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
