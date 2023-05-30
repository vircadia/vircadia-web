/*
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

import { Domain } from "@Modules/domain/domain";
import { Client, AssignmentClientState } from "@Modules/domain/client";

import { AudioMixer, SignalEmitter, Vec3, Quat, vec3, quat } from "@vircadia/web-sdk";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Log from "@Modules/debugging/log";

// Allow 'get' lines to be compact
/* eslint-disable @typescript-eslint/brace-style */

// Function signature called for state changing
export type DomainAudioStateChangeCallback = (pD: Domain, pA: DomainAudio, pS: AssignmentClientState) => void;

export class DomainAudio extends Client {

    public onStateChange: SignalEmitter;

    #_domain: Domain;
    #_audioMixer: Nullable<AudioMixer>;

    public get Mixer(): Nullable<AudioMixer> { return this.#_audioMixer; }

    private static gain = {
        min: -60,
        max: 20,
        range: 80
    } as const;

    constructor(pD: Domain) {
        super();
        this.#_domain = pD;
        this.onStateChange = new SignalEmitter();
        this.#_audioMixer = new AudioMixer(pD.ContextId);
        // In 'quasar.conf.js' the worklet files from the SDK are copied into the 'js' directory
        this.#_audioMixer.audioWorkletRelativePath = "./js/";
        this.#_audioMixer.onStateChanged = this._handleOnStateChanged.bind(this);

        // eslint-disable-next-line arrow-body-style
        this.#_audioMixer.positionGetter = () : vec3 => {
            return pD.AvatarClient && pD.AvatarClient.MyAvatar ? pD.AvatarClient.MyAvatar.position : Vec3.ZERO;
        };
        // eslint-disable-next-line arrow-body-style
        this.#_audioMixer.orientationGetter = () : quat => {
            return pD.AvatarClient && pD.AvatarClient.MyAvatar ? pD.AvatarClient.MyAvatar.orientation : Quat.IDENTITY;
        };
    }

    // Return the state of the underlying assignment client
    public get clientState(): AssignmentClientState { return this.#_audioMixer?.state ?? AssignmentClientState.DISCONNECTED; }

    private _handleOnStateChanged(pNewState: AssignmentClientState): void {
        Log.debug(Log.types.AUDIO, `DomainAudio: state change = ${DomainAudio.stateToString(pNewState)}`);
        this.onStateChange.emit(this.#_domain, this, pNewState);
    }

    getDomainAudioStream(): Nullable<MediaStream> {
        return this.#_audioMixer?.audioOutput;
    }

    public get mute(): boolean {
        return this.#_audioMixer?.inputMuted ?? true;
    }

    public play(): void {
        void this.#_audioMixer?.play();
    }

    public pause(): void {
        void this.#_audioMixer?.pause();
    }

    /**
     * Get the audio gain in dB for a given volume percentage.
     * @param percentage The volume percentage (`0%` - `100%`).
     * @returns The gain value.
     */
    public static getGainFromPercentage(percentage: number): number {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        return this.gain.range / 100 * percentage + this.gain.min;
    }

    /**
     * Get the volume percentage for a given audio gain in dB.
     * @param gain The audio gain (`-60dB` - `20dB`)
     * @returns The volume percentage.
     */
    public static getPercentageFromGain(gain: number): number {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        return 100 * (gain - this.gain.min) / this.gain.range;
    }
}
