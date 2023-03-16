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
.versionWatermark {
    position: absolute;
    z-index: 101;
    bottom: 5px;
    right: 14px;
    display: block;
    font-size: 1rem;
    font-style: italic;
    opacity: 0.7;
    user-select: none;
    pointer-events: none;
}
</style>

<template>
    <q-page class="full-height">
        <q-resize-observer @resize="onResize" />
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
        <LoadingScreen ref="loadingScreen" />
        <JitsiContainer ref="JitsiContainer" />
        <div class="versionWatermark">{{ $store.state.theme.versionWatermark }}</div>
    </q-page>
</template>

<script lang="ts">

/* eslint-disable @typescript-eslint/no-unused-vars */
import { defineComponent } from "vue";

import { Mutations as StoreMutations } from "@Store/index";
import { AudioMgr } from "@Modules/scene/audio";
import { Renderer } from "@Modules/scene/renderer";
import { Utility } from "@Modules/utility";
import { Location } from "@Modules/domain/location";
import { AvatarStoreInterface } from "@Modules/avatar/StoreInterface";
import { URL_UPDATE_FREQUENCY } from "@Base/config";
import { DomainMgr } from "@Modules/domain";
import Log from "@Modules/debugging/log";

import LoadingScreen from "@Components/LoadingScreen.vue";
import JitsiContainer from "@Components/JitsiContainer.vue";
import { EntityEventType } from "@Base/modules/entity";

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
        LoadingScreen,
        JitsiContainer
    },

    $refs: {   // Definition to make this.$ref work with TypeScript.
        mainSceneAudioElement: HTMLFormElement
    },

    data: () => ({
        sceneCreated: false,
        canvasHeight: 200,
        canvasWidth: 200,
        updateUrlReady: true,
        locationUnwatch: () => { /* This function will be populated once connected to a domain. */ },
        previousLocation: undefined as Location | undefined
    }),

    watch: {
        // call again the method if the route changes
        "$route": "connect"
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
                element.pause();
                element.srcObject = null;
            }
        },
        onBeforeunload() {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            Utility.disconnectActiveDomain();
            Renderer.dispose();
        },
        // Update the world location that's shown in the browser's URL bar.
        updateURL(): void {
            // Rate controlling check.
            if (!this.updateUrlReady) {
                return;
            }

            // Remove the protocol from the displayed location.
            const location = this.$store.state.avatar.location
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
        async connect() {
            let location = Array.isArray(this.$route.params.location)
                ? this.$route.params.location.join("/")
                : this.$route.params.location;

            if (!location || location === "") {
                location = this.$store.state.defaultConnectionConfig.DEFAULT_DOMAIN_URL;
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
                this.locationUnwatch = this.$store.watch((state) => state.avatar.location, () => this.updateURL());
            } else {
                // If URL updating is disbled (by having a negative frequency) then don't bind the watcher function.
                // And remove the path from the URL bar.
                window.history.replaceState(null, "", `#/`);
            }
        }
    },

    created: function(): boolean {
        return this.sceneCreated;
    },

    beforeMount: function() {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        window.addEventListener("beforeunload", this.onBeforeunload);
    },

    beforeUnmount: function() {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        window.removeEventListener("beforeunload", this.onBeforeunload);
        this.locationUnwatch();
    },

    // Called after MainScene is loaded onto the page.
    mounted: async function() {
        // Initialize the graphics display.
        const canvas = this.$refs.renderCanvas as HTMLCanvasElement;
        const loadingScreenComponent = this.$refs.loadingScreen as typeof LoadingScreen;
        const loadingScreenElement = loadingScreenComponent.$el as HTMLElement;
        await Renderer.initialize(canvas, loadingScreenElement);
        this.$store.commit(StoreMutations.MUTATE, {
            property: "renderer/focusSceneId",
            value: 0
        });

        canvas.addEventListener("pointerdown", () => {
            // FIXME: Pointer-lock hinders the interactivity of web-entities.
            // canvas.requestPointerLock();
        });
        canvas.addEventListener("pointerup", () => {
            document.exitPointerLock();
        });
        document.addEventListener("pointerup", () => {
            document.exitPointerLock();
        });

        DomainMgr.startGameLoop();

        // Initialize the audio for the scene.
        await AudioMgr.initialize(this.setOutputStream.bind(this));

        const scene = Renderer.createScene();
        scene.onEntityEventObservable.add((entityEvent) => {
            // handle web entity event
            if (entityEvent.type === EntityEventType.JOIN_CONFERENCE_ROOM) {
                this.$emit("joint-conference-room", entityEvent.data);
            }
        });
        // NOTE: The scene must be loaded to register domain events before connecting to the domain.
        await scene.load(undefined, AvatarStoreInterface.getActiveModelData("file"));
        await this.connect();

        Renderer.startRenderLoop([scene]);
    }
});
</script>
