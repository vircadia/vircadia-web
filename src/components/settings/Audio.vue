<!--
//  MainScene.vue
//
//  Created by Kalila L. on May 11th, 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
-->

<template>
    <q-card
        style="width: 500px"
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
                    <q-btn
                        fab
                        class="q-mr-sm"
                        :color="$store.state.audio.input.hasCapturePermissions ? 'primary' : 'red'"
                        :icon="$store.state.audio.input.hasCapturePermissions ? 'mic' : 'mic_off'"
                    />

                    <span
                        v-if="selectedInputStore"
                        class="text-subtitle1"
                    >
                        Using {{ selectedInputStore.label }}
                    </span>

                    <span
                        v-else
                        class="text-subtitle1"
                    >
                        No microphone selected.
                    </span>

                    <audio id="audioInputFeedbackPlayer" controls></audio>

                    <q-linear-progress
                        v-show="$store.state.audio.input.selected"
                        size="25px"
                        :value=".5"
                        color="accent"
                    />

                    <q-separator
                        class="q-my-md"
                    />

                    <div
                        v-if="!$store.state.audio.input.hasCapturePermissions"
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
                                        v-model="selectedInputStore"
                                        :val="input.deviceId"
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
    </q-card>
</template>

<script>
/* eslint-disable */
var vue_this;

export default {
    name: 'Audio',

    data: () => ({
        tab: 'input'
    }),

    computed: {
        selectedInputStore: {
            get () {
                return this.$store.state.audio.input.currentInputDevice;
            },
            set (deviceId) {
                this.$store.state.audio.input.requestSpecificInputAccess(deviceId);
            }
        }
    },

    methods: {
        setAudioInputStream: function (stream) {
            const player = document.getElementById('audioInputFeedbackPlayer');

            if (window.URL) {
                player.srcObject = stream;
            } else {
                player.src = stream;
            }
        }
    },

    created: function () {
    },

    mounted: function () {
        vue_this = this;

        this.$store.state.audio.input.requestInputAccess()
            .then(this.setAudioInputStream);
    }
}
</script>
