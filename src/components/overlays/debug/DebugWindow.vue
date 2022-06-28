<!--
//  DebugWindow.vue
//
//  Copyright 2021 Vircadia contributors.
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
        icon="directions_bus"
        title="Debug"
        :managerProps="propsToPass"
        :defaultHeight="500"
        :defaultWidth="600"
        :defaultLeft="40"
        :defaultTop="400"
        :hoverShowBar="false"
        :style="{ 'background': 'rgba(0, 0, 0, 0.3)', 'box-shadow': 'none', border: 'none' }"
    >
        <q-tabs
            v-model="tab"
            dense
            >
            <q-tab name="Messages" icon="chat" label="Messages" />
            <q-tab name="Avatars" icon="people" label="Avatars" />
        </q-tabs>
        <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="Messages">
                <q-list v-for="msg in $store.state.messages.messages" :key="msg.id">
                    <div> {{ msgSender(msg) }} : {{ msgText(msg) }} </div>
                </q-list>
            </q-tab-panel>
            <q-tab-panel name="Avatars">
                <div>DisplayName: {{ $store.state.avatar.displayName }}</div>
                <div>Location: {{ $store.state.avatar.location }}</div>
                <div></div>
                <div>Avatars: {{ $store.state.avatars.count }} </div>
                <q-list v-for="ava in $store.state.avatars.avatarsInfo.values()" :key="ava">
                    <div>{{ ava.stringify() }} </div>
                </q-list>

            </q-tab-panel>
        </q-tab-panels>
        <!-- <q-inner-loading :showing="">
            <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading> -->
    </OverlayShell>
</template>

<script lang="ts">

import { defineComponent } from "vue";
import { AMessage, FloofChatMessage } from "@Modules/domain/message";

// import Log from "@Modules/debugging/log";

import OverlayShell from "../OverlayShell.vue";

export default defineComponent({
    name: "DebugWindow",

    props: {
        propsToPass: { type: Object, default: () => ({}) }
    },

    components: {
        OverlayShell
    },

    data: () => ({
        messageInput: "",
        tab: null,
        subscribed: false  // 'true' if subscribed for messages
    }),

    computed: {
    },

    methods: {
        getProfilePicture(username: string): string | null {
            // Should store profile pictures after retrieving and then pull each
            // subsequent one from cache instead of hitting metaverse every time.

            // This is filler functionality to enable the UI to be developed more correctly now.
            if (username === "testerino") {
                return "https://cdn.quasar.dev/img/avatar4.jpg";
            }
            return null;
        },
        // Return the sender Id included in the message. Returns the ID string if no displayname
        msgSender(pMsg: AMessage): string {
            if (pMsg.messageJSON) {
                // eslint-disable-next-line max-len
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unnecessary-type-assertion
                const fMsg = <FloofChatMessage>pMsg.messageJSON;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-member-access
                return fMsg.displayName;
            }
            return pMsg.senderId.stringify();
        },
        msgText(pMsg: AMessage): string {
            if (pMsg.messageJSON) {
                // eslint-disable-next-line max-len
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unnecessary-type-assertion
                const fMsg = <FloofChatMessage>pMsg.messageJSON;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-member-access
                return fMsg.message;
            }
            return pMsg.message;
        }
    }

    // created: function() {
    // }

    // mounted: function () {
    // }
});
</script>
