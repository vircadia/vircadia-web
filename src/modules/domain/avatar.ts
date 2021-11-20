/*
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

import { Domain } from "@Modules/domain/domain";
import { Client, AssignmentClientState } from "@Modules/domain/client";

import { Store, Actions as StoreActions } from "@Store/index";

import { AvatarMixer, SignalEmitter, vec3, Uuid, MyAvatarInterface } from "@vircadia/web-sdk";

import Log from "@Modules/debugging/log";

// Allow 'get' lines to be compact
/* eslint-disable @typescript-eslint/brace-style */

// Function signature called for state changing
export type DomainAvatarStateChangeCallback = (pD: Domain, pA: DomainAvatar, pS: AssignmentClientState) => void;

export class DomainAvatar extends Client {

    // Emitter called when the underlying AvatarMixer connection state changes.
    public onStateChange: SignalEmitter;

    #_domain: Domain;
    #_avaMixer: Nullable<AvatarMixer>;
    #_signalsConnected: boolean;

    public get Mixer(): Nullable<AvatarMixer> { return this.#_avaMixer; }
    public get MyAvatar(): Nullable<MyAvatarInterface> { return this.#_avaMixer?.myAvatar; }

    constructor(pD: Domain) {
        super();
        this.#_domain = pD;
        this.onStateChange = new SignalEmitter();
        this.#_avaMixer = new AvatarMixer(pD.ContextId);
        this.#_signalsConnected = false;
        this.#_avaMixer.onStateChanged = this._handleOnStateChanged.bind(this);
    }

    /**
     * Handle the changing state of the AvatarMixer.
     *
     * When the state changes, this pushes the various variables into $store.
     *
     * @param pNewState the new state of the AvatarMixer
     */
    private _handleOnStateChanged(pNewState: AssignmentClientState): void {
        if (this.#_avaMixer) {
            Log.debug(Log.types.AVATAR,
                `DomainAvatar: AvatarMixer state=${AvatarMixer.stateToString(this.#_avaMixer.state)}`);
            if (!this.#_signalsConnected) {
                this.#_avaMixer.avatarList.avatarAdded.connect(this._handleOnAvatarAdded.bind(this));
                this.#_avaMixer.avatarList.avatarRemoved.connect(this._handleOnAvatarRemoved.bind(this));
                this.#_signalsConnected = true; // remember connected so will happen only once
            }
            this._updateAvatarInfo();
            // TODO: need to do one time subscription to displayname changing
        } else {
            Log.error(Log.types.AVATAR, `DomainAvatar: no AvatarMixer`);
        }
        this.onStateChange.emit(this.#_domain, this, pNewState);
    }

    /**
     * Called when an avatar is added to the scene.
     *
     * @param pAvatarId the BigInt ID of the added avatar.
     */
    // eslint-disable-next-line class-methods-use-this
    private _handleOnAvatarAdded(pAvatarId: Uuid) {
        Log.debug(Log.types.AVATAR, `DomainAvatar: Avatar added: ${pAvatarId.stringify()}`);
        this._updateAvatarInfo();
    }

    /**
     * Called when an avatar is removed from the domain.
     *
     * Push new avatar count and info.
     *
     * @param pAvatarId The BitInt ID of the removed avatar.
     */
    // eslint-disable-next-line class-methods-use-this
    private _handleOnAvatarRemoved(pAvatarId: Uuid) {
        Log.debug(Log.types.AVATAR, `DomainAvatar: Avatar removed: ${pAvatarId.stringify()}`);
        this._updateAvatarInfo();
    }

    /**
     * Update the avatar info in the Vue store.
     *
     * This called the Store dispatcher with the structures for domain and avatars.
     * The called dispatcher extracts the information for the Store.
     */
    private _updateAvatarInfo() {
        // eslint-disable-next-line no-void
        void Store.dispatch(StoreActions.UPDATE_AVATAR_INFO, {
            domain: this.#_domain,
            domainAvatar: this,
            avatarList: this.#_avaMixer?.avatarList
        });
    }

    // Turn a vector position into a displayable string
    static positionAsString(pPos: Nullable<vec3>): string {
        let ret = "0,0,0";
        if (pPos && pPos.x && pPos.y && pPos.z) {
            ret = `${pPos.x.toFixed(2)},${pPos.y.toFixed(2)},${pPos.z.toFixed(2)}`;
        }
        return ret;
    }
}
