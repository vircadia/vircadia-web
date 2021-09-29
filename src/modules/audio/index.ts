/*
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

import { Store, Mutations } from "@Store/index";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Config } from "@Base/config";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Log from "@Modules/debugging/log";

export const Audio = {
    _inputsList: new Array<MediaDeviceInfo>(),

    _awaitingCapturePermissions: false,
    _hasInputAccess: false,

    _stream: <Nullable<MediaStream>><unknown>undefined,

    _currentInputDevice: <Nullable<MediaDeviceInfo>><unknown>undefined,

    setAwaitingCapturePermissions(isAwaitingCapturePermissions: boolean): void {
        Audio._awaitingCapturePermissions = isAwaitingCapturePermissions;
        Store.commit(Mutations.MUTATE, {
            property: "audio.awaitingCapturePermissions",
            value: isAwaitingCapturePermissions
        });
    },

    setCurrentInputDevice(pDeviceInfo: MediaDeviceInfo): void {
        Log.info(Log.types.AUDIO, `Successfully set input device ${pDeviceInfo.label}`);
        Audio._currentInputDevice = pDeviceInfo;

        Store.commit(Mutations.MUTATE, {
            property: "audio.currentInputDevice",
            value: pDeviceInfo
        });
    },

    async matchDeviceWithInputsList(tracks: MediaStreamTrack[]): Promise<void> {
        // Audio inputs do not have labels if the permission has not been received.
        // Therefore, we update the list after success.
        const inputsList = await Audio.requestInputsList();

        for (let i = 0; i < tracks.length; i++) {
            inputsList.forEach((device) => {
                if (device.deviceId === tracks[i].getSettings().deviceId) {
                    Audio.setCurrentInputDevice(device);
                }
            });
        }
    },

    /**
     * Fetch, save, and return the list of media devices of the specified kind.
     * Fetches "audioinput" devices if no alternative specified.
     *
     * @returns {Promise<MediaDeviceInfo>[]} list of "audioinput" media devices
     */
    async requestInputsList(pKind = "audioinput"): Promise<MediaDeviceInfo[]> {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const inputsList = devices.filter((d) => d.kind === pKind);
        Audio.saveInputsList(inputsList);
        return inputsList;
    },

    /**
     * Set the list of known audio input devices. This remembers the list locally and
     * also updates the Vuex store with the new information.
     *
     * @param {MediaDeviceInfo[]} pAudioInputs The list of audioinput devices to remember
     */
    saveInputsList(pAudioInputs: MediaDeviceInfo[]): void {
        Audio._inputsList = pAudioInputs;

        Store.commit(Mutations.MUTATE, {
            property: "audio.inputsList",
            value: pAudioInputs
        });
    },

    async requestInputAccess(): Promise<Nullable<MediaStream>> {
        if (Audio._stream) {
            return Audio._stream;
        }
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        if (stream) {
            await Audio.handleRequestInputSuccess(stream);
            return Audio._stream;
        }
        return null;
    },

    /**
     * Stop all audio activities on the stream.
     */
    stopCurrentInputStream(): void {
        if (Audio._stream) {
            Audio._stream.getTracks().forEach((track) => {
                track.stop();
            });
        }
        Audio.revokeCaptureAccess();
    },

    /**
     * Set the state of the audio device to disconnected and unallocated.
     */
    revokeCaptureAccess(): void {
        Audio._hasInputAccess = false;
        Audio._currentInputDevice = <MediaDeviceInfo><unknown>undefined;
        Audio._stream = undefined;

        Store.commit(Mutations.MUTATE, {
            property: "audio",
            with: {
                connected: false,
                currentInputDevice: "UNKNOWN",
                hasInputAccess: false
            }
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
    async requestSpecificInputAccess(requestedDeviceId: string): Promise<Nullable<MediaStream>> {
        if (Audio._stream) {
            Audio.stopCurrentInputStream();
        }

        if (Audio._awaitingCapturePermissions === true) {
            Log.error(
                Log.types.AUDIO,
                `Failed to request specific input device ID ${requestedDeviceId}`
                 + ` due to an already awaiting request for input capture.`
            );
            return null;
        }

        Audio.setAwaitingCapturePermissions(true);
        Log.info(Log.types.AUDIO, `Requesting specific input device ID ${requestedDeviceId}`);

        try {
            const stream = await navigator.mediaDevices.getUserMedia(
                { audio: { deviceId: { exact: requestedDeviceId } }, video: false });
            if (stream) {
                await Audio.handleRequestInputSuccess(stream);
                return stream;
            }
        } catch (err) {
            const errr = <MediaError>err;
            Audio.setAwaitingCapturePermissions(false);
            Log.error(Log.types.AUDIO, `Error getting capture permissions: ${errr.message}`);
        }
        return null;
    },

    /** Request for access to MediaStream is a success so set up the connection.
     *
     * This remembers the stream locally and also updates the Vuex state with
     * connection information.
     *
     * @param {MediaStream} pStream the stream we have access to
     * @returns {Promise<MediaStream>} the stream that was passed in
     */
    async handleRequestInputSuccess(pStream: MediaStream): Promise<MediaStream> {
        Log.info(Log.types.AUDIO, "Processing successful input device request.");

        Audio._stream = pStream;

        Store.commit(Mutations.MUTATE, {
            property: "audio",
            with: {
                connected: true,
                awaitingCapturePermissions: false,
                hasInputAccess: true
            }
        });

        await Audio.matchDeviceWithInputsList(Audio._stream.getTracks());

        return Audio._stream;
    }

};
