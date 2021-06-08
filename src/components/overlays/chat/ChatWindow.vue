<!--
//  ChatWindow.vue
//
//  Created by Kalila L. on May 13th, 2021.
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
        icon="chat"
        title="Chat"
        :propsToPass="propsToPass"
        :defaultHeight="300"
        :defaultWidth="600"
        :defaultLeft="0"
        :hoverShowBar="true"
        :style="{ 'background': 'transparent', 'box-shadow': 'none', border: 'none' }"
    >
        <q-card
            class="column no-wrap items-stretch full-height"
            style="background: transparent; box-shadow: none;"
        >
            <q-scroll-area
                class="col"
                style="height: 100%"
            >
                <q-card-section class="q-pt-none">
                    <div v-for="message in worldChatHistory" :key="message.timestamp">
                        <q-chat-message
                            :text="[ message.message ]"
                            :sent="message.self"
                            :name="message.displayName"
                            :stamp="message.timestamp"
                            text-color="white"
                            bg-color="primary"
                        >
                            <template v-slot:avatar>
                                <q-avatar color="primary">
                                    <img v-if="getProfilePicture(message.username)" :src="getProfilePicture(message.username)">
                                    <span v-else>{{ message.displayName.charAt(0) }}</span>
                                </q-avatar>
                            </template>
                        </q-chat-message>
                    </div>
                </q-card-section>
            </q-scroll-area>
            <q-input
                class="inputBox"
                placeholder="Type a message..."
                outlined
                v-model="messageInput"
                :dense="true"
            />
        </q-card>
        <!-- <q-inner-loading :showing="">
            <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading> -->
    </OverlayShell>
</template>

<script>
import OverlayShell from '../OverlayShell.vue';

export default {
    name: 'ChatWindow',

    props: {
        propsToPass: { type: Object, default: () => ({}) }
    },

    components: {
        OverlayShell
    },

    data: () => ({
        messageInput: '',
        // The reason for using "self" instead of checking if the username matches our own
        // is because a user may write chat messages as a guest. Checking "displayName"
        // won't help much either as anyone can choose any display name and cause confusion.
        worldChatHistory: [
            {
                displayName: 'Hallo',
                username: 'nani',
                self: false,
                timestamp: (new Date()).toString(),
                message: 'Hi, hru?'
            },
            {
                displayName: 'Waifu',
                username: 'testerino',
                self: true,
                timestamp: (new Date()).toString(),
                message: 'Sup holmes.'
            },
            {
                displayName: 'Hallo',
                username: 'nani',
                self: false,
                timestamp: (new Date()).toString(),
                message: 'nammuch you?'
            },
            {
                displayName: 'Waifu',
                username: 'testerino',
                self: true,
                timestamp: (new Date()).toString(),
                message: 'you know the life.'
            }
        ]
    }),

    computed: {
    },

    methods: {
        getProfilePicture (username) {
            // Should store profile pictures after retrieving and then pull each
            // subsequent one from cache instead of hitting metaverse every time.

            // This is filler functionality to enable the UI to be developed more correctly now.
            if (username === 'testerino') {
                return 'https://cdn.quasar.dev/img/avatar4.jpg';
            } else {
                return false;
            }
        }
    },

    created: function () {
    },

    mounted: function () {
    }
};
</script>