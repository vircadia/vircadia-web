//
//  audioIO.ts
//
//  Created by Giga & Kalila L. on 1 Nov 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { useApplicationStore } from "@Stores/application-store";
import { AudioMgr } from "@Modules/scene/audio";

import Log from "@Modules/debugging/log";
import { toJSON } from "@Modules/debugging";

type Nullable<T> = T | null | undefined;

const applicationStore = useApplicationStore();

export class AudioIO {
    $selectedInputDevice = applicationStore.audio.user.currentInputDevice as MediaDeviceInfo | undefined;
    $selectedOutputDevice = applicationStore.audio.user.currentOutputDevice as MediaDeviceInfo | undefined;
    $audioContext = new AudioContext();
    $analyser = {} as AnalyserNode;
    $microphone = {} as MediaStreamAudioSourceNode;
    $scriptProcessor = {} as ScriptProcessorNode;
    $inputLevel = 0;
    $analysisContextIsSetup = false;

    constructor() {
        this.$createAudioAnalysisContext();
    }

    get selectedInput(): string {
        return applicationStore.audio.user.currentInputDevice?.label ?? this.$selectedInputDevice?.label ?? "None selected";
    }

    set selectedInput(device: string) {
        const inputInfo = applicationStore.audio.inputsList.filter((info) => info.label === device);
        if (inputInfo.length === 1) {
            Log.debug(Log.types.AUDIO, `AudioIO: set selectedInputStore. inputInfo=${toJSON(inputInfo[0])}`);
            this.$selectedInputDevice = inputInfo[0];
            applicationStore.audio.user.currentInputDevice = this.$selectedInputDevice;
            return;
        }
        Log.debug(Log.types.AUDIO, `AudioIO: set selectedInputStore. no device selected`);
    }

    get selectedOutput(): string {
        return applicationStore.audio.user.currentOutputDevice?.label ?? this.$selectedOutputDevice?.label ?? "None selected";
    }

    set selectedOutput(device: string) {
        const outputInfo = applicationStore.audio.outputsList.filter((info) => info.label === device);
        if (outputInfo.length === 1) {
            Log.debug(Log.types.AUDIO, `AudioIO: set selectedOutputStore. inputInfo=${toJSON(outputInfo[0])}`);
            this.$selectedOutputDevice = outputInfo[0];
            applicationStore.audio.user.currentOutputDevice = this.$selectedOutputDevice;
            return;
        }
        Log.debug(Log.types.AUDIO, `AudioIO: set selectedOutputStore. no device selected`);
    }

    get inputLevel(): number {
        if (!this.$analysisContextIsSetup) {
            this.$createAudioAnalysisContext();
        }
        return this.$inputLevel;
    }

    $createAudioAnalysisContext(): void {
        if (!applicationStore.audio.user.userInputStream || !(applicationStore.audio.user.userInputStream instanceof MediaStream)) {
            return;
        }
        this.$audioContext = new AudioContext();
        this.$analyser = this.$audioContext.createAnalyser();
        this.$analyser.smoothingTimeConstant = 0.5;
        this.$analyser.fftSize = 1024;
        this.$microphone = this.$audioContext.createMediaStreamSource(applicationStore.audio.user.userInputStream);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        this.$scriptProcessor = this.$audioContext.createScriptProcessor(2048, 1, 1);

        this.$microphone.connect(this.$analyser);
        this.$analyser.connect(this.$scriptProcessor);
        this.$scriptProcessor.connect(this.$audioContext.destination);
        this.$scriptProcessor.onaudioprocess = () => {
            const array = new Uint8Array(this.$analyser.frequencyBinCount);
            this.$analyser.getByteFrequencyData(array);
            const arraySum = array.reduce((a, value) => a + value, 0);
            const average = arraySum / (array.length / 2);
            this.$inputLevel = Math.round(average);
        };

        this.$analysisContextIsSetup = true;

        Log.debug(Log.types.AUDIO, `AudioIO: created audio analysis context.`);
    }

    static setAwaitingCapturePermissions(isAwaitingCapturePermissions: boolean): void {
        applicationStore.audio.user.awaitingCapturePermissions = isAwaitingCapturePermissions;
    }

    /**
     * Set the state of the audio device to disconnected and unallocated.
     */
    static revokeCaptureAccess(): void {
        applicationStore.audio.user.connected = false;
        applicationStore.audio.user.currentInputDevice = undefined;
        applicationStore.audio.user.userInputStream = undefined;
        applicationStore.audio.user.hasInputAccess = false;
    }

    /**
     * Stop all audio activities on the stream.
     */
    static stopCurrentInputStream(): void {
        if (applicationStore.audio.user.userInputStream) {
            applicationStore.audio.user.userInputStream.getTracks().forEach((track) => {
                track.stop();
            });
        }
        AudioIO.revokeCaptureAccess();
    }

    static stopCurrentOutputStream(): void {
        Log.debug(Log.types.AUDIO, `AudioIO: stopCurrentOutputStream`);
    }

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
    async requestInputAccess(pRequestedDeviceId?: string): Promise<Nullable<MediaStream>> {
        // If a stream is currently active, stop it.
        if (applicationStore.audio.user.userInputStream) {
            AudioIO.stopCurrentInputStream();
        }

        // We're either looking for a specific device or any audio device.
        const constraint = pRequestedDeviceId
            ? { audio: { deviceId: { exact: pRequestedDeviceId } }, video: false }
            : { audio: true, video: false };

        if (applicationStore.audio.user.awaitingCapturePermissions === true) {
            Log.error(
                Log.types.AUDIO,
                `Failed to request specific input device ID ${pRequestedDeviceId ?? "audio"}`
                + ` due to an already awaiting request for input capture.`
            );
            return null;
        }

        AudioIO.setAwaitingCapturePermissions(true);
        try {
            Log.debug(Log.types.AUDIO, `AudioIO: requestInputAccess waiting. Constraint=${toJSON(constraint)}`);
            const stream = await navigator.mediaDevices.getUserMedia(constraint);
            if (stream) {
                Log.debug(Log.types.AUDIO, `AudioIO: have stream id=${stream.id}`);

                // Audio inputs do not have labels if the permission has not been received.
                // Therefore, we update the list after success.
                await AudioMgr.getAvailableInputOutputDevices();

                // Find the MediaDeviceInfo for the input device.
                await AudioMgr.setUserAudioInputStream(stream, this.$selectedInputDevice);

                this.$createAudioAnalysisContext();

                AudioIO.setAwaitingCapturePermissions(false);
            }
            return stream;
        } catch (err) {
            const errr = <MediaError>err;
            AudioIO.setAwaitingCapturePermissions(false);
            await AudioMgr.setUserAudioInputStream(undefined, undefined);
            Log.error(Log.types.AUDIO, `Error getting capture permissions: ${errr.message}`);
        }
        return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    requestOutputAccess(pRequestedDeviceId: string): void {
        if (applicationStore.audio.user.userInputStream) {
            AudioIO.stopCurrentOutputStream();
        }

        AudioMgr.setAudioOutputStream(this.$selectedOutputDevice);
    }
}
