/*
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

import { DomainMgr } from "@Modules/domain";
import { Domain, ConnectionState } from "@Modules/domain/domain";
import { DomainAudio } from "@Modules/domain/audio";
import { AssignmentClientState } from "@Modules/domain/client";

import { Store, Mutations as StoreMutations } from "@Store/index";
import { Config, USER_AUDIO_INPUT, USER_AUDIO_OUTPUT } from "@Base/config";
import Log from "@Modules/debugging/log";

export type SetAudioOutputCallback = (pStream: Nullable<MediaStream>) => void;

/**
 * Methods for the handling of the scene's audio.
 *
 * The central audio parameters are kept in $store so the UI can see them.
 *
 * There are two ends to the audio system: the user end and the domain-server end:
 *
 * The user end has the selection of the input and output devices which can
 * change at any time. The selection of the input and output devices is done
 * with a UI dialog and saved in $store and in the browser application store.
 * The latter is so the same audio devices will be selected when the application
 * is restarted.
 *
 * The domain-server has stream input and output. These too can change at any time
 * like when teleporting between domains (requiring a disconnect to the user streams
 * and a reconnect of the user streams to the new domain).
 *
 * This routine has the logic that connects the two ends -- when the state of
 * audio at either end changes, these methods are called and this connects or
 * disconnects the connection between the innies and outies.
 */
export const AudioMgr = {

    // Function that sets the MediaStream from the domain to whereever it goes
    _setAudioOutputFunction: undefined as unknown as SetAudioOutputCallback,

    /**
     * Initialize the audio state.
     *
     * This gets any preset values from stored configuration, sets up the input
     * and output.
     */
    // eslint-disable-next-line @typescript-eslint/require-await
    async initialize(pAudioOuter: SetAudioOutputCallback): Promise<void> {
        Log.debug(Log.types.AUDIO, `AudioMgr.initialize()`);
        AudioMgr._setAudioOutputFunction = pAudioOuter;

        // Listen for the domain to connect and disconnect
        // eslint-disable-next-line @typescript-eslint/unbound-method
        DomainMgr.onActiveDomainStateChange.connect(AudioMgr._handleActiveDomainStateChange.bind(this));

        // See if device selection was saved otherwise setup some default audio devices
        const firstStream = await AudioMgr.getAudioInputAccess();

        // If we are granted input access, get the list of available audio devices
        await AudioMgr.getAvailableInputOutputDevices();

        await AudioMgr.setInitialInputAudioDevice(firstStream);
        await AudioMgr.setInitialOutputAudioDevice();
    },

    /**
     * Set audio muting to the passed value or, if nothing passed, complement muting.
     * This sets the muting for the input mic as well as muting the output stream.
     * @param pMute `true` to mute, `false` to unmute. If not supplied, current mute state is complemented.
     * @returns The new mute state.
     */
    muteAudio(pMute?: boolean): boolean {
        const newMute = pMute ?? !Store.state.audio.user.muted;
        // eslint-disable-next-line no-void
        void Store.commit(StoreMutations.MUTATE, {
            property: "audio.user.muted",
            value: newMute
        });
        AudioMgr.setDomainAudioMuted(newMute);
        AudioMgr.setUserAudioMuted(newMute);
        return newMute;
    },

    /**
     * Process the active domain's state changes.
     * When the domain becomes CONNECTED, if we have a user input stream, set that
     * to send to the domain and set the domain's input stream to go to the user's
     * speakers.
     * If the domain is not CONNECTED, see tha all the user devices are disconnected
     * @param {Domain} pDomain the domain who's state is changing
     * @param {ConnectionState} pState the new state
     * @param {string} pInfo some information about the state changed (unused by us)
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _handleActiveDomainStateChange(pDomain: Domain, pState: ConnectionState, pInfo: string): void {
        (async () => {
            if (pState === ConnectionState.CONNECTED) {
                Log.debug(Log.types.AUDIO, `AudioMgr._handleActiveDomainStateChange: CONNECTED`);
                // Domain is connected. Connect the inputs to the outputs
                if (pDomain.AudioClient) {
                    // setup to wait for the audio device to get connected
                    // eslint-disable-next-line @typescript-eslint/unbound-method
                    pDomain.AudioClient.onStateChange.connect(AudioMgr._handleDomainAudioStateChange.bind(this));
                    // but, if already connected, connect the audio end points
                    if (pDomain.AudioClient.clientState === AssignmentClientState.CONNECTED) {
                        await AudioMgr._setupDomainAudio(pDomain);
                    }
                }
            } else {
                Log.debug(Log.types.AUDIO, `AudioMgr._handleActiveDomainStateChange: ${Domain.stateToString(pState)}`);
                if (AudioMgr._setAudioOutputFunction) {
                    AudioMgr._setAudioOutputFunction(undefined);
                }
                // The domain is not connected. If anything is connected, disconnect it
                // TODO:
            }
        })();
    },

    // The audio mixer state changed. If connected, try to connect inputs and outputs.
    _handleDomainAudioStateChange(pDomain: Domain, pAudio: DomainAudio, pState: AssignmentClientState): void {
        (async () => {
            Log.debug(Log.types.AUDIO, `AudioMgr._handleAudioStateChange: ${DomainAudio.stateToString(pState)}`);
            // If the audio state is now connected, let the user hear things
            if (pState === AssignmentClientState.CONNECTED) {
                await AudioMgr._setupDomainAudio(pDomain);
                AudioMgr._restoreMicrophoneMuteState();
            } else {
                // Getting here means the audio connection to the domain is disconnected
                AudioMgr._disconnectInputAndOutputStreams(pDomain);

            }
        })();
    },

    /**
     * Restore the microphone's muted/unmuted state from the store.
     */
    _restoreMicrophoneMuteState(): void {
        AudioMgr.muteAudio(Store.state.audio.user.muted);
    },

    // Utility routine called when DomainAudio is CONNECTED.
    // Copies audio information to Store and, if the user is ready, connects input and output streams.
    async _setupDomainAudio(pDomain: Domain): Promise<void> {
        Log.debug(Log.types.AUDIO, `AudioMgr._setupDomainAudio`);
        const mixer = pDomain.AudioClient?.Mixer;
        if (mixer) {
            await AudioMgr._connectInputStreamsToOutputStreams(pDomain);
            AudioMgr._restoreMicrophoneMuteState();
        }
    },

    // Assuming everything is connected, connect the user's input to the domain and
    // connect the domain's input to the user's output.
    async _connectInputStreamsToOutputStreams(pDomain: Domain): Promise<void> {
        Log.debug(Log.types.AUDIO, `AudioMgr._connectInputAndOutputStreams`);
        if (pDomain.AudioClient && pDomain.AudioClient.Mixer) {
            if (Store.state.audio.user.userInputStream) {
                // The user has an input device. Give it to the domain
                await AudioMgr.setAudioToDomain(Store.state.audio.user.userInputStream);
            } else {
                Log.debug(Log.types.AUDIO, `AudioMgr._connectInputAndOutputStreams. Have mixer but no user mic`);
            }

            // If there is a function to set the output, connect the domain to that output
            if (AudioMgr._setAudioOutputFunction) {
                const aClient = pDomain.AudioClient;
                if (aClient) {
                    const domainStream = aClient.getDomainAudioStream();
                    AudioMgr._setAudioOutputFunction(domainStream);
                } else {
                    // eslint-disable-next-line max-len
                    Log.debug(Log.types.AUDIO, `AudioMgr._connectInputAndOutputStreams. Could not set domain audio because no mixer`);
                }
            } else {
                // eslint-disable-next-line max-len
                Log.debug(Log.types.AUDIO, `AudioMgr._connectInputAndOutputStreams. No output assignment function so no audio output`);
            }
        }
    },

    _disconnectInputAndOutputStreams(pDomain: Domain): void {
        if (pDomain.AudioClient && pDomain.AudioClient.Mixer) {
            pDomain.AudioClient.Mixer.audioInput = null;
            if (AudioMgr._setAudioOutputFunction) {
                AudioMgr._setAudioOutputFunction(undefined);
            }
        }
    },

    /**
     * Set the current user input stream. This is the mic or similar input.
     * This function will update Store as well as inform the domain of the input device.
     * The selection is also stored in the configuration as the active input
     * device for the next session.
     * @param pStream stream for input. Can be 'null' if no input device.
     * @param pDeviceInfo information on the stream
     */
    async setUserAudioInputStream(pStream: Nullable<MediaStream>, pDeviceInfo: Nullable<MediaDeviceInfo>): Promise<void> {
        Store.commit(StoreMutations.MUTATE, {
            property: "audio.user",
            with: {
                connected: Boolean(pStream),
                awaitingCapturePermissions: false,
                hasInputAccess: Boolean(pStream),
                userInputStream: pStream,
                currentInputDevice: pDeviceInfo
            }
        });

        // If there is a stream, set up the muted state
        if (pStream) {
            AudioMgr._restoreMicrophoneMuteState();
        } else {
            AudioMgr.muteAudio(true);
        }

        // Remember the last selected input device for next session
        if (pDeviceInfo) {
            Log.debug(Log.types.AUDIO, `store user AudioInputStream: ${pDeviceInfo.label}`);
            Config.setItem(USER_AUDIO_INPUT, pDeviceInfo.deviceId);
        }

        // If there is a domain, set this stuff into the domain
        await this.setAudioToDomain(pStream);
    },

    /**
     * Assign the passed user input stream (mic) to be sent to the domain.
     * @param pStream stream from user that should go to the domain
     */
    async setAudioToDomain(pStream: Nullable<MediaStream>): Promise<void> {
        if (DomainMgr.ActiveDomain && DomainMgr.ActiveDomain.AudioClient) {
            if (DomainMgr.ActiveDomain.AudioClient.clientState === AssignmentClientState.CONNECTED) {
                const mixer = DomainMgr.ActiveDomain?.AudioClient?.Mixer;
                if (mixer) {
                    mixer.audioInput = pStream as MediaStream | null;
                    AudioMgr.setDomainAudioMuted(mixer.inputMuted);
                    await AudioMgr.setDomainAudioPlayPause(true);
                }
            }
        }
    },

    // Set Play/Pause on domain audio.
    async setDomainAudioPlayPause(pPlay: boolean): Promise<boolean> {
        if (DomainMgr.ActiveDomain && DomainMgr.ActiveDomain.AudioClient) {
            if (DomainMgr.ActiveDomain.AudioClient.clientState === AssignmentClientState.CONNECTED) {
                const mixer = DomainMgr.ActiveDomain.AudioClient.Mixer;
                if (mixer) {
                    if (pPlay) {
                        // eslint-disable-next-line no-void
                        await mixer.play();
                    } else {
                        // eslint-disable-next-line no-void
                        await mixer.pause();
                    }
                    return pPlay;
                }
            }
        }
        return false;
    },

    /**
     * Mute/unmute domain audio.
     * @param pMute 'true' to mute. If 'undefined', complement mute
     * @returns muted state
     */
    setDomainAudioMuted(pMute?: boolean): boolean {
        const newMute = pMute ?? !Store.state.audio.user.muted;
        if (DomainMgr.ActiveDomain && DomainMgr.ActiveDomain.AudioClient) {
            if (DomainMgr.ActiveDomain.AudioClient.clientState === AssignmentClientState.CONNECTED) {
                const mixer = DomainMgr.ActiveDomain.AudioClient.Mixer;
                if (mixer) {
                    mixer.inputMuted = newMute;
                }
            }
        }
        return newMute;
    },

    setUserAudioMuted(pMute?: boolean): boolean {
        const newMute = pMute ?? !Store.state.audio.user.muted;
        Log.debug(Log.types.AUDIO, `AudioMgr.setUserAudioMuted: ${String(newMute)}`);
        // Disable all media tracks.
        const mediaTracks = Store.state.audio.user.userInputStream?.getTracks();
        mediaTracks?.forEach((track) => {
            track.enabled = !newMute;
        });
        return newMute;
    },

    /**
     * Specify the current output device.
     * This will update Store as well as update the domain.
     * The selection is also stored in the configuration as the active input
     * device for the next session.
     * @param pStream stream for input. Can be 'null' if no input device.
     * @param pDeviceInfo information on the stream
     */
    setAudioOutputStream(pDeviceInfo: Nullable<MediaDeviceInfo>): void {
        Store.commit(StoreMutations.MUTATE, {
            property: "audio.user",
            with: {
                currentOutputDevice: pDeviceInfo
            }
        });
        // Remember the last selected input device for next session
        if (pDeviceInfo) {
            Log.debug(Log.types.AUDIO, `store user AudioOutputStream: ${pDeviceInfo.label}`);
            Config.setItem(USER_AUDIO_OUTPUT, pDeviceInfo.deviceId);
        }

        // the output device has changed so set the domain stream to the output device
        const audioClient = DomainMgr.ActiveDomain?.AudioClient;
        if (audioClient) {
            if (audioClient.clientState === AssignmentClientState.CONNECTED) {
                const domainStream = audioClient.getDomainAudioStream();
                Log.debug(Log.types.AUDIO, `AudioMgr.setAudioOutputStream: setting output. ${typeof domainStream}`);
                if (AudioMgr._setAudioOutputFunction) {
                    AudioMgr._setAudioOutputFunction(domainStream);
                }
            }
        }
    },

    /**
     * Return the stream associated with the passed MediaDeviceInfo block.
     * If we don't have access to the devices, null is returned
     * @param pDInfo MediaDeviceInfo block for the device we want the stream of
     * @returns the stream or 'null' if the stream couldn't be fetched
     */
    async getStreamForDeviceInfo(pDInfo: MediaDeviceInfo): Promise<Nullable<MediaStream>> {
        const constraint = { audio: { deviceId: { exact: pDInfo.deviceId } }, video: false };
        const stream = await navigator.mediaDevices.getUserMedia(constraint);
        return stream;
    },

    /**
     * Return the MediaDeviceInfo block for the passed stream.
     * @param pStream the stream to return the MediaDeviceInfo for
     * @returns the MediaDeviceInfo for the passed stream or 'undefined' if none found
     */
    async getDeviceInfoForStream(pStream: MediaStream): Promise<Nullable<MediaDeviceInfo>> {
        // Get all the deviceId's used by the stream
        const devicesUsedByStream = pStream.getTracks().map((t) => t.getSettings().deviceId);
        // Get a list of all the known devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        // Extract the device info blocks that contain deviceId's used by the stream
        const devInfo = devices.filter((d) => devicesUsedByStream.includes(d.deviceId));
        if (devInfo.length > 0) {
            // Found a matching devices so use the first (and probably only) device
            Log.debug(Log.types.AUDIO, `AudioMgr.getDeviceInfoForStream: returning ${devInfo[0].label}`);
            return devInfo[0];
        }
        Log.debug(Log.types.AUDIO, `AudioMgr.getDeviceInfoForStream: no device info found`);
        return undefined;
    },

    // INITIALIZATION ==============================================================

    // Ask the system for the available IO devices and put in UI information
    async getAvailableInputOutputDevices(): Promise<void> {
        Log.debug(Log.types.AUDIO, `AudioMgr.getAvailableInputOutputDevices`);
        let inputsList: MediaDeviceInfo[] = [];
        let outputsList: MediaDeviceInfo[] = [];
        if (navigator.mediaDevices) {
            const devices = await navigator.mediaDevices.enumerateDevices();
            inputsList = devices.filter((d) => d.kind === "audioinput");
            Log.debug(Log.types.AUDIO, `AudioMgr: getAvailableInputOutputDevices. input count=${inputsList.length}`);
            outputsList = devices.filter((d) => d.kind === "audiooutput");
            Log.debug(Log.types.AUDIO, `AudioMgr: getAvailableInputOutputDevices. output count=${outputsList.length}`);
        }
        // Update the information the UI sees
        Store.commit(StoreMutations.MUTATE, {
            property: "audio",
            with: {
                inputsList,
                outputsList
            }
        });
    },

    /**
     * Ask the browser for access to the input devices.
     * This also checks if a default device has been selected previously and it tries to
     * select that device.
     * This routine will hang in the Promise waiting for the user to grant audio access.
     * @returns a mediaStream as the user's audio input device
     */
    async getAudioInputAccess(): Promise<MediaStream> {
        let inputStream = undefined as unknown as MediaStream;
        if (navigator.mediaDevices) {
            try {
                const lastSessionInput = Config.getItem(USER_AUDIO_INPUT, "none");
                const constraint = lastSessionInput === "none"
                    ? { video: false, audio: true }
                    : { audio: { deviceId: { exact: lastSessionInput } }, video: false };
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                inputStream = await navigator.mediaDevices.getUserMedia(constraint);
                Log.debug(Log.types.AUDIO, `AudioMgr.getAudioInputAccess: have user input stream`);
                // If we get access, say we're connected
                // eslint-disable-next-line no-void
                void Store.commit(StoreMutations.MUTATE, {
                    property: "audio.user.hasInputAccess",
                    value: true
                });
            } catch (e) {
                Log.error(Log.types.AUDIO, `EXCEPTION getting audio device access`);
            }
        }
        return inputStream;
    },

    /**
     * Set the initial input device.
     * Selects the first input device unless a stream is passed. If a stream
     * is supplied in the call, this attempts to select that device.
     * @param {MediaStream} pInitial an optional stream to prefer when selecting input device
     */
    async setInitialInputAudioDevice(pInitial?: MediaStream): Promise<void> {
        Log.debug(Log.types.AUDIO, `AudioMgr.setInitialInputAudioDevice`);
        try {
            Log.debug(Log.types.AUDIO, `AudioMgr: set inital Input audio device`);
            if (pInitial) {
                await AudioMgr.setUserAudioInputStream(pInitial, await AudioMgr.getDeviceInfoForStream(pInitial));
            } else if (Store.state.audio.inputsList.length > 0) {
                const firstInput = Store.state.audio.inputsList[0];
                await AudioMgr.setUserAudioInputStream(await AudioMgr.getStreamForDeviceInfo(firstInput), firstInput);
            }
        } catch (e) {
            const err = e as Error;
            Log.error(Log.types.AUDIO, `Exception setting initial audio device: ${err.message}`);
            await AudioMgr.setUserAudioInputStream(undefined, undefined);
        }
    },

    // eslint-disable-next-line @typescript-eslint/require-await
    async setInitialOutputAudioDevice(): Promise<void> {
        Log.debug(Log.types.AUDIO, `AudioMgr.setInitialOutputAudioDevice`);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const lastSessionOutput = Config.getItem(USER_AUDIO_OUTPUT, "none");
        try {
            if (lastSessionOutput === "none") {
                Log.debug(Log.types.AUDIO, `AudioMgr: set inital output audio device`);
                if (Store.state.audio.outputsList.length > 0) {
                    const firstOutput = Store.state.audio.outputsList[0];
                    AudioMgr.setAudioOutputStream(firstOutput);
                } else {
                    // Some browsers don't have output selection so say none selected
                    AudioMgr.setAudioOutputStream(undefined);
                }
            } else {
                // The user is specifying a device. Reselect that one.
                const userDev = Store.state.audio.outputsList.filter((ii) => ii.deviceId === lastSessionOutput);
                if (userDev.length > 0) {
                    Log.debug(Log.types.AUDIO, `AudioMgr: Found output audio device from last session`);
                    // Found the output device from last session.
                    const devInfo = userDev[0];
                    AudioMgr.setAudioOutputStream(devInfo);
                } else {
                    // The device is not found from last session. Default to first one
                    Log.debug(Log.types.AUDIO, `AudioMgr: Did not found output audio device from last session`);
                    const firstOutput = Store.state.audio.outputsList[0];
                    AudioMgr.setAudioOutputStream(firstOutput);
                }
            }
        } catch (e) {
            AudioMgr.setAudioOutputStream(undefined);
        }
    }

};
