<!--
//  Audio.vue
//
//  Created by Kalila L. on May 11th, 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
-->

<template>
    <OverlayShell
        icon="headphones"
        title="Audio"
        :managerProps="propsToPass"
        :defaultHeight="500"
        :defaultWidth="400"
    >
        <q-card
            class="column full-height"
            v-if="$store.state.audio.inputsList.length > 0"
        >

            <q-tabs
                v-model="tab"
                active-color="primary"
                indicator-color="primary"
                align="justify"
                narrow-indicator
            >
                <q-tab name="input" label="Input" />
                <q-tab name="output" label="Output" />
            </q-tabs>

            <q-separator />

            <q-scroll-area class="col">
                <q-tab-panels v-model="tab" animated>
                    <q-tab-panel name="input">
                        <div class="row">
                            <div class=".col-4">
                                <q-btn
                                    fab
                                    class="q-mr-sm"
                                    :color="$store.state.audio.hasInputAccess ? 'primary' : 'red'"
                                    :icon="$store.state.audio.hasInputAccess ? 'mic' : 'mic_off'"
                                    @click="micToggled"
                                />
                            </div>

                            <div class=".col-8 row items-center">
                                <span
                                    v-if="selectedInputStore"
                                    class="text-subtitle1 items-center"
                                >
                                    Using {{ selectedInputStore }}
                                </span>

                                <span
                                    v-else
                                    class="text-subtitle1 items-center"
                                >
                                    No microphone selected.
                                </span>
                            </div>
                        </div>

                        <div
                            v-show="$store.state.audio.hasInputAccess"
                            class="row q-mt-sm"
                        >
                            <q-btn
                                flat
                                dense
                                round
                                class="q-mr-sm"
                                :disabled="!$store.state.audio.hasInputAccess"
                                :color="isListeningToFeedback ? 'primary' : 'red'"
                                :icon="isListeningToFeedback ? 'hearing' : 'hearing_disabled'"
                                @click="toggleInputFeedback"
                            />

                            <span
                                v-if="!isListeningToFeedback"
                                class="text-caption row items-center"
                            >
                                Click to test your microphone.
                            </span>

                            <span
                                v-else
                                class="text-caption row items-center"
                            >
                                Speak into your microphone to listen.
                            </span>

                            <audio ref="audioInputFeedbackPlayer"></audio>
                        </div>

                        <q-separator
                            class="q-my-md"
                        />

                        <div
                            v-if="$store.state.audio.hasInputAccess === false"
                            class="text-subtitle1 text-grey text-center"
                        >
                            Please grant mic access to the app in order to speak.
                        </div>

                        <q-list v-else>
                            <div v-for="input in $store.state.audio.inputsList" :key="input.deviceId">
                                <q-item v-show="input.label" tag="label" v-ripple>
                                    <q-item-section avatar>
                                        <q-radio
                                            @click="requestSpecificInputAccess(input.deviceId)"
                                            v-model="selectedInputStore"
                                            :val="input"
                                            color="teal"
                                        />
                                    </q-item-section>
                                    <q-item-section>
                                        <q-item-label>{{ input.label }}</q-item-label>
                                    </q-item-section>
                                </q-item>
                            </div>
                        </q-list>
                    </q-tab-panel>

                    <q-tab-panel name="output">
                        Coming soon!
                    </q-tab-panel>
                </q-tab-panels>
            </q-scroll-area>
        </q-card>

        <q-inner-loading :showing="$store.state.audio.inputsList.length === 0">
            <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>
    </OverlayShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import OverlayShell from "@Components/overlays/OverlayShell.vue";

import { Audio } from "@Modules/audio";

export default defineComponent({
    name: "Audio",

    // This is a solution mentioned on the net but it doesn't seem to work. More research needed.
    $refs!: {   // definition to make this.$ref work with TypeScript
        audioInputFeedbackPlayer: HTMLMediaElement
    },

    props: {
        propsToPass: { type: Object, default: () => ({}), required: false }
    },

    components: {
        OverlayShell
    },

    data: () => ({
        tab: "input",
        isListeningToFeedback: false
    }),

    computed: {
        selectedInputStore: {
            get: function(): string {
                return this.$store.state.audio.currentInputDevice;
            },
            set: function() {
                // @click will set for us...
            }
        }
    },

    methods: {
        setAudioInputStream: function(pStream: string | MediaStream): void {
            if (!this.$refs.audioInputFeedbackPlayer) {
                return;
            }

            // if (window.URL) {
            if (typeof pStream === "string") {
                (this.$refs.audioInputFeedbackPlayer as HTMLMediaElement).src = pStream;
            } else {
                (this.$refs.audioInputFeedbackPlayer as HTMLMediaElement).srcObject = pStream;
            }
        },

        requestInputAccess: async function(): Promise<void> {
            const inputStream = await Audio.requestInputAccess();
            if (inputStream) {
                this.setAudioInputStream(inputStream);
            }
        },

        requestSpecificInputAccess: async function(deviceId: string) {
            const inputStream = await Audio.requestSpecificInputAccess(deviceId);
            if (inputStream) {
                this.setAudioInputStream(inputStream);
            }
        },

        micToggled: function() {
            if (this.$store.state.audio.hasInputAccess === true) {
                // Should mute/unmute
            } else {
                // eslint-disable-next-line no-void
                void this.requestInputAccess();
            }
        },

        toggleInputFeedback: function() {
            this.isListeningToFeedback = !this.isListeningToFeedback;

            if (this.isListeningToFeedback === true) {
                (this.$refs.audioInputFeedbackPlayer as HTMLMediaElement).muted = false;
                // eslint-disable-next-line no-void
                void (this.$refs.audioInputFeedbackPlayer as HTMLMediaElement).play();
            } else {
                (this.$refs.audioInputFeedbackPlayer as HTMLMediaElement).pause();
            }
        }
    },

    // created: function () {
    // },

    mounted: function(): void {
        /* commented out to wait for implementation
        this.$nextTick(() => {
            this.requestInputAccess();
        });
        */
    }
});
</script>
