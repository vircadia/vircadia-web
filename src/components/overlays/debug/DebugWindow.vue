<!--
//  DebugWindow.vue
//
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
-->

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
        :style="{
            'box-shadow': '0 1px 5px rgb(0 0 0 / 20%), 0 2px 2px rgb(0 0 0 / 14%), 0 3px 1px -2px rgb(0 0 0 / 12%)',
            border: 'none'
        }"
    >
        <q-tabs
            v-model="tab"
            dense
        >
            <q-tab name="Domains" icon="travel_explore" label="Domains" />
            <q-tab name="Messages" icon="chat" label="Messages" />
            <q-tab name="Avatars" icon="people" label="Avatars" />
            <q-tab name="Theme" icon="palette" label="Theme" />
        </q-tabs>
        <q-tab-panels style="height: calc(100% - 56px);background-color: transparent;" v-model="tab" animated>
            <q-tab-panel name="Domains">
            </q-tab-panel>
            <q-tab-panel name="Messages">
                <q-list
                    v-if="applicationStore.messages.messages.length > 0"
                >
                    <div
                        v-for="msg in applicationStore.messages.messages"
                        :key="msg.id"
                    >
                        {{ msgSender(msg) }} : {{ msgText(msg) }}
                    </div>
                </q-list>
                <p v-else class="text-subtitle1 text-grey text-center q-mt-md">There are no messages to show.</p>
            </q-tab-panel>
            <q-tab-panel name="Avatars">
                <div>DisplayName: {{ userStore.avatar.displayName }}</div>
                <div>Location: {{ userStore.avatar.location }}</div>
                <div></div>
                <div>Avatars: {{ applicationStore.avatars.count }} </div>
                <q-list v-for="ava in applicationStore.avatars.avatarsInfo.values()" :key="ava.sessionId.stringify()">
                    <div>{{ ava }} </div>
                </q-list>
            </q-tab-panel>
            <q-tab-panel name="Theme">
                <q-scroll-area
                    class="col"
                    style="height: 100%;"
                >
                        <q-item>
                            <q-input
                                name="brandName"
                                dense
                                style="width: 100%;"
                                v-model="applicationStore.theme.brandName"
                            />
                        </q-item>
                        <q-item>
                            <q-input
                                name="productName"
                                dense
                                style="width: 100%;"
                                v-model="applicationStore.theme.productName"
                            />
                        </q-item>
                        <q-item>
                            <q-input
                                name="tagline"
                                dense
                                style="width: 100%;"
                                v-model="applicationStore.theme.tagline"
                            />
                        </q-item>
                        <q-item>
                            <q-input
                                name="globalServiceTerm"
                                dense
                                style="width: 100%;"
                                v-model="applicationStore.theme.globalServiceTerm"
                            />
                        </q-item>
                        <q-item>
                            <div class="col">
                                Colors:
                                <div class="row" style="display: flex;gap: 20px;">
                                    <div class="col">
                                        Primary:
                                        <q-color
                                            name="primary"
                                            v-model="applicationStore.theme.colors.primary"
                                        />
                                    </div>
                                    <div class="col">
                                        Secondary:
                                        <q-color
                                            name="secondary"
                                            v-model="applicationStore.theme.colors.secondary"
                                        />
                                    </div>
                                    <div class="col">
                                        Accent:
                                        <q-color
                                            name="accent"
                                            v-model="applicationStore.theme.colors.accent"
                                        />
                                    </div>
                                </div>
                            </div>
                        </q-item>
                        <q-item>
                            <q-select
                                name="globalStyle"
                                label="globalStyle"
                                dense
                                options-dense
                                style="width: 100%;"
                                :options="theme.globalStyle.options"
                                v-model="applicationStore.theme.globalStyle"
                            />
                        </q-item>
                        <q-item>
                            <q-select
                                name="headerStyle"
                                label="headerStyle"
                                dense
                                options-dense
                                style="width: 100%;"
                                :options="theme.headerStyle.options"
                                v-model="applicationStore.theme.headerStyle"
                            />
                        </q-item>
                        <q-item>
                            <q-select
                                name="windowStyle"
                                label="windowStyle"
                                dense
                                options-dense
                                style="width: 100%;"
                                :options="theme.windowStyle.options"
                                v-model="applicationStore.theme.windowStyle"
                            />
                        </q-item>
                        <q-item>
                        </q-item>
                </q-scroll-area>
            </q-tab-panel>
        </q-tab-panels>
        <!-- <q-inner-loading :showing="">
            <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading> -->
    </OverlayShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { applicationStore, userStore } from "@Stores/index";
import { ChatMessage, DomainChatMessage } from "@Modules/domain/message";
import OverlayShell from "../OverlayShell.vue";

export default defineComponent({
    name: "DebugOverlay",

    props: {
        propsToPass: { type: Object, default: () => ({}) }
    },

    components: {
        OverlayShell
    },

    setup() {
        return {
            applicationStore,
            userStore
        };
    },

    data() {
        return {
            messageInput: "",
            tab: null,
            subscribed: false,  // 'true' if subscribed for messages
            theme: {
                defaultMode: {
                    options: ["light", "dark"]
                },
                globalStyle: {
                    options: ["none", "aero", "mica"]
                },
                headerStyle: {
                    options: ["none", "gradient-left", "gradient-right"]
                },
                windowStyle: {
                    options: ["none", "gradient-top", "gradient-right", "gradient-bottom", "gradient-left"]
                }
            }
        };
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
        msgSender(pMsg: ChatMessage): string {
            if (pMsg.messageJSON) {
                const fMsg = <DomainChatMessage>pMsg.messageJSON;
                return fMsg.displayName;
            }
            return pMsg.senderId.stringify();
        },
        msgText(pMsg: ChatMessage): string {
            if (pMsg.messageJSON) {
                const fMsg = <DomainChatMessage>pMsg.messageJSON;
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
