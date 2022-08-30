<!--
//  ChatWindow.vue
//
//  Created by Kalila L. on May 13th, 2021.
//  Copyright 2021 Vircadia contributors.
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
        icon="chat"
        title="Chat"
        :managerProps="propsToPass"
        :defaultHeight="300"
        :defaultWidth="600"
        :defaultLeft="0"
        :defaultTop="400"
        :hoverShowBar="true"
        :style="{
            'box-shadow': '0 1px 5px rgb(0 0 0 / 20%), 0 2px 2px rgb(0 0 0 / 14%), 0 3px 1px -2px rgb(0 0 0 / 12%)',
            border: 'none'
        }"
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
                    <div v-for="msg in $store.state.messages.messages" :key="msg.whenReceived">
                        <q-chat-message
                            :text="[ msgText(msg) ]"
                            :sent="msgSentBySelf(msg)"
                            :name="msgSender(msg)"
                            :stamp="msgTime(msg)"
                            text-color="white"
                            bg-color="primary"
                        >
                            <template v-slot:avatar>
                                <q-avatar color="primary">
                                    <img v-if="getProfilePicture(msgSender(msg))" :src="getProfilePicture(msgSender(msg))">
                                    <span v-else>{{ msgSender(msg).charAt(0) }}</span>
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
                @keydown.enter.prevent="submitMessage"
            >
                <template v-slot:append>
                    <q-btn
                        title="Click, or press Enter to send."
                        round
                        dense
                        @click.stop="submitMessage"
                    >
                        <q-icon name="send" color="primary"></q-icon>
                    </q-btn>
                </template>
            </q-input>
        </q-card>
        <!-- <q-inner-loading :showing="">
            <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading> -->
    </OverlayShell>
</template>

<script lang="ts">

import { defineComponent } from "vue";
import OverlayShell from "../OverlayShell.vue";

import { AMessage, DomainMessage, FloofChatMessage } from "@Modules/domain/message";
import { DomainMgr } from "@Modules/domain";

// import Log from "@Modules/debugging/log";

export default defineComponent({
    name: "ChatWindow",

    props: {
        propsToPass: { type: Object, default: () => ({}) }
    },

    components: {
        OverlayShell
    },

    data: () => ({
        messageInput: "",
        // The reason for using "self" instead of checking if the username matches our own
        // is because a user may write chat messages as a guest. Checking "displayName"
        // won"t help much either as anyone can choose any display name and cause confusion.
        subscribed: false,  // 'true' if subscribed for messages

        // Following is legacy test data. Can be removed when chat is working
        worldChatHistory: [
            {
                displayName: "Hallo",
                username: "nani",
                self: false,
                timestamp: new Date().toString(),
                message: "Hi, hru?"
            },
            {
                displayName: "Waifu",
                username: "testerino",
                self: true,
                timestamp: new Date().toString(),
                message: "Sup holmes."
            },
            {
                displayName: "Hallo",
                username: "nani",
                self: false,
                timestamp: new Date().toString(),
                message: "nammuch you?"
            },
            {
                displayName: "Waifu",
                username: "testerino",
                self: true,
                timestamp: new Date().toString(),
                message: "you know the life."
            }
        ]
    }),

    computed: {
    },

    watch: {
        /*
        // When the message input changes, send the message
        messageInput: function(val: string): void {
            if (DomainMgr.ActiveDomain) {
                const msger = DomainMgr.ActiveDomain.MessageClient;
                if (msger) {
                    const msg: FloofChatMessage = {
                        type: "TransmitChatMessage",
                        channel: DomainMessage.DefaultChatChannel,
                        message: val,
                        colour: { red: 255, blue: 255, green: 255 },
                        displayName: this.$store.state.avatar.displayName,
                        position: this.$store.state.avatar.position
                    };
                    msger.sendMessage(DomainMessage.DefaultChatChannel, JSON.stringify(msg));
                }
            }
        }
        */
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
        // Return the text of the messsage.
        // This is where message format is checked. If FloofChat, use the text in the JSON packet
        msgText(pMsg: AMessage): string {
            if (pMsg.messageJSON) {
                // eslint-disable-next-line max-len
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unnecessary-type-assertion
                const fMsg = <FloofChatMessage>pMsg.messageJSON;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-member-access
                return fMsg.message;
            }
            return pMsg.message;
        },
        // Return the printable time of the message.
        msgTime(pMsg: AMessage): string {
            return pMsg.whenReceived.toUTCString();
        },
        // Return 'true' if the chat message was sent by this session
        // Relies of the message queuer to add the "self: true" to the added message
        msgSentBySelf(pMsg: AMessage): boolean {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return pMsg.self ?? false;
        },
        submitMessage(): void {
            if (DomainMgr.ActiveDomain) {
                const msger = DomainMgr.ActiveDomain.MessageClient;
                if (msger) {
                    const msg: FloofChatMessage = {
                        type: "TransmitChatMessage",
                        channel: "Local",
                        message: this.messageInput,
                        colour: { red: 255, blue: 204, green: 229 },    // orangish
                        displayName: this.$store.state.avatar.displayName,
                        position: this.$store.state.avatar.position
                    };
                    msger.sendMessage(DomainMessage.DefaultChatChannel, JSON.stringify(msg));
                    // clear the input field
                    this.messageInput = "";
                }
            }
        }
    }

    // created: function() {
    // }

    // mounted: function () {
    // }
});
</script>
