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
.fpsCounter,
.versionWatermark {
    position: absolute;
    z-index: 101;
    right: 14px;
    display: block;
    font-size: 1rem;
    font-style: italic;
    opacity: 0.7;
    user-select: none;
    pointer-events: none;
}
.fpsCounter {
    bottom: calc(10px + 1rem);
}
.versionWatermark {
    bottom: 5px;
}
</style>

<template>
    <q-page class="full-height">
        <q-resize-observer @resize="resize" />
        <audio ref="mainSceneAudioElement"></audio>
        <canvas
            :height="canvasHeight"
            :width="canvasWidth"
            :style="{
                position: 'relative',
                zIndex: 2,
                width: canvasWidth + 'px',
                height: canvasHeight + 'px',
                outline: 'none',
                pointerEvents: $props.interactive ? 'all' : 'none'
            }"
            ref="renderCanvas"
            class="renderCanvas"
        ></canvas>
        <slot name="manager"></slot>
        <LoadingScreen ref="LoadingScreen" />
        <JitsiContainer ref="JitsiContainer" />
        <div v-if="userStore.graphics.fpsCounter" class="fpsCounter">{{ applicationStore.renderer.fps.toFixed(0) }} FPS</div>
        <div class="versionWatermark">{{ applicationStore.theme.versionWatermark }}</div>
    </q-page>
</template>

<script lang="ts">
import { defineComponent, watch } from "vue";
import { applicationStore, userStore } from "@Stores/index";
import { AudioManager } from "@Modules/scene/audio";
import { Renderer } from "@Modules/scene/renderer";
import { Utility } from "@Modules/utility";
import { Location } from "@Modules/domain/location";
import { AvatarStoreInterface } from "@Modules/avatar/StoreInterface";
import { URL_UPDATE_FREQUENCY } from "@Base/config";
import { DomainManager } from "@Modules/domain";
import LoadingScreen from "@Components/LoadingScreen.vue";
import JitsiContainer from "@Components/JitsiContainer.vue";
import { EntityEventType } from "@Base/modules/entity";

type ComponentTemplateRefs = {
    mainSceneAudioElement: HTMLAudioElement,
    renderCanvas: HTMLCanvasElement,
    JitsiContainer: typeof JitsiContainer,
    LoadingScreen: typeof LoadingScreen
};

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
        LoadingScreen,
        JitsiContainer
    },

    emits: ["join-conference-room"],

    setup() {
        return {
            applicationStore,
            userStore
        };
    },

    data() {
        return {
            sceneCreated: false,
            canvasHeight: 200,
            canvasWidth: 200,
            updateUrlReady: true,
            locationUnwatch: () => { /* This function will be populated once connected to a domain. */ },
            previousLocation: undefined as Location | undefined
        };
    },

    watch: {
        // call again the method if the route changes
        "$route": "connect"
    },

    methods: {
        /**
         * Update the size of the scene canvas.
         * @param newSize
         */
        resize(newSize: ResizeShape): void {
            this.canvasHeight = newSize.height;
            this.canvasWidth = newSize.width;
            Renderer.resize();
        },
        /**
         * Unload the scene, dispose of the renderer, and disconnect from the Domain server.
         */
        unload(): void {
            Utility.disconnectActiveDomain();
            Renderer.dispose();
            this.locationUnwatch();
        },
        // Update the world location that's shown in the browser's URL bar.
        updateURL(): void {
            // Rate controlling check.
            if (!this.updateUrlReady) {
                return;
            }

            // Remove the protocol from the displayed location.
            const location = this.userStore.avatar.location
                .replace("ws://", "")
                .replace("wss://", "")
                .replace("http://", "")
                .replace("https://", "");

            // Show the location in the URL.
            window.history.replaceState(null, "", `#/${location}`);

            // If rate throttling in place then set appropriate timeouts.
            if (URL_UPDATE_FREQUENCY > 0) {
                this.updateUrlReady = false;

                setTimeout(() => {
                    this.updateUrlReady = true;
                }, URL_UPDATE_FREQUENCY);
            }
        },
        /**
         * Connect to the Domain server.
         */
        async connect(): Promise<void> {
            let location: string | undefined = Array.isArray(this.$route.params.location)
                ? this.$route.params.location.join("/")
                : this.$route.params.location;

            if (!location) {
                location = this.applicationStore.defaultConnectionConfig.DEFAULT_DOMAIN_URL;
            }

            if (!location) {
                return;
            }

            // Check if just the position/rotation values differ from the current location.
            const next = new Location(location);
            await Utility.connectionSetup(
                next.host === this.previousLocation?.host
                    ? next.pathname // Teleport the player, instead of reloading the domain connection.
                    : location);
            this.previousLocation = next;

            // If the URL is configured to be updated, bind the watcher function.
            if (URL_UPDATE_FREQUENCY >= 0) {
                this.locationUnwatch = watch(() => this.userStore.avatar.location, () => this.updateURL());
            } else {
                // If URL updating is disbled (by having a negative frequency) then don't bind the watcher function.
                // And remove the path from the URL bar.
                window.history.replaceState(null, "", `#/`);
            }
        }
    },

    created(): boolean {
        return this.sceneCreated;
    },

    beforeMount() {
        window.addEventListener("beforeunload", () => this.unload());
    },

    // Called after MainScene is loaded onto the page.
    mounted() {
        const boot = async () => {
            // Initialize the graphics display.
            const canvas = (this.$refs as ComponentTemplateRefs).renderCanvas;
            const loadingScreenComponent = (this.$refs as ComponentTemplateRefs).LoadingScreen;
            const loadingScreenElement = loadingScreenComponent.$el as HTMLElement;
            await Renderer.initialize(canvas, loadingScreenElement);
            this.applicationStore.renderer.focusSceneId = 0;

            DomainManager.startGameLoop();

            // Initialize the audio for the scene.
            await AudioManager.initialize((stream) => {
                const element = (this.$refs as ComponentTemplateRefs).mainSceneAudioElement;
                if (stream) {
                    element.srcObject = stream;
                    void element.play();
                } else {
                    element.pause();
                    element.srcObject = null;
                }
            });

            const scene = Renderer.createScene();
            // Handle web entity events.
            scene.onEntityEventObservable.add((entityEvent) => {
                if (entityEvent.type === EntityEventType.JOIN_CONFERENCE_ROOM) {
                    this.$emit("join-conference-room", entityEvent.data);
                }
            });
            // NOTE: The scene must be loaded to register domain events before connecting to the Domain server.
            await scene.load(undefined, AvatarStoreInterface.getActiveModelData("file"));
            await this.connect();

            Renderer.startRenderLoop([scene]);
        };
        void boot();
    },

    beforeUnmount() {
        window.removeEventListener("beforeunload", () => this.unload());
        this.unload();
    }
});
</script>
