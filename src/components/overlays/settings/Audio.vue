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
        :defaultHeight="500"
        :defaultWidth="400"
    >
        <q-card
            class="column full-height"
            v-if="$store.state.audio.input"
        >
            <q-scroll-area
                style="height: 100%"
            >
                <q-card-section>
                    <div class="row no-wrap items-center">
                        <div class="col text-h2 ellipsis">
                            Audio
                        </div>
                        <!-- <div class="col-auto text-grey text-caption q-pt-md row no-wrap items-center">
                            <q-icon name="place" />
                            250 ft
                        </div> -->
                    </div>

                </q-card-section>

                <q-separator />

                <q-card-section class="q-pt-none">
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

                    <q-tab-panels v-model="tab" animated>
                        <q-tab-panel name="input">
                            <div class="row">
                                <div class=".col-4">
                                    <q-btn
                                        fab
                                        class="q-mr-sm"
                                        :color="$store.state.audio.input.hasInputAccess ? 'primary' : 'red'"
                                        :icon="$store.state.audio.input.hasInputAccess ? 'mic' : 'mic_off'"
                                        @click="micToggled"
                                    />
                                </div>

                                <div class=".col-8 row items-center">
                                    <span
                                        v-if="selectedInputStore"
                                        class="text-subtitle1 items-center"
                                    >
                                        Using {{ selectedInputStore.label }}
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
                                v-show="$store.state.audio.input.hasInputAccess"
                                class="row q-mt-sm"
                            >
                                <q-btn
                                    flat
                                    dense
                                    round
                                    class="q-mr-sm"
                                    :disabled="!$store.state.audio.input.hasInputAccess"
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
                                v-if="$store.state.audio.input.hasInputAccess === false"
                                class="text-subtitle1 text-grey text-center"
                            >
                                Please grant mic access to the app in order to speak.
                            </div>

                            <q-list v-else>
                                <!--
                                    Rendering a <label> tag (notice tag="label")
                                    so QRadios will respond to clicks on QItems to
                                    change Toggle state.
                                -->
                                <div v-for="input in $store.state.audio.input.inputsList" :key="input.deviceId">
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
                </q-card-section>

                <q-separator />

                <!-- <q-card-actions align="right">
                    <q-btn v-close-popup flat color="primary" label="Reserve" />
                    <q-btn v-close-popup flat color="primary" round icon="event" />
                </q-card-actions> -->
            </q-scroll-area>
        </q-card>

        <q-inner-loading :showing="!$store.state.audio.input">
            <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>
    </OverlayShell>
</template>

<script>
/* eslint-disable */
import OverlayShell from '../OverlayShell'

export default {
    name: 'Audio',

    components: {
        OverlayShell
    },

    data: () => ({
        tab: 'input',
        isListeningToFeedback: false
    }),

    computed: {
        selectedInputStore: {
            get () {
                return this.$store.state.audio.input.currentInputDevice;
            },
            set () {
                // @click will set for us...
            }
        }
    },

    methods: {
        setAudioInputStream: function (stream) {
            if (!this.$refs.audioInputFeedbackPlayer) return;

            if (window.URL) {
                this.$refs.audioInputFeedbackPlayer.srcObject = stream;
            } else {
                this.$refs.audioInputFeedbackPlayer.src = stream;
            }
        },

        requestInputAccess: function () {
            this.$store.state.audio.input.requestInputAccess()
                .then(this.setAudioInputStream);
        },

        requestSpecificInputAccess: function (deviceId) {
            this.$store.state.audio.input.requestSpecificInputAccess(deviceId)
                .then(this.setAudioInputStream);
        },

        micToggled: function () {
            if (this.$store.state.audio.input.hasInputAccess === true) {
                // Should mute/unmute
            } else {
                this.requestInputAccess();
            }
        },

        toggleInputFeedback: function () {
            this.isListeningToFeedback = !this.isListeningToFeedback;

            if (this.isListeningToFeedback === true) {
                this.$refs.audioInputFeedbackPlayer.muted = false;
                this.$refs.audioInputFeedbackPlayer.play();
            } else {
                this.$refs.audioInputFeedbackPlayer.pause();
            }
        }
    },

    created: function () {
    },

    mounted: function () {
        this.$nextTick(() => {
            this.requestInputAccess();
        });
    }
}
</script>
