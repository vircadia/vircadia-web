/*
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

import { Domain } from "@Modules/domain/domain";

import { AssignmentClientState, AvatarMixer, SignalEmitter } from "@vircadia/web-sdk";

import Log from "@Modules/debugging/log";

// Allow 'get' lines to be compact
/* eslint-disable @typescript-eslint/brace-style */

// Function signature called for state changing
export type DomainAvatarStateChangeCallback = (pD: Domain, pA: DomainAvatar, pS: AssignmentClientState) => void;

export class DomainAvatar {

    public onStateChange: SignalEmitter;

    #_domain: Domain;
    #_avaMixer: Nullable<AvatarMixer>;
    public get Mixer(): Nullable<AvatarMixer> { return this.#_avaMixer; }

    constructor(pD: Domain) {
        this.#_domain = pD;
        this.onStateChange = new SignalEmitter();
        this.#_avaMixer = new AvatarMixer(pD.ContextId);
        this.#_avaMixer.onStateChanged = this._handleOnStateChanged.bind(this);
    }

    private _handleOnStateChanged(pNewState: AssignmentClientState): void {
        if (this.#_avaMixer) {
            Log.debug(Log.types.COMM,
                `DomainAvatar: AvatarMixer state=${AvatarMixer.stateToString(this.#_avaMixer.state)}`);
            this.#_avaMixer.onStateChanged = function(pAState: AssignmentClientState): void {
                Log.debug(Log.types.COMM,
                    `DomainAvatar: AvatarMixer state change: ${AvatarMixer.stateToString(pAState)}`);
            };
        } else {
            Log.error(Log.types.COMM, `DomainAvatar: no AvatarMixer`);
        }
        this.onStateChange.emit(this.#_domain, this, pNewState);
    }
}
