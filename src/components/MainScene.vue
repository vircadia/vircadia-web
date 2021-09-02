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

import { Renderer } from "../modules/render/renderer";
import { VScene } from "../modules/render/vscene";

// import Log from "../modules/debugging/log";

export interface ResizeShape {
    height: number,
    width: number
}

export default defineComponent({
    name: "MainScene",

    data: () => ({
        // Rendering
        scene: <VScene><unknown>undefined,
        canvasHeight: 200,
        canvasWidth: 200
    }),

    computed: {

    },

    methods: {
        onResize(newSize: ResizeShape) {
            this.canvasHeight = newSize.height;
            this.canvasWidth = newSize.width;

            Renderer.resize(newSize.height, newSize.width);
        }
    },

    created: function(): boolean {
        return Boolean(this.scene);
    },

    mounted: async function() {
        const canvas = this.$refs.renderCanvas as HTMLCanvasElement;
        await Renderer.initialize(canvas);

        this.scene = Renderer.createScene();

        await this.scene.buildTestScene();

        // At the moment there is one scene. Someday there can be many.
        this.$store.commit("renderer/setFocusSceneId", 0);
        Renderer.startRenderLoop([this.scene as VScene]);
    }
});
</script>
