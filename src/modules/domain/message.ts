/*
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

import { Domain } from "@Modules/domain/domain";

import { AssignmentClientState, MessageMixer, SignalEmitter } from "@vircadia/web-sdk";

import Log from "@Modules/debugging/log";

// Allow 'get' lines to be compact
/* eslint-disable @typescript-eslint/brace-style */

// Function signature called for state changing
export type DomainMessageStateChangeCallback = (pD: Domain, pM: DomainMessage, pS: AssignmentClientState) => void;

export class DomainMessage {

    public onStateChange: SignalEmitter;

    #_domain: Domain;
    #_msgMixer: Nullable<MessageMixer>;
    public get Mixer(): Nullable<MessageMixer> { return this.#_msgMixer; }

    constructor(pD: Domain) {
        this.#_domain = pD;
        this.onStateChange = new SignalEmitter();
        this.#_msgMixer = new MessageMixer(pD.ContextId);
        this.#_msgMixer.onStateChanged = this._handleOnStateChanged.bind(this);
    }

    private _handleOnStateChanged(pNewState: AssignmentClientState): void {
        if (this.#_msgMixer) {
            Log.debug(Log.types.COMM,
                `DomainMessage: MessageMixer state=${MessageMixer.stateToString(this.#_msgMixer.state)}`);
            this.#_msgMixer.onStateChanged = function(pAState: AssignmentClientState): void {
                Log.debug(Log.types.COMM,
                    `DomainMessage: MessageMixer state change: ${MessageMixer.stateToString(pAState)}`);
            };
        } else {
            Log.error(Log.types.COMM, `DomainMessage: no MessageMixer`);
        }
        this.onStateChange.emit(this.#_domain, this, pNewState);
    }

}
