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
        <!--
        <q-card
            class="column full-height"
            v-if="$store.state.audio.user.inputsList.length > 0"
        >
        -->
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
                                    :color="$store.state.audio.user.hasInputAccess ? 'primary' : 'red'"
                                    :icon="$store.state.audio.user.hasInputAccess ? 'mic' : 'mic_off'"
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
                            v-show="$store.state.audio.user.hasInputAccess"
                            class="row q-mt-sm"
                        >
                            <q-btn
                                flat
                                dense
                                round
                                class="q-mr-sm"
                                :disabled="!$store.state.audio.user.hasInputAccess"
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
                            v-if="$store.state.audio.user.hasInputAccess === false"
                            class="text-subtitle1 text-grey text-center"
                        >
                            Please grant mic access to the app in order to speak.
                        </div>

                        <q-list v-else>
                            <div v-for="input in $store.state.audio.user.inputsList" :key="input.deviceId">
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

        <q-inner-loading :showing="$store.state.audio.user.inputsList.length === 0">
            <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>
    </OverlayShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import OverlayShell from "@Components/overlays/OverlayShell.vue";

import { Mutations as StoreMutations } from "@Store/index";

import Log from "@Modules/debugging/log";

type Nullable<T> = T | null | undefined;    // for some reason, global defns aren't in Vue files

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
                if (this.$store.state.audio.user.currentInputDevice) {
                    return this.$store.state.audio.user.currentInputDevice.label;
                }
                return "None selected";
            },
            set: function() {
                // @click will set for us...
            }
        }
    },

    methods: {
        /** Set the passed output stream to an audio element so the user hears things */
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
            const inputStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            if (inputStream) {
                await this.handleRequestInputSuccess(inputStream);
                this.setAudioInputStream(inputStream);
            }
        },

        /** Request for access to MediaStream is a success so set up the connection.
         *
         * This remembers the stream locally and also updates the Vuex state with
         * connection information.
         *
         * @param {MediaStream} pStream the stream we have access to
         * @returns {Promise<MediaStream>} the stream that was passed in
         */
        handleRequestInputSuccess: async function(pStream: MediaStream): Promise<MediaStream> {
            Log.info(Log.types.AUDIO, "Processing successful input device request.");

            this.$store.commit(StoreMutations.MUTATE, {
                property: "audio.user",
                with: {
                    connected: true,
                    awaitingCapturePermissions: false,
                    hasInputAccess: true,
                    inputStream: pStream
                }
            });

            // Audio inputs do not have labels if the permission has not been received.
            // Therefore, we update the list after success.
            const inputsList = await this.requestInputsList();

            const tracks = pStream.getTracks();
            for (let i = 0; i < tracks.length; i++) {
                inputsList.forEach((device) => {
                    if (device.deviceId === tracks[i].getSettings().deviceId) {
                        this.setCurrentInputDevice(device);
                    }
                });
            }

            return pStream;
        },

        /**
         * Fetch, save, and return the list of media devices of the specified kind.
         * Fetches "audioinput" devices if no alternative specified.
         *
         * @returns {Promise<MediaDeviceInfo>[]} list of "audioinput" media devices
         */
        async requestInputsList(pKind = "audioinput"): Promise<MediaDeviceInfo[]> {
            if (navigator.mediaDevices) {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const inputsList = devices.filter((d) => d.kind === pKind);
                this.saveInputsList(inputsList);
                return inputsList;
            }
            Log.error(Log.types.AUDIO, `requestInputsList: mediaDevices not available`);
            this.saveInputsList([]);
            return [];
        },

        /**
         * Set the list of known audio input devices. This remembers the list locally and
         * also updates the Vuex store with the new information.
         *
         * @param {MediaDeviceInfo[]} pAudioInputs The list of audioinput devices to remember
         */
        saveInputsList(pAudioInputs: MediaDeviceInfo[]): void {
            this.$store.commit(StoreMutations.MUTATE, {
                property: "audio.user.inputsList",
                value: pAudioInputs
            });
        },

        setCurrentInputDevice(pDeviceInfo: MediaDeviceInfo): void {
            Log.info(Log.types.AUDIO, `Successfully set input device ${pDeviceInfo.label}`);

            this.$store.commit(StoreMutations.MUTATE, {
                property: "audio.user.currentInputDevice",
                value: pDeviceInfo
            });
        },

        setAwaitingCapturePermissions(isAwaitingCapturePermissions: boolean): void {
            this.$store.commit(StoreMutations.MUTATE, {
                property: "audio.user.awaitingCapturePermissions",
                value: isAwaitingCapturePermissions
            });
        },


        XrequestSpecificInputAccess: async function(deviceId: string) {
            const inputStream = await this.requestSpecificInputAccess(deviceId);
            if (inputStream) {
                this.setAudioInputStream(inputStream);
            }
        },

        /**
         * Request access to a specific media device.
         *
         * This requests the media device from the browser and, if connected, updates the
         * Vuex state and sets up the device for operation.
         *
         * If a stream is already connected, this function first disconnects it before requesting.
         * the new device.
         *
         * There is some protection from being called twice while already waiting for a device.
         *
         * @param requestedDeviceId the deviceId from the MediaDeviceInfo structure of device to request access
         * @returns {Promise<Nullable<MediaStream>>} the connected media stream or "null" if access refused
         */
        async requestSpecificInputAccess(requestedDeviceId: string): Promise<Nullable<MediaStream>> {
            if (this.$store.state.audio.user.stream) {
                this.stopCurrentInputStream();
            }

            if (this.$store.state.audio.user.awaitingCapturePermissions === true) {
                Log.error(
                    Log.types.AUDIO,
                    `Failed to request specific input device ID ${requestedDeviceId}`
                    + ` due to an already awaiting request for input capture.`
                );
                return null;
            }

            this.setAwaitingCapturePermissions(true);
            Log.info(Log.types.AUDIO, `Requesting specific input device ID ${requestedDeviceId}`);

            try {
                const stream = await navigator.mediaDevices.getUserMedia(
                    { audio: { deviceId: { exact: requestedDeviceId } }, video: false });
                if (stream) {
                    await this.handleRequestInputSuccess(stream);
                    return stream;
                }
            } catch (err) {
                const errr = <MediaError>err;
                this.setAwaitingCapturePermissions(false);
                Log.error(Log.types.AUDIO, `Error getting capture permissions: ${errr.message}`);
            }
            return null;
        },

        /**
         * Stop all audio activities on the stream.
         */
        stopCurrentInputStream(): void {
            if (this.$store.state.audio.user.stream) {
                this.$store.state.audio.user.stream.getTracks().forEach((track) => {
                    track.stop();
                });
            }
            this.revokeCaptureAccess();
        },

        /**
         * Set the state of the audio device to disconnected and unallocated.
         */
        revokeCaptureAccess(): void {
            this.$store.commit(StoreMutations.MUTATE, {
                property: "audio.user",
                with: {
                    connected: false,
                    currentInputDevice: undefined,
                    stream: undefined,
                    hasInputAccess: false
                }
            });
        },

        micToggled: function() {
            if (this.$store.state.audio.user.hasInputAccess === true) {
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
        // eslint-disable-next-line no-void, @typescript-eslint/no-misused-promises
        void this.$nextTick(async () => {
            await this.requestInputAccess();
            return undefined;
        });
        // eslint-disable-next-line no-void
        void this.requestInputsList();
    }
});
</script>
