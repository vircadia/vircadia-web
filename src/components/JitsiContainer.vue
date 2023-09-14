<!--
//  JitsiContainer.vue
//
//  Created by Nolan Huang on Nov 1st, 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
-->

<style lang="scss" scoped>
    .q-field {
        background-color: rgba(0, 0, 0, 0.4);
    }
</style>

<template>
    <q-card
        id="jitsi-container"
        class="column no-wrap items-stretch full-height"
        style="background: transparent;box-shadow: none; display: none;"
    >
        <div v-for="room in applicationStore.conference.activeRooms" :key="room.name">
            <JitsiOverlay
                :domain="applicationStore.metaverse.jitsiServer"
                :room-name="room.id"
                :user-info="{'displayName': userStore.avatar.displayName}"
                @get-iframe-ref-on-api-ready="(parentNode: HTMLDivElement) => {
                    parentNode.id = room.id;
                    styleIframe(parentNode);
                    setupWebEntity((room as JitsiRoomInfo), parentNode);
                }"
            />
        </div>
    </q-card>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { applicationStore, userStore } from "@Stores/index";
import { type JitsiRoomInfo } from "@Stores/application-store";
import { GameObject } from "@Modules/object";
import { WebEntityController } from "@Modules/entity";

export default defineComponent({
    name: "JitsiContainer",

    props: {
        // Primary
        propsToPass: { type: Object, default: () => ({}) }
    },

    setup() {
        return {
            applicationStore,
            userStore
        };
    },

    methods: {
        styleIframe(parentNode: HTMLDivElement): void {
            parentNode.style.width = "100%";
            parentNode.style.height = "100%";
            const iframe = parentNode.querySelector("iframe");
            if (iframe) {
                iframe.style.width = "100%";
                iframe.style.height = "100%";
            }
        },
        setupWebEntity(room: JitsiRoomInfo, element: HTMLElement): void {
            const gameObject = GameObject.getGameObjectByID(room.entity.id);
            const controller = gameObject?.getComponent(WebEntityController.typeName);
            if (controller instanceof WebEntityController) {
                controller.externalElement = element;
            }
        }
    }
});
</script>
