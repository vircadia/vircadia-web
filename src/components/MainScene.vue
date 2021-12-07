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
        <audio ref="mainSceneAudioElement"></audio>
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

<script lang="ts">
import { defineComponent } from "vue";

import { Mutations as StoreMutations } from "@Store/index";
import { AudioMgr } from "@Modules/scene/audio";
import { Renderer } from "@Modules/scene/renderer";
import { VScene } from "@Modules/scene/vscene";

type Nullable<T> = T | null | undefined;
// import Log from "@Modules/debugging/log";

export interface ResizeShape {
    height: number,
    width: number
}

export default defineComponent({
    name: "MainScene",

    $refs!: {   // definition to make this.$ref work with TypeScript
        mainSceneAudioElement: HTMLFormElement
    },

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
        },
        setOutputStream(pStream: Nullable<MediaStream>) {
            if (pStream) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                (this.$refs.mainSceneAudioElement as HTMLMediaElement).srcObject = pStream;
            } else {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                (this.$refs.mainSceneAudioElement as HTMLMediaElement).srcObject = null;
            }
        }
    },

    created: function(): boolean {
        return Boolean(this.scene);
    },

    // Called when MainScene is loaded onto the page
    mounted: async function() {
        // Initialize the graphics display
        const canvas = this.$refs.renderCanvas as HTMLCanvasElement;
        await Renderer.initialize(canvas);
        this.$store.commit(StoreMutations.MUTATE, {
            property: "renderer/focusSceneId",
            value: 0
        });

        // Initialize the audio for the scene
        await AudioMgr.initialize(this.setOutputStream.bind(this));

        // Create one scene for the moment
        this.scene = Renderer.createScene();

        // Until connected to the external world, add test items to the scene
        await this.scene.buildTestScene();

        Renderer.startRenderLoop([this.scene as VScene]);
    }
});
</script>
