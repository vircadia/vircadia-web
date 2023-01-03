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
                <q-btn
                    :class="{
                        'bg-grey-9': $q.dark.isActive,
                        'bg-grey-4': !$q.dark.isActive
                    }"
                    @click="switchDomain()"
                >Switch domain</q-btn>
            </q-tab-panel>
            <q-tab-panel name="Messages">
                <q-list
                    v-if="$store.state.messages.messages.length > 0"
                >
                    <div
                        v-for="msg in $store.state.messages.messages"
                        :key="msg.id"
                    >
                        {{ msgSender(msg) }} : {{ msgText(msg) }}
                    </div>
                </q-list>
                <p v-else class="text-subtitle1 text-grey text-center q-mt-md">There are no messages to show.</p>
            </q-tab-panel>
            <q-tab-panel name="Avatars">
                <div>DisplayName: {{ $store.state.avatar.displayName }}</div>
                <div>Location: {{ $store.state.avatar.location }}</div>
                <div></div>
                <div>Avatars: {{ $store.state.avatars.count }} </div>
                <q-list v-for="ava in $store.state.avatars.avatarsInfo.values()" :key="ava">
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
                                v-model="themeBrandNameStore"
                            />
                        </q-item>
                        <q-item>
                            <q-input
                                name="productName"
                                dense
                                style="width: 100%;"
                                v-model="themeProductNameStore"
                            />
                        </q-item>
                        <q-item>
                            <q-input
                                name="tagline"
                                dense
                                style="width: 100%;"
                                v-model="themeTaglineStore"
                            />
                        </q-item>
                        <q-item>
                            <q-input
                                name="globalServiceTerm"
                                dense
                                style="width: 100%;"
                                v-model="themeGlobalServiceTermStore"
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
                                            v-model="themeColorPrimaryStore"
                                        />
                                    </div>
                                    <div class="col">
                                        Secondary:
                                        <q-color
                                            name="secondary"
                                            v-model="themeColorSecondaryStore"
                                        />
                                    </div>
                                    <div class="col">
                                        Accent:
                                        <q-color
                                            name="accent"
                                            v-model="themeColorAccentStore"
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
                                v-model="themeGlobalStyleStore"
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
                                v-model="themeHeaderStyleStore"
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
                                v-model="themeWindowStyleStore"
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
import { AMessage, DefaultChatMessage } from "@Modules/domain/message";
import { Renderer } from "@Modules/scene";
import { Store, Mutations as StoreMutations } from "@Store/index";


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
    }),

    computed: {
        themeBrandNameStore: {
            get: function(): string {
                return this.$store.state.theme.brandName;
            },
            set: function(value: string): void {
                Store.commit(StoreMutations.MUTATE, {
                    property: "theme.brandName",
                    value
                });
            }
        },
        themeProductNameStore: {
            get: function(): string {
                return this.$store.state.theme.productName;
            },
            set: function(value: string): void {
                Store.commit(StoreMutations.MUTATE, {
                    property: "theme.productName",
                    value
                });
            }
        },
        themeTaglineStore: {
            get: function(): string {
                return this.$store.state.theme.tagline;
            },
            set: function(value: string): void {
                Store.commit(StoreMutations.MUTATE, {
                    property: "theme.tagline",
                    value
                });
            }
        },
        themeGlobalServiceTermStore: {
            get: function(): string {
                return this.$store.state.theme.globalServiceTerm;
            },
            set: function(value: string): void {
                Store.commit(StoreMutations.MUTATE, {
                    property: "theme.globalServiceTerm",
                    value
                });
            }
        },
        themeColorPrimaryStore: {
            get: function(): string {
                return this.$store.state.theme.colors.primary;
            },
            set: function(value: string): void {
                Store.commit(StoreMutations.MUTATE, {
                    property: "theme.colors.primary",
                    value
                });
            }
        },
        themeColorSecondaryStore: {
            get: function(): string {
                return this.$store.state.theme.colors.secondary;
            },
            set: function(value: string): void {
                Store.commit(StoreMutations.MUTATE, {
                    property: "theme.colors.secondary",
                    value
                });
            }
        },
        themeColorAccentStore: {
            get: function(): string {
                return this.$store.state.theme.colors.accent;
            },
            set: function(value: string): void {
                Store.commit(StoreMutations.MUTATE, {
                    property: "theme.colors.accent",
                    value
                });
            }
        },
        themeGlobalStyleStore: {
            get: function(): string {
                return this.$store.state.theme.globalStyle;
            },
            set: function(value: string): void {
                Store.commit(StoreMutations.MUTATE, {
                    property: "theme.globalStyle",
                    value
                });
            }
        },
        themeHeaderStyleStore: {
            get: function(): string {
                return this.$store.state.theme.headerStyle;
            },
            set: function(value: string): void {
                Store.commit(StoreMutations.MUTATE, {
                    property: "theme.headerStyle",
                    value
                });
            }
        },
        themeWindowStyleStore: {
            get: function(): string {
                return this.$store.state.theme.windowStyle;
            },
            set: function(value: string): void {
                Store.commit(StoreMutations.MUTATE, {
                    property: "theme.windowStyle",
                    value
                });
            }
        }
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
                const fMsg = <DefaultChatMessage>pMsg.messageJSON;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-member-access
                return fMsg.displayName;
            }
            return pMsg.senderId.stringify();
        },
        msgText(pMsg: AMessage): string {
            if (pMsg.messageJSON) {
                // eslint-disable-next-line max-len
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unnecessary-type-assertion
                const fMsg = <DefaultChatMessage>pMsg.messageJSON;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-member-access
                return fMsg.message;
            }
            return pMsg.message;
        },
        switchDomain(): void {
            // Switch domain.
            const scene = Renderer.getScene();
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            scene.switchDomain();
        }
    }

    // created: function() {
    // }

    // mounted: function () {
    // }
});
</script>
