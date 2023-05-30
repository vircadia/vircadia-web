<!--
//  Jitsi.vue
//
//  Created by Nshan G. on Sep 29th, 2022.
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
    <OverlayShell
        icon="groups"
        :title="propsToPass.name"
        :managerProps="propsToPass"
        :defaultHeight="600"
        :defaultWidth="800"
        :defaultLeft="300"
        :hoverShowBar="false"
        :style="{
            'box-shadow': '0 1px 5px rgb(0 0 0 / 20%), 0 2px 2px rgb(0 0 0 / 14%), 0 3px 1px -2px rgb(0 0 0 / 12%)',
            border: 'none'
        }"
    >
        <div class="absolute-center">
            <q-spinner size="xl" />
        </div>
        <q-card
            class="column no-wrap items-stretch full-height"
            style="background: transparent;box-shadow: none;"
        >
        <keep-alive>
            <div style="width:100%; height: 100%;" ref="JitsiContainer"></div>
        </keep-alive>
        </q-card>
    </OverlayShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useApplicationStore, type JitsiRoomInfo } from "@Stores/application-store";
import { GameObject } from "@Modules/object";
import { WebEntityController } from "@Modules/entity";
import OverlayShell from "../OverlayShell.vue";

export default defineComponent({
    name: "Jitsi",

    props: {
        // Primary
        propsToPass: { type: Object, default: () => ({}) }
    },

    data: () => ({
        room: <JitsiRoomInfo><unknown>undefined,
        jitisElement: <HTMLElement><unknown>undefined
    }),

    components: {
        OverlayShell
    },
    methods: {
        getWebEntityController() : WebEntityController {
            const gameObject = GameObject.getGameObjectByID(this.room.entity.id);
            return gameObject?.getComponent(WebEntityController.typeName) as WebEntityController;
        }
    },
    mounted() {
        this.room = useApplicationStore().conference.currentRoom;
        const controller = this.getWebEntityController();
        if (controller && controller.externalElement) {
            this.jitisElement = controller.externalElement;
            controller.externalElement = null;

            const container = this.$refs.JitsiContainer as HTMLElement;
            container.appendChild(this.jitisElement);
        }
    },
    beforeUnmount() {
        if (this.room && this.jitisElement) {
            const controller = this.getWebEntityController();
            if (controller) {
                controller.externalElement = this.jitisElement;
            } else {
                this.jitisElement.remove();
                this.jitisElement = <HTMLElement><unknown>undefined;
            }
        }
    }
});
</script>
