//
//  audio.ts
//
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { DomainManager } from "@Modules/domain";
import { AssignmentClientState } from "@Modules/domain/client";
import { ConnectionState, Domain } from "@Modules/domain/domain";
import { DomainAudioClient } from "@Modules/domain/audio";
import { applicationStore } from "@Stores/index";
import { Config, USER_AUDIO_INPUT, USER_AUDIO_OUTPUT } from "@Base/config";
import { Notify } from "quasar";
import Log from "@Modules/debugging/log";

export type SetAudioOutputCallback = (pStream: Nullable<MediaStream>) => void;

/**
 * Static methods for the handling of the scene's audio.
 *
 * The central audio parameters are kept in the Store so the UI can see them.
 *
 * There are two ends to the audio system: the user end and the domain-server end:
 *
 * The user end has the selection of the input and output devices which can
 * change at any time. The selection of the input and output devices is done
 * with a UI dialog and saved in the Store and in the browser application store.
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
export class AudioManager {

    // Function that sets the MediaStream from the domain to wherever it goes
    private static _setAudioOutputFunction: Nullable<SetAudioOutputCallback> = undefined;

    /**
     * Initialize the audio state.
     *
     * This gets any preset values from stored configuration, sets up the input and output.
     */
    public static async initialize(pAudioOuter: SetAudioOutputCallback): Promise<void> {
        Log.debug(Log.types.AUDIO, `AudioManager.initialize()`);
        this._setAudioOutputFunction = pAudioOuter;

        // Listen for the domain to connect and disconnect
        DomainManager.onActiveDomainStateChange.connect(this._handleActiveDomainStateChange.bind(this));

        // See if device selection was saved otherwise setup some default audio devices
        const firstStream = await this.getAudioInputAccess();

        // If we are granted input access, get the list of available audio devices
        await this.getAvailableInputOutputDevices();

        await this.setInitialInputAudioDevice(firstStream);
        await this.setInitialOutputAudioDevice();
    }

    /**
     * Set audio muting to the passed value or, if nothing passed, complement muting.
     * This sets the muting for the input mic as well as muting the output stream.
     * @param mute `true` to mute, `false` to unmute. If not supplied, the current mute state is complemented.
     * @returns The new mute state.
     */
    public static muteAudio(mute?: boolean): boolean {
        const newMute = mute ?? !applicationStore.audio.user.muted;
        applicationStore.audio.user.muted = newMute;
        this.setDomainAudioMuted(newMute);
        this.setUserAudioMuted(newMute);
        return newMute;
    }

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
    private static _handleActiveDomainStateChange(pDomain: Domain, pState: ConnectionState, pInfo: string): void {
        (async () => {
            if (pState === ConnectionState.CONNECTED) {
                Log.debug(Log.types.AUDIO, `AudioManager._handleActiveDomainStateChange: CONNECTED`);
                // Domain is connected. Connect the inputs to the outputs
                // Setup to wait for the audio device to get connected
                pDomain.AudioClient?.onStateChange.connect(this._handleDomainAudioStateChange.bind(this));
                // but, if already connected, connect the audio end points
                if (pDomain.AudioClient?.clientState === AssignmentClientState.CONNECTED) {
                    await this._setupDomainAudio(pDomain);
                }
            } else {
                Log.debug(Log.types.AUDIO, `AudioManager._handleActiveDomainStateChange: ${Domain.stateToString(pState)}`);
                this._setAudioOutputFunction?.(undefined);
                // The domain is not connected. If anything is connected, disconnect it
                // TODO:
            }
        })();
    }

    // The audio mixer state changed. If connected, try to connect inputs and outputs.
    private static _handleDomainAudioStateChange(pDomain: Domain, pAudio: DomainAudioClient, pState: AssignmentClientState): void {
        (async () => {
            Log.debug(Log.types.AUDIO, `AudioManager._handleAudioStateChange: ${DomainAudioClient.stateToString(pState)}`);
            // If the audio state is now connected, let the user hear things
            if (pState === AssignmentClientState.CONNECTED) {
                await this._setupDomainAudio(pDomain);
                this._restoreMicrophoneMuteState();
            } else {
                // Getting here means the audio connection to the domain is disconnected
                this._disconnectInputAndOutputStreams(pDomain);

            }
        })();
    }

    /**
     * Restore the microphone's muted/unmuted state from the store.
     */
    private static _restoreMicrophoneMuteState(): void {
        AudioManager.muteAudio(applicationStore.audio.user.muted);
    }

    // Utility routine called when DomainAudio is CONNECTED.
    // Copies audio information to Store and, if the user is ready, connects input and output streams.
    private static async _setupDomainAudio(pDomain: Domain): Promise<void> {
        Log.debug(Log.types.AUDIO, `AudioManager._setupDomainAudio`);
        const mixer = pDomain.AudioClient?.Mixer;
        if (mixer) {
            await AudioManager._connectInputStreamsToOutputStreams(pDomain);
            AudioManager._restoreMicrophoneMuteState();
            // Listen to mute requests from the domain.
            mixer.mutedByMixer.connect(() => {
                AudioManager.muteAudio(true);
                Notify.create({
                    type: "negative",
                    textColor: "white",
                    icon: "information",
                    message: "You have been muted by an admin."
                });
            });
        }
    }

    // Assuming everything is connected, connect the user's input to the domain and
    // connect the domain's input to the user's output.
    private static async _connectInputStreamsToOutputStreams(pDomain: Domain): Promise<void> {
        Log.debug(Log.types.AUDIO, `AudioManager._connectInputAndOutputStreams`);
        if (pDomain.AudioClient && pDomain.AudioClient.Mixer) {
            if (applicationStore.audio.user.userInputStream) {
                // The user has an input device. Give it to the domain
                await AudioManager.setAudioToDomain(applicationStore.audio.user.userInputStream);
            } else {
                Log.debug(Log.types.AUDIO, `AudioManager._connectInputAndOutputStreams. Have mixer but no user mic`);
            }

            // If there is a function to set the output, connect the domain to that output
            if (AudioManager._setAudioOutputFunction) {
                const aClient = pDomain.AudioClient;
                if (aClient) {
                    const domainStream = aClient.domainAudioStream;
                    AudioManager._setAudioOutputFunction(domainStream);
                } else {
                    Log.debug(Log.types.AUDIO, `AudioManager._connectInputAndOutputStreams. Could not set domain audio because no mixer`);
                }
            } else {
                Log.debug(Log.types.AUDIO, `AudioManager._connectInputAndOutputStreams. No output assignment function so no audio output`);
            }
        }
    }

    private static _disconnectInputAndOutputStreams(pDomain: Domain): void {
        if (pDomain.AudioClient && pDomain.AudioClient.Mixer) {
            pDomain.AudioClient.Mixer.audioInput = null;
            AudioManager._setAudioOutputFunction?.(undefined);
        }
    }

    /**
     * Set the current user input stream. This is the mic or similar input.
     * This function will update Store as well as inform the domain of the input device.
     * The selection is also stored in the configuration as the active input
     * device for the next session.
     * @param pStream stream for input. Can be 'null' if no input device.
     * @param pDeviceInfo information on the stream
     */
    public static async setUserAudioInputStream(pStream: Nullable<MediaStream>, pDeviceInfo: Nullable<MediaDeviceInfo>): Promise<void> {

        applicationStore.audio.user.awaitingCapturePermissions = false;
        applicationStore.audio.user.connected = Boolean(pStream);
        applicationStore.audio.user.currentInputDevice = pDeviceInfo;
        applicationStore.audio.user.hasInputAccess = Boolean(pStream);
        applicationStore.audio.user.userInputStream = pStream;

        // If there is a stream, set up the muted state
        if (pStream) {
            AudioManager._restoreMicrophoneMuteState();
        } else {
            AudioManager.muteAudio(true);
        }

        // Remember the last selected input device for next session
        if (pDeviceInfo) {
            Log.debug(Log.types.AUDIO, `store user AudioInputStream: ${pDeviceInfo.label}`);
            Config.setItem(USER_AUDIO_INPUT, pDeviceInfo.deviceId);
        }

        // If there is a domain, set this stuff into the domain
        await this.setAudioToDomain(pStream);
    }

    /**
     * Assign the passed user input stream (mic) to be sent to the domain.
     * @param pStream stream from user that should go to the domain
     */
    public static async setAudioToDomain(pStream: Nullable<MediaStream>): Promise<void> {
        const mixer = DomainManager.ActiveDomain?.AudioClient?.Mixer;
        if (DomainManager.ActiveDomain?.AudioClient?.clientState === AssignmentClientState.CONNECTED && mixer) {
            mixer.audioInput = pStream as MediaStream | null;
            AudioManager.setDomainAudioMuted(mixer.inputMuted);
            await AudioManager.setDomainAudioPlayPause(true);
        }
    }

    // Set Play/Pause on domain audio.
    public static async setDomainAudioPlayPause(pPlay: boolean): Promise<boolean> {
        const mixer = DomainManager.ActiveDomain?.AudioClient?.Mixer;
        if (DomainManager.ActiveDomain?.AudioClient?.clientState === AssignmentClientState.CONNECTED && mixer) {
            await mixer[pPlay ? "play" : "pause"]();
            return pPlay;
        }
        return false;
    }

    /**
     * Mute/unmute domain audio.
     * @param pMute 'true' to mute. If 'undefined', complement mute
     * @returns muted state
     */
    public static setDomainAudioMuted(pMute?: boolean): boolean {
        const newMute = pMute ?? !applicationStore.audio.user.muted;
        const mixer = DomainManager.ActiveDomain?.AudioClient?.Mixer;
        if (DomainManager.ActiveDomain?.AudioClient?.clientState === AssignmentClientState.CONNECTED && mixer) {
            mixer.inputMuted = newMute;
        }
        return newMute;
    }

    public static setUserAudioMuted(pMute?: boolean): boolean {
        const newMute = pMute ?? !applicationStore.audio.user.muted;
        Log.debug(Log.types.AUDIO, `AudioManager.setUserAudioMuted: ${String(newMute)}`);
        // Disable all media tracks.
        const mediaTracks = applicationStore.audio.user.userInputStream?.getTracks();
        mediaTracks?.forEach((track) => {
            track.enabled = !newMute;
        });
        return newMute;
    }

    /**
     * Specify the current output device.
     * This will update Store as well as update the domain.
     * The selection is also stored in the configuration as the active input
     * device for the next session.
     * @param pStream stream for input. Can be 'null' if no input device.
     * @param pDeviceInfo information on the stream
     */
    public static setAudioOutputStream(pDeviceInfo: Nullable<MediaDeviceInfo>): void {
        applicationStore.audio.user.currentOutputDevice = pDeviceInfo;
        // Remember the last selected input device for next session
        if (pDeviceInfo) {
            Log.debug(Log.types.AUDIO, `store user AudioOutputStream: ${pDeviceInfo.label}`);
            Config.setItem(USER_AUDIO_OUTPUT, pDeviceInfo.deviceId);
        }

        // the output device has changed so set the domain stream to the output device
        const audioClient = DomainManager.ActiveDomain?.AudioClient;
        if (audioClient?.clientState === AssignmentClientState.CONNECTED) {
            const domainStream = audioClient.domainAudioStream;
            Log.debug(Log.types.AUDIO, `AudioManager.setAudioOutputStream: setting output. ${typeof domainStream}`);
            if (AudioManager._setAudioOutputFunction) {
                AudioManager._setAudioOutputFunction(domainStream);
            }
        }
    }

    /**
     * Return the stream associated with the passed MediaDeviceInfo block.
     * If we don't have access to the devices, null is returned
     * @param pDInfo MediaDeviceInfo block for the device we want the stream of
     * @returns the stream or 'null' if the stream couldn't be fetched
     */
    public static async getStreamForDeviceInfo(pDInfo: MediaDeviceInfo): Promise<Nullable<MediaStream>> {
        const constraint = { audio: { deviceId: { exact: pDInfo.deviceId } }, video: false };
        const stream = await navigator.mediaDevices.getUserMedia(constraint);
        return stream;
    }

    /**
     * Return the MediaDeviceInfo block for the passed stream.
     * @param pStream the stream to return the MediaDeviceInfo for
     * @returns the MediaDeviceInfo for the passed stream or 'undefined' if none found
     */
    public static async getDeviceInfoForStream(pStream: MediaStream): Promise<Nullable<MediaDeviceInfo>> {
        // Get all the deviceId's used by the stream
        const devicesUsedByStream = pStream.getTracks().map((t) => t.getSettings().deviceId);
        // Get a list of all the known devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        // Extract the device info blocks that contain deviceId's used by the stream
        const devInfo = devices.filter((d) => devicesUsedByStream.includes(d.deviceId));
        if (devInfo.length > 0) {
            // Found a matching devices so use the first (and probably only) device
            Log.debug(Log.types.AUDIO, `AudioManager.getDeviceInfoForStream: returning ${devInfo[0].label}`);
            return devInfo[0];
        }
        Log.debug(Log.types.AUDIO, `AudioManager.getDeviceInfoForStream: no device info found`);
        return undefined;
    }

    // INITIALIZATION ==============================================================

    // Ask the system for the available IO devices and put in UI information
    public static async getAvailableInputOutputDevices(): Promise<void> {
        Log.debug(Log.types.AUDIO, `AudioManager.getAvailableInputOutputDevices`);
        let inputsList: MediaDeviceInfo[] = [];
        let outputsList: MediaDeviceInfo[] = [];
        if (navigator.mediaDevices) {
            const devices = await navigator.mediaDevices.enumerateDevices();
            inputsList = devices.filter((d) => d.kind === "audioinput");
            Log.debug(Log.types.AUDIO, `AudioManager: getAvailableInputOutputDevices. input count=${inputsList.length}`);
            outputsList = devices.filter((d) => d.kind === "audiooutput");
            Log.debug(Log.types.AUDIO, `AudioManager: getAvailableInputOutputDevices. output count=${outputsList.length}`);
        }
        // Update the information the UI sees
        applicationStore.audio.inputsList = inputsList;
        applicationStore.audio.outputsList = outputsList;
    }

    /**
     * Ask the browser for access to the input devices.
     * This also checks if a default device has been selected previously and it tries to
     * select that device.
     * This routine will hang in the Promise waiting for the user to grant audio access.
     * @returns a mediaStream as the user's audio input device
     */
    public static async getAudioInputAccess(): Promise<Nullable<MediaStream>> {
        let inputStream: Nullable<MediaStream> = undefined;
        if (navigator.mediaDevices) {
            try {
                const lastSessionInput = Config.getItem(USER_AUDIO_INPUT, "none");
                const constraint = lastSessionInput === "none"
                    ? { video: false, audio: true }
                    : { audio: { deviceId: { exact: lastSessionInput } }, video: false };
                inputStream = await navigator.mediaDevices.getUserMedia(constraint);
                Log.debug(Log.types.AUDIO, `AudioManager.getAudioInputAccess: have user input stream`);
                // If we get access, say we're connected
                applicationStore.audio.user.hasInputAccess = true;
            } catch (e) {
                Log.error(Log.types.AUDIO, `Exception getting audio device access.`);
            }
        }
        return inputStream;
    }

    /**
     * Set the initial input device.
     * Selects the first input device unless a stream is passed. If a stream
     * is supplied in the call, this attempts to select that device.
     * @param {MediaStream} pInitial an optional stream to prefer when selecting input device
     */
    public static async setInitialInputAudioDevice(pInitial?: Nullable<MediaStream>): Promise<void> {
        Log.debug(Log.types.AUDIO, `AudioManager.setInitialInputAudioDevice`);
        try {
            Log.debug(Log.types.AUDIO, `AudioManager: Set initial Input audio device.`);
            if (pInitial) {
                await AudioManager.setUserAudioInputStream(pInitial, await AudioManager.getDeviceInfoForStream(pInitial));
            } else if (applicationStore.audio.inputsList.length > 0) {
                const firstInput = applicationStore.audio.inputsList[0];
                await AudioManager.setUserAudioInputStream(await AudioManager.getStreamForDeviceInfo(firstInput), firstInput);
            }
        } catch (error) {
            Log.error(Log.types.AUDIO, `Exception setting initial audio device: ${(error as Error).message}`);
            await AudioManager.setUserAudioInputStream(undefined, undefined);
        }
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    public static async setInitialOutputAudioDevice(): Promise<void> {
        Log.debug(Log.types.AUDIO, `AudioManager.setInitialOutputAudioDevice`);
        const lastSessionOutput = Config.getItem(USER_AUDIO_OUTPUT, "none");
        try {
            if (lastSessionOutput === "none") {
                Log.debug(Log.types.AUDIO, `AudioManager: Set initial output audio device.`);
                if (applicationStore.audio.outputsList.length > 0) {
                    const firstOutput = applicationStore.audio.outputsList[0];
                    AudioManager.setAudioOutputStream(firstOutput);
                } else {
                    // Some browsers don't have output selection so say none selected
                    AudioManager.setAudioOutputStream(undefined);
                }
            } else {
                // The user is specifying a device. Reselect that one.
                const userDev = applicationStore.audio.outputsList.filter((ii) => ii.deviceId === lastSessionOutput);
                if (userDev.length > 0) {
                    Log.debug(Log.types.AUDIO, `AudioManager: Found output audio device from last session.`);
                    // Found the output device from last session.
                    const devInfo = userDev[0];
                    AudioManager.setAudioOutputStream(devInfo);
                } else {
                    // The device is not found from last session. Default to first one
                    Log.debug(Log.types.AUDIO, `AudioManager: Could not find output audio device from last session.`);
                    const firstOutput = applicationStore.audio.outputsList[0];
                    AudioManager.setAudioOutputStream(firstOutput);
                }
            }
        } catch (e) {
            AudioManager.setAudioOutputStream(undefined);
        }
    }
}
