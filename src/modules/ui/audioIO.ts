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

import { ref } from "vue";
import { applicationStore } from "@Stores/index";
import { AudioManager } from "@Modules/scene/audio";
import Log, { findErrorMessage } from "@Modules/debugging/log";
import { toJSON } from "@Modules/debugging";

export class AudioIO {
    private static _selectedInputDevice = applicationStore.audio.user.currentInputDevice as MediaDeviceInfo | undefined;
    private static _selectedOutputDevice = applicationStore.audio.user.currentOutputDevice as MediaDeviceInfo | undefined;
    private static _inputLevelContext = {
        context: new AudioContext(),
        analyser: {} as AnalyserNode,
        microphone: {} as MediaStreamAudioSourceNode,
        scriptProcessor: {} as ScriptProcessorNode
    };

    /**
     * The level (volume) of the audio stream from the selected input device. Ranges from `0` to `100`.
     */
    public static inputLevel = ref(0);

    /**
     * The selected audio input device.
     */
    static get selectedInput(): string {
        return applicationStore.audio.user.currentInputDevice?.label ?? this._selectedInputDevice?.label ?? "None selected";
    }

    /**
     * The selected audio input device.
     */
    static set selectedInput(device: string) {
        const inputInfo = applicationStore.audio.inputsList.filter((info) => info.label === device);
        if (inputInfo.length !== 1) {
            Log.debug(Log.types.AUDIO, `AudioIO: Set the selected input device to: No device selected.`);
            return;
        }
        Log.debug(Log.types.AUDIO, `AudioIO: Set the selected input device to: ${toJSON(inputInfo[0])}.`);
        this._selectedInputDevice = inputInfo[0];
        applicationStore.audio.user.currentInputDevice = this._selectedInputDevice;
        this._createInputLevelContext();
    }

    /**
     * The selected audio output device.
     */
    static get selectedOutput(): string {
        return applicationStore.audio.user.currentOutputDevice?.label ?? this._selectedOutputDevice?.label ?? "None selected";
    }

    /**
     * The selected audio output device.
     */
    static set selectedOutput(device: string) {
        const outputInfo = applicationStore.audio.outputsList.filter((info) => info.label === device);
        if (outputInfo.length !== 1) {
            Log.debug(Log.types.AUDIO, `AudioIO: Set the selected output device to: No device selected.`);
            return;
        }
        Log.debug(Log.types.AUDIO, `AudioIO: Set the selected output device to: ${toJSON(outputInfo[0])}.`);
        this._selectedOutputDevice = outputInfo[0];
        applicationStore.audio.user.currentOutputDevice = this._selectedOutputDevice;
    }

    /**
     * Create the audio context and connections necessary for reading the level from the selected input device.
     */
    private static _createInputLevelContext(): void {
        if (!applicationStore.audio.user.userInputStream || !(applicationStore.audio.user.userInputStream instanceof MediaStream)) {
            return;
        }
        this._inputLevelContext.context = new AudioContext();
        this._inputLevelContext.analyser = this._inputLevelContext.context.createAnalyser();
        this._inputLevelContext.analyser.smoothingTimeConstant = 0.5;
        this._inputLevelContext.analyser.fftSize = 1024;
        this._inputLevelContext.microphone = this._inputLevelContext.context.createMediaStreamSource(applicationStore.audio.user.userInputStream);
        const bufferSize = 2048;
        this._inputLevelContext.scriptProcessor = this._inputLevelContext.context.createScriptProcessor(bufferSize, 1, 1);

        this._inputLevelContext.microphone.connect(this._inputLevelContext.analyser);
        this._inputLevelContext.analyser.connect(this._inputLevelContext.scriptProcessor);
        this._inputLevelContext.scriptProcessor.connect(this._inputLevelContext.context.destination);
        // TODO: Refactor this module to use an AudioWorkletProcessor instead of the ScriptProcessorNode.
        this._inputLevelContext.scriptProcessor.onaudioprocess = () => {
            const array = new Uint8Array(this._inputLevelContext.analyser.frequencyBinCount);
            this._inputLevelContext.analyser.getByteFrequencyData(array);
            const arraySum = array.reduce((a, value) => a + value, 0);
            const average = arraySum / (array.length / 2);
            this.inputLevel.value = Math.round(average);
        };

        Log.debug(Log.types.AUDIO, `AudioIO: Created input level context.`);
    }

    /**
     * Update the Store to show that the application is/isn't waiting for permission to use the audio input.
     * @param isAwaitingCapturePermissions
     */
    public static setAwaitingCapturePermissions(isAwaitingCapturePermissions: boolean): void {
        applicationStore.audio.user.awaitingCapturePermissions = isAwaitingCapturePermissions;
    }

    /**
     * Set the state of the audio device to disconnected and unallocated.
     */
    public static revokeCaptureAccess(): void {
        applicationStore.audio.user.connected = false;
        applicationStore.audio.user.currentInputDevice = undefined;
        applicationStore.audio.user.userInputStream = undefined;
        applicationStore.audio.user.hasInputAccess = false;
    }

    /**
     * Stop all audio activities on the stream.
     */
    public static stopCurrentInputStream(): void {
        if (applicationStore.audio.user.userInputStream) {
            applicationStore.audio.user.userInputStream.getTracks().forEach((track) => {
                track.stop();
            });
        }
        this.revokeCaptureAccess();
    }

    /**
     * Request access to a specific media input device.
     *
     * This requests the specified media device from the browser, and if successful, sets up the device for operation.
     *
     * If a stream is already connected, this function first disconnects it before requesting the new device.
     *
     * There is some protection from being called twice while already waiting for a device.
     *
     * @param requestedDeviceId `(Optional)` The ID of the media device to request access to.
     * If none is provided, the first available audio device is requested.
     * @returns A reference to the connected media stream, or `null` if access is refused.
     */
    public static async requestInputAccess(requestedDeviceId?: string): Promise<Nullable<MediaStream>> {
        // If a stream is currently active, stop it.
        if (applicationStore.audio.user.userInputStream) {
            this.stopCurrentInputStream();
        }

        // We're either looking for a specific device or any audio device.
        const constraint = requestedDeviceId
            ? { audio: { deviceId: { exact: requestedDeviceId } }, video: false }
            : { audio: true, video: false };

        if (applicationStore.audio.user.awaitingCapturePermissions) {
            Log.debug(Log.types.AUDIO, "AudioIO: An input device request is already pending.");
            return null;
        }

        this.setAwaitingCapturePermissions(true);
        try {
            Log.debug(Log.types.AUDIO, `AudioIO: Waiting for access to input device with constraint: ${toJSON(constraint)}`);
            const stream = await navigator.mediaDevices.getUserMedia(constraint);
            if (stream) {
                Log.debug(Log.types.AUDIO, `AudioIO: Access granted for stream: ${stream.id}.`);

                // Audio inputs do not have labels if the permission has not been received.
                // Therefore, we need to update the list after success.
                await AudioManager.getAvailableInputOutputDevices();

                // Find the MediaDeviceInfo for the input device.
                await AudioManager.setUserAudioInputStream(stream, this._selectedInputDevice);

                this._createInputLevelContext();

                this.setAwaitingCapturePermissions(false);
            }
            return stream;
        } catch (error) {
            this.setAwaitingCapturePermissions(false);
            await AudioManager.setUserAudioInputStream(undefined, undefined);
            Log.error(Log.types.AUDIO, `Error getting capture permissions: ${findErrorMessage(error)}`);
        }
        return null;
    }

    /**
     * Request access to a specific media output device.
     *
     * @param requestedDeviceId The ID of the media device to request access to.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public static requestOutputAccess(requestedDeviceId: string): void {
        AudioManager.setAudioOutputStream(this._selectedOutputDevice);
    }

    static {
        this._createInputLevelContext();
    }
}
