<!--
//  Audio.vue
//
//  Created by Kalila L. on May 11th, 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
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
                                    :color="!applicationStore.audio.user.hasInputAccess ?
                                        'grey' : applicationStore.audio.user.muted ? 'red' : 'primary'"
                                    :icon="applicationStore.audio.user.muted ? 'mic_off' : 'mic'"
                                    @click="toggleMicrophoneMute"
                                />
                            </div>

                            <div class=".col-8 row items-center">
                                <span
                                    v-if="AudioIO.selectedInput !== 'None selected'"
                                    class="text-subtitle1 items-center"
                                >
                                    Using {{ AudioIO.selectedInput }}
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
                            v-show="applicationStore.audio.user.hasInputAccess"
                            class="row q-mt-sm"
                        >
                            <q-btn
                                flat
                                dense
                                round
                                class="q-mr-sm"
                                :disabled="!applicationStore.audio.user.hasInputAccess"
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

                        <q-separator class="q-my-md" />

                        <div
                            v-if="!applicationStore.audio.user.hasInputAccess"
                            class="text-subtitle1 text-grey text-center"
                        >
                            Please grant mic access to the app in order to speak.
                        </div>

                        <q-list v-else>
                            <div v-for="input in applicationStore.audio.inputsList" :key="input.deviceId">
                                <q-radio
                                    @click="AudioIO.requestInputAccess(input.deviceId)"
                                    v-model="AudioIO.selectedInput"
                                    :val="input.label"
                                    :label="input.label"
                                    color="primary"
                                />
                            </div>
                        </q-list>
                    </q-tab-panel>

                    <q-tab-panel name="output">
                        <div class=".col-8 row items-center">
                            <span
                                v-if="AudioIO.selectedOutput"
                                class="text-subtitle1 items-center"
                            >
                                Using {{ AudioIO.selectedOutput }}
                            </span>

                            <span
                                v-else
                                class="text-subtitle1 items-center"
                            >
                                No output selected.
                            </span>
                        </div>

                        <q-separator class="q-my-md" />

                        <q-list>
                            <div v-for="output in applicationStore.audio.outputsList" :key="output.deviceId">
                                <q-radio
                                    @click="AudioIO.requestOutputAccess(output.deviceId)"
                                    v-model="AudioIO.selectedOutput"
                                    :val="output.label"
                                    :label="output.label"
                                    color="primary"
                                />
                            </div>
                        </q-list>
                    </q-tab-panel>
                </q-tab-panels>
            </q-scroll-area>
        </q-card>

        <q-inner-loading :showing="applicationStore.audio.inputsList.length === 0">
            <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>
    </OverlayShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { applicationStore } from "@Stores/index";
import { AudioManager } from "@Modules/scene/audio";
import { AudioIO } from "@Modules/ui/audioIO";
import OverlayShell from "@Components/overlays/OverlayShell.vue";

export default defineComponent({
    name: "AudioOverlay",

    props: {
        propsToPass: { type: Object, default: () => ({}), required: false }
    },

    components: {
        OverlayShell
    },

    setup() {
        return {
            applicationStore,
            AudioIO
        };
    },

    data() {
        return {
            tab: "input",
            isListeningToFeedback: false
        };
    },

    methods: {
        // Complement the state of the user's audio input device
        toggleMicrophoneMute(): void {
            if (this.applicationStore.audio.user.hasInputAccess) {
                AudioManager.muteAudio();
            }
        },
        toggleInputFeedback(): void {
            this.isListeningToFeedback = !this.isListeningToFeedback;

            if (this.isListeningToFeedback) {
                (this.$refs.audioInputFeedbackPlayer as HTMLAudioElement).muted = false;
                void (this.$refs.audioInputFeedbackPlayer as HTMLAudioElement).play();
            } else {
                (this.$refs.audioInputFeedbackPlayer as HTMLAudioElement).pause();
            }
        },
        setFeedbackPlayerStream(pStream: MediaStream | string | null): void {
            if (this.isListeningToFeedback) {
                // if doing that feedback test thing, link input to the output
                if (this.$refs.audioInputFeedbackPlayer) {
                    if (typeof pStream === "string") {
                        (this.$refs.audioInputFeedbackPlayer as HTMLAudioElement).src = pStream;
                    } else {
                        (this.$refs.audioInputFeedbackPlayer as HTMLAudioElement).srcObject = pStream;
                    }
                }
            }
        }
    },

    // When the dialog is removed, make sure the audio test feature is off
    unmounted: function(): void {
        this.isListeningToFeedback = false;
        this.setFeedbackPlayerStream(null);
    }
});
</script>
