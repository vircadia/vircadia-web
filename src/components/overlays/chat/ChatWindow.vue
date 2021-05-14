<!--
//  ChatWindow.vue
//
//  Created by Kalila L. on May 13th, 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
-->

<template>
    <OverlayShell
        icon="chat"
        title="Chat"
        :defaultHeight="300"
        :defaultWidth="600"
        :hoverShowBar="true"
        top="unset"
        bottom="0"
        right="unset"
        left="0"
        border="none"
        boxShadow="none"
        background="transparent"
    >
        <q-card
            class="column full-height"
            style="background: transparent; box-shadow: none;"
        >
            <q-scroll-area
                style="height: 100%"
            >
                <q-card-section class="q-pt-none">
                    <div v-for="message in worldChatHistory" :key="message.timestamp">
                        <q-chat-message
                            :text="[ message.message ]"
                            :sent="message.self"
                            text-color="white"
                            bg-color="primary"
                        >
                            <template v-slot:name>{{ message.displayName }}</template>
                            <template v-slot:stamp>{{ message.timestamp }}</template>
                            <template v-slot:avatar>
                                <img
                                    class="q-message-avatar q-message-avatar--sent"
                                    :src="getProflePicture(message.username)"
                                >
                            </template>
                        </q-chat-message>
                    </div>
                </q-card-section>

                <!-- <q-card-actions align="right">
                    <q-btn v-close-popup flat color="primary" label="Reserve" />
                    <q-btn v-close-popup flat color="primary" round icon="event" />
                </q-card-actions> -->
            </q-scroll-area>
            <q-input
                style="position: fixed; bottom: 0;"
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
/* eslint-disable */
import OverlayShell from '../OverlayShell'

export default {
    name: 'ChatWindow',

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
                timestamp: Date.now(),
                message: 'Hi, hru?'
            },
            {
                displayName: 'Waifu',
                username: 'testerino',
                self: true,
                timestamp: Date.now(),
                message: 'Sup holmes.'
            },
            {
                displayName: 'Hallo',
                username: 'nani',
                self: false,
                timestamp: Date.now(),
                message: 'nammuch you?'
            },
            {
                displayName: 'Waifu',
                username: 'testerino',
                self: true,
                timestamp: Date.now(),
                message: 'you know the life.'
            }
        ]
    }),

    computed: {
    },

    methods: {
        getProflePicture (username) {
            // Should store profile pictures after retrieving and then pull each
            // subsequent one from cache instead of hitting metaverse every time.
            return 'https://cdn.quasar.dev/img/avatar4.jpg';
        }
    },

    created: function () {
    },

    mounted: function () {
    }
}
</script>
