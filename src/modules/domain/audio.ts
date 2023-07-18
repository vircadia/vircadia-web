//
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { AudioMixer, SignalEmitter, Vec3, Quat, vec3, quat } from "@vircadia/web-sdk";
import { AssignmentClientState, Client } from "@Modules/domain/client";
import { Domain } from "@Modules/domain/domain";
import Log from "@Modules/debugging/log";

export class DomainAudioClient extends Client {
    private _domain: Domain;
    private _audioMixer: Nullable<AudioMixer>;
    public onStateChange: SignalEmitter;
    private static _gainParameters = {
        min: -60,
        max: 20,
        range: 80
    } as const;

    /**
     * A reference to the Domain audio mixer.
     */
    public get Mixer(): Nullable<AudioMixer> {
        return this._audioMixer;
    }

    constructor(domain: Domain) {
        super();
        this._domain = domain;
        this.onStateChange = new SignalEmitter();
        this._audioMixer = new AudioMixer(domain.ContextId);
        // In 'quasar.conf.js' the worklet files from the SDK are copied into the 'js' directory
        this._audioMixer.audioWorkletRelativePath = "./js/";
        this._audioMixer.onStateChanged = (newState: AssignmentClientState): void => {
            Log.debug(Log.types.AUDIO, `Domain Audio Client: State changed to ${DomainAudioClient.stateToString(newState)}.`);
            this.onStateChange.emit(this._domain, this, newState); // Signature: Domain, DomainAudio, AssignmentClientState.
        };

        // eslint-disable-next-line arrow-body-style
        this._audioMixer.positionGetter = (): vec3 => {
            return domain.AvatarClient && domain.AvatarClient.MyAvatar ? domain.AvatarClient.MyAvatar.position : Vec3.ZERO;
        };
        // eslint-disable-next-line arrow-body-style
        this._audioMixer.orientationGetter = (): quat => {
            return domain.AvatarClient && domain.AvatarClient.MyAvatar ? domain.AvatarClient.MyAvatar.orientation : Quat.IDENTITY;
        };
    }

    /**
     * The state of the underlying assignment client.
     */
    public get clientState(): AssignmentClientState {
        return this._audioMixer?.state ?? AssignmentClientState.DISCONNECTED;
    }

    /**
     * A reference to the audio stream coming from the Domain server.
     */
    public get domainAudioStream(): Nullable<MediaStream> {
        return this._audioMixer?.audioOutput;
    }

    /**
     * The current mute state of the Domain server's audio input.
     * @returns `true` if the input stream is muted, `false` if unmuted.
     */
    public get mute(): boolean {
        return this._audioMixer?.inputMuted ?? true;
    }

    /**
     * Play the audio stream coming from the Domain server.
     */
    public play(): void {
        void this._audioMixer?.play();
    }

    /**
     * Pause the audio stream coming from the Domain server.
     */
    public pause(): void {
        void this._audioMixer?.pause();
    }

    /**
     * Get the audio gain in dB for a given volume percentage.
     * @param percentage The volume percentage (`0%` - `100%`).
     * @returns The gain value.
     */
    public static getGainFromPercentage(percentage: number): number {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        return this._gainParameters.range / 100 * percentage + this._gainParameters.min;
    }

    /**
     * Get the volume percentage for a given audio gain in dB.
     * @param gain The audio gain (`-60dB` - `20dB`)
     * @returns The volume percentage.
     */
    public static getPercentageFromGain(gain: number): number {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        return 100 * (gain - this._gainParameters.min) / this._gainParameters.range;
    }
}
