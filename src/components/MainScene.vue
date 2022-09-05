<!--
//  MainScene.vue
//
//  Created by Kalila L. on May 9th, 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
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
            :style="{
                width: canvasWidth + 'px',
                height: canvasHeight + 'px',
                pointerEvents: $props.interactive ? 'all' : 'none'
            }"
            ref="renderCanvas"
            class="renderCanvas"
        />
        <LoadingScreen ref="loadingScreen" />
        <slot name="manager" />
    </q-page>
</template>

<script lang="ts">

/* eslint-disable @typescript-eslint/no-unused-vars */
import { defineComponent } from "vue";

import { Mutations as StoreMutations } from "@Store/index";
import { AudioMgr } from "@Modules/scene/audio";
import { Renderer } from "@Modules/scene/renderer";
import { Utility } from "@Modules/utility";
import { DEFAULT_DOMAIN_URL } from "@Base/config";
// import Log from "@Modules/debugging/log";

import LoadingScreen from "@Components/LoadingScreen.vue";

type Nullable<T> = T | null | undefined;


export interface ResizeShape {
    height: number,
    width: number
}

export default defineComponent({
    name: "MainScene",
    props: {
        interactive: {
            type: Boolean,
            required: true
        }
    },

    components: {
        LoadingScreen
    },

    $refs!: {   // definition to make this.$ref work with TypeScript
        mainSceneAudioElement: HTMLFormElement
    },

    data: () => ({
        sceneCreated: false,
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
            const element = this.$refs.mainSceneAudioElement as HTMLMediaElement;
            if (pStream) {
                element.srcObject = pStream;
                // eslint-disable-next-line no-void
                void element.play();
            } else {
                // eslint-disable-next-line no-void
                void element.pause();
                element.srcObject = null;
            }
        }
    },

    created: function(): boolean {
        return this.sceneCreated;
    },

    // Called when MainScene is loaded onto the page
    mounted: async function() {
        // Initialize the graphics display
        const canvas = this.$refs.renderCanvas as HTMLCanvasElement;
        const loadingScreenComponent = this.$refs.loadingScreen as typeof LoadingScreen;
        const loadingScreenElement = loadingScreenComponent.$el as HTMLElement;
        await Renderer.initialize(canvas, loadingScreenElement);
        this.$store.commit(StoreMutations.MUTATE, {
            property: "renderer/focusSceneId",
            value: 0
        });

        // Disable audio temporary
        // Initialize the audio for the scene
        // await AudioMgr.initialize(this.setOutputStream.bind(this));

        const scene = Renderer.createScene();

        // await scene.loadSceneUA92Campus();
        await scene.load("/assets/scenes/default.json");

        await Utility.connectionSetup(DEFAULT_DOMAIN_URL);

        Renderer.startRenderLoop([scene]);
    }
});
</script>
