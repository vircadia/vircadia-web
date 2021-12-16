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
                                    :icon="$store.state.audio.user.muted ? 'mic_off' : 'mic'"
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

                        <q-separator class="q-my-md" />

                        <div
                            v-if="$store.state.audio.user.hasInputAccess === false"
                            class="text-subtitle1 text-grey text-center"
                        >
                            Please grant mic access to the app in order to speak.
                        </div>

                        <q-list v-else>
                            <div v-for="input in $store.state.audio.inputsList" :key="input.deviceId">
                                <q-radio
                                    @click="requestInputAccess(input.deviceId)"
                                    v-model="selectedInputStore"
                                    :val="input.label"
                                    :label="input.label"
                                    color="teal"
                                />
                            </div>
                        </q-list>
                    </q-tab-panel>

                    <q-tab-panel name="output">
                        <div class=".col-8 row items-center">
                            <span
                                v-if="selectedOutputStore"
                                class="text-subtitle1 items-center"
                            >
                                Using {{ selectedOutputStore }}
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
                            <div v-for="output in $store.state.audio.outputsList" :key="output.deviceId">
                                <q-radio
                                    @click="requestOutputAccess(output.deviceId)"
                                    v-model="selectedOutputStore"
                                    :val="output.label"
                                    :label="output.label"
                                    color="teal"
                                />
                            </div>
                        </q-list>
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

import { Mutations as StoreMutations } from "@Store/index";
import { AudioMgr } from "@Modules/scene/audio";

import Log from "@Modules/debugging/log";
import { toJSON } from "@Modules/debugging";

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
        isListeningToFeedback: false,
        selectedInputDevice: undefined as unknown as MediaDeviceInfo,
        selectedOutputDevice: undefined as unknown as MediaDeviceInfo
    }),

    computed: {
        selectedInputStore: {
            get: function(): string {
                if (this.$store.state.audio.user.currentInputDevice) {
                    return this.$store.state.audio.user.currentInputDevice.label;
                }
                return "None selected";
            },
            set: function(pVal: string): void {
                // @click calls requestInputAccess() which sets $store, etc
                const inputInfo = this.$store.state.audio.inputsList.filter((info) => info.label === pVal);
                if (inputInfo.length === 1) {
                    Log.debug(Log.types.AUDIO, `Audio.vue: set selectedInputStore. inputInfo=${toJSON(inputInfo[0])}`);
                    this.selectedInputDevice = inputInfo[0];
                    return;
                }
                Log.debug(Log.types.AUDIO, `Audio.vue: set selectedInputStore. no device selected`);
            }
        },
        selectedOutputStore: {
            get: function(): string {
                if (this.$store.state.audio.user.currentOutputDevice) {
                    return this.$store.state.audio.user.currentOutputDevice.label;
                }
                return "None selected";
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            set: function(pVal: string): void {
                // @click calls requestOutputAccess() which sets $store, etc
                const outputInfo = this.$store.state.audio.outputsList.filter((info) => info.label === pVal);
                if (outputInfo.length === 1) {
                    Log.debug(Log.types.AUDIO, `Audio.vue: set selectedOutputStore. inputInfo=${toJSON(outputInfo[0])}`);
                    this.selectedOutputDevice = outputInfo[0];
                    return;
                }
                Log.debug(Log.types.AUDIO, `Audio.vue: set selectedOutputStore. no device selected`);
            }
        }
    },

    methods: {
        setAwaitingCapturePermissions(isAwaitingCapturePermissions: boolean): void {
            this.$store.commit(StoreMutations.MUTATE, {
                property: "audio.user.awaitingCapturePermissions",
                value: isAwaitingCapturePermissions
            });
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
        // eslint-disable-next-line @typescript-eslint/require-await
        async requestInputAccess(pRequestedDeviceId?: string): Promise<Nullable<MediaStream>> {
            // If a current stream is active, stop it
            if (this.$store.state.audio.user.userInputStream) {
                this.stopCurrentInputStream();
            }

            // we're either looking for a specific device or any audio device
            const constraint = pRequestedDeviceId
                ? { audio: { deviceId: { exact: pRequestedDeviceId } }, video: false }
                : { audio: true, video: false };

            if (this.$store.state.audio.user.awaitingCapturePermissions === true) {
                Log.error(
                    Log.types.AUDIO,
                    `Failed to request specific input device ID ${pRequestedDeviceId ?? "audio"}`
                    + ` due to an already awaiting request for input capture.`
                );
                return null;
            }

            this.setAwaitingCapturePermissions(true);
            try {
                Log.debug(Log.types.AUDIO, `Audio.vue: requestInputAccess waiting. Constraint=${toJSON(constraint)}`);
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                const stream = await navigator.mediaDevices.getUserMedia(constraint);
                if (stream) {
                    Log.debug(Log.types.AUDIO, `Audio.vue: have stream id=${stream.id}`);

                    // Audio inputs do not have labels if the permission has not been received.
                    // Therefore, we update the list after success.
                    await AudioMgr.getAvailableInputOutputDevices();

                    // Find the MediaDeviceInfo for the input device
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                    await AudioMgr.setUserAudioInputStream(stream, this.selectedInputDevice);

                    this.setAwaitingCapturePermissions(false);
                }
                return stream;
            } catch (err) {
                const errr = <MediaError>err;
                this.setAwaitingCapturePermissions(false);
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                await AudioMgr.setUserAudioInputStream(undefined, undefined);
                Log.error(Log.types.AUDIO, `Error getting capture permissions: ${errr.message}`);
            }
            return null;
        },

        // eslint-disable-next-line @typescript-eslint/require-await,@typescript-eslint/no-unused-vars
        requestOutputAccess(pRequestedDeviceId: string): void {
            if (this.$store.state.audio.user.userInputStream) {
                this.stopCurrentOutputStream();
            }

            AudioMgr.setAudioOutputStream(this.selectedOutputDevice);
        },

        /**
         * Stop all audio activities on the stream.
         */
        stopCurrentInputStream(): void {
            if (this.$store.state.audio.user.userInputStream) {
                this.$store.state.audio.user.userInputStream.getTracks().forEach((track) => {
                    track.stop();
                });
            }
            this.revokeCaptureAccess();
        },

        stopCurrentOutputStream(): void {
            Log.debug(Log.types.AUDIO, `Audio.vue: stopCurrentOutputStream`);
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
                    userInputStream: undefined,
                    hasInputAccess: false
                }
            });
        },

        // Complement the state of the user's audio input device
        micToggled: function() {
            if (this.$store.state.audio.user.hasInputAccess === true) {
                AudioMgr.muteAudio();
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
        },
        setFeedbackPlayerStream(pStream: MediaStream | string | null): void {
            if (this.isListeningToFeedback) {
                // if doing that feedback test thing, link input to the output
                if (this.$refs.audioInputFeedbackPlayer) {
                    if (typeof pStream === "string") {
                        (this.$refs.audioInputFeedbackPlayer as HTMLMediaElement).src = pStream;
                    } else {
                        (this.$refs.audioInputFeedbackPlayer as HTMLMediaElement).srcObject = pStream;
                    }
                }
            }
        }
    },

    // created: function () {
    // },

    // mounted: function(): void {
    // },

    // When the dialog is removed, make sure the audio test feature is off
    unmounted: function(): void {
        this.isListeningToFeedback = false;
        this.setFeedbackPlayerStream(null);
    }
});
</script>
