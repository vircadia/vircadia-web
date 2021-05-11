/*
//  input.js
//
//  Created by Kalila L. on May 11th, 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

export class AudioInput {
    stream = undefined;
    currentInputDevice = undefined;
    hasCapturePermissions = false;
    inputsList = undefined;

    constructor (store, prop) {
        this.handleRequestInputSuccess = (stream) => {
            store.commit('mutate', {
                property: prop,
                update: true,
                with: {
                    stream: stream,
                    hasCapturePermissions: true
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
                    hasCapturePermissions: false
                }
            });
        };

        this.setCurrentInputDevice = (device) => {
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
    }

    requestSpecificInputAccess (requestedDeviceId) {
        if (typeof currentStream !== 'undefined') {
            this.stopCurrentInputStream();
        }

        return navigator.mediaDevices.getUserMedia({ audio: { deviceId: requestedDeviceId }, video: false })
            .then((stream) => this.handleRequestInputSuccess(stream));
    }
}
