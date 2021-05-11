/*
//  input.js
//
//  Created by Kalila L. on May 11th, 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

import Log from '../../debugging/log.js';

export class AudioInput {
    inputsList = undefined;

    awaitingCapturePermissions = false;
    hasInputAccess = false;

    stream = undefined;
    currentInputDevice = undefined;
    muted = false;

    constructor (store, prop) {
        this.handleRequestInputSuccess = (stream) => {
            Log.print('AUDIO', 'INFO', 'Processing successful input device request.');

            store.commit('mutate', {
                property: prop,
                update: true,
                with: {
                    stream: stream,
                    awaitingCapturePermissions: false,
                    hasInputAccess: true
                }
            });

            this.matchDeviceWithInputsList(stream.getTracks());

            return stream;
        };

        this.saveInputsList = (audioInputsList) => {
            store.commit('mutate', {
                property: prop,
                update: true,
                with: {
                    inputsList: audioInputsList
                }
            });
        };

        this.revokeCaptureAccess = function () {
            store.commit('mutate', {
                property: prop,
                update: true,
                with: {
                    stream: undefined,
                    currentInputDevice: undefined,
                    hasInputAccess: false
                }
            });
        };

        this.setAwaitingCapturePermissions = (isAwaitingCapturePermissions) => {
            store.commit('mutate', {
                property: prop,
                update: true,
                with: {
                    awaitingCapturePermissions: isAwaitingCapturePermissions
                }
            });
        };

        this.setCurrentInputDevice = (device) => {
            Log.print('AUDIO', 'INFO', 'Successfully set input device', device.label);

            store.commit('mutate', {
                property: prop,
                update: true,
                with: {
                    currentInputDevice: device
                }
            });
        };
    }

    async matchDeviceWithInputsList (tracks) {
        const _this = this;
        // Audio inputs do not have labels if the permission has not been received.
        // Therefore, we update the list after success.
        const inputsList = await this.requestInputsList();

        for (let i = 0; i < tracks.length; i++) {
            inputsList.forEach(function (device) {
                if (device.deviceId === tracks[i].getSettings().deviceId) {
                    _this.setCurrentInputDevice(device);
                }
            });
        }
    }

    async requestInputsList () {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const inputsList = devices.filter((d) => d.kind === 'audioinput');
        this.saveInputsList(inputsList);
        return inputsList;
    }

    requestInputAccess () {
        if (this.stream !== undefined) {
            return Promise.resolve(this.stream);
        } else {
            return navigator.mediaDevices.getUserMedia({ audio: true, video: false })
                .then((stream) => this.handleRequestInputSuccess(stream));
        }
    }

    stopCurrentInputStream () {
        this.stream.getTracks().forEach(track => {
            track.stop();
        });

        this.revokeCaptureAccess();
    }

    requestSpecificInputAccess (requestedDeviceId) {
        if (typeof this.stream !== 'undefined') {
            this.stopCurrentInputStream();
        }

        if (this.awaitingCapturePermissions === true) {
            Log.print(
                'AUDIO', 'ERROR', 'Failed to request specific input device ID', requestedDeviceId,
                'due to an already awaiting request for input capture.'
            );

            return false;
        } else {
            this.setAwaitingCapturePermissions(true);
        }

        Log.print('AUDIO', 'INFO', 'Requesting specific input device ID', requestedDeviceId);

        return navigator.mediaDevices.getUserMedia({ audio: { deviceId: { exact: requestedDeviceId } }, video: false })
            .then((stream) => this.handleRequestInputSuccess(stream))
            .catch((error) => {
                this.setAwaitingCapturePermissions(false);
                Log.print('AUDIO', 'ERROR', error);
            });
    }
}
