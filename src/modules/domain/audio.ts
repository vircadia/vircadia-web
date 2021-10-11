/*
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

import { AssignmentClientState, AudioMixer, Signal } from "@vircadia/web-sdk";

// Allow 'get' lines to be compact
/* eslint-disable @typescript-eslint/brace-style */

export class DomainAudio {

    public onDomainAudioChange: Signal;

    #_contextId: number;
    #_audioMixer: Nullable<AudioMixer>;

    constructor(pContextId: number) {
        this.#_contextId = pContextId;
        this.onDomainAudioChange = new Signal();
        this.#_audioMixer = new AudioMixer(pContextId);
        this.#_audioMixer.onStateChanged = this._handleOnStateChanged.bind(this);
    }

    private _handleOnStateChanged(pNewState: AssignmentClientState): void {
        this.onDomainAudioChange.emit(this, pNewState);
    }

    getDomainAudioStream(): Nullable<MediaStream> {
        if (this.#_audioMixer) {
            return this.#_audioMixer.audioOuput;
        }
        return undefined;
    }

    play(): void {
        this.#_audioMixer?.play();
    }

    pause(): void {
        this.#_audioMixer?.pause();
    }
}
