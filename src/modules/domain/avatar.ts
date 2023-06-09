/*
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

import { AvatarMixer, SignalEmitter, vec3, Uuid, MyAvatarInterface, ScriptAvatar, Vec3 } from "@vircadia/web-sdk";
import { Domain } from "@Modules/domain/domain";
import { Client, AssignmentClientState } from "@Modules/domain/client";
import { applicationStore, userStore } from "@Stores/index";
import Log from "@Modules/debugging/log";

// Function signature called for state changing
export type DomainAvatarStateChangeCallback = (pD: Domain, pA: DomainAvatar, pS: AssignmentClientState) => void;

export class DomainAvatar extends Client {

    // Emitter called when the underlying AvatarMixer connection state changes.
    public onStateChange: SignalEmitter;

    #_domain: Domain;
    #_avaMixer: Nullable<AvatarMixer>;
    #_avatarsInfo: Map<Uuid, ScriptAvatar>;
    #_myAvatarLastPosition: vec3;
    #_gameLoopTimer: Nullable<NodeJS.Timeout>;
    #_gameLoopFunction: Nullable<()=>void>;

    public get Mixer(): Nullable<AvatarMixer> {
        return this.#_avaMixer;
    }

    public get MyAvatar(): Nullable<MyAvatarInterface> {
        return this.#_avaMixer?.myAvatar;
    }

    constructor(pD: Domain) {
        super();
        this.#_domain = pD;
        this.#_gameLoopTimer = undefined;
        this.#_gameLoopFunction = undefined;

        this.#_avaMixer = new AvatarMixer(pD.ContextId);
        this.#_avaMixer.myAvatar.displayName = userStore.avatar.displayName;
        this.onStateChange = new SignalEmitter();
        this.#_avaMixer.onStateChanged = this._handleOnStateChanged.bind(this);

        // Info for tracking my avatar
        this.#_myAvatarLastPosition = Vec3.ZERO;
        this.#_avaMixer.myAvatar.displayNameChanged.connect(this._handleOnMyAvatarNameChanged.bind(this));
        this.#_avaMixer.myAvatar.sessionDisplayNameChanged.connect(this._handleOnMyAvatarNameChanged.bind(this));

        // Connections for tracking other avatars
        this.#_avatarsInfo = new Map<Uuid, ScriptAvatar>();
        this.#_avaMixer.avatarList.avatarAdded.connect(this._handleOnAvatarAdded.bind(this));
        this.#_avaMixer.avatarList.avatarRemoved.connect(this._handleOnAvatarRemoved.bind(this));

        // Copy the information into the Store for the UI
        this._updateOtherAvatarInfo();
    }

    // Return the state of the underlying assignment client
    public get clientState(): AssignmentClientState {
        return this.#_avaMixer?.state ?? AssignmentClientState.DISCONNECTED;
    }

    // Called periodically to update avatar information
    public update(): void {
        if (this.#_avaMixer) {
            this.#_avaMixer.update();
            if (this.#_avaMixer.myAvatar) {
                // clone position so object in SDK is not pointed to
                const pos = { ...this.#_avaMixer.myAvatar.position };
                if (pos !== this.#_myAvatarLastPosition) {
                    this.#_myAvatarLastPosition = pos;
                    this._updateAvatarPosition(pos);
                }
            }
            this._updateOtherAvatarInfo();
        }
    }

    /**
     * Handle the changing state of the AvatarMixer.
     *
     * When the state changes, this pushes the various variables into the Store.
     *
     * @param pNewState the new state of the AvatarMixer
     */
    private _handleOnStateChanged(pNewState: AssignmentClientState): void {
        Log.debug(Log.types.AVATAR,
            `DomainAvatar: AvatarMixer state=${AvatarMixer.stateToString(this.#_avaMixer?.state ?? AssignmentClientState.DISCONNECTED)}`);
        this.onStateChange.emit(this.#_domain, this, pNewState);
    }

    private _handleOnMyAvatarNameChanged(): void {
        this._updateMyAvatarInfo();
    }

    /**
     * Called when an avatar is added to the scene.
     *
     * @param pAvatarId the BigInt ID of the added avatar.
     */
    private _handleOnAvatarAdded(pAvatarId: Uuid) {
        Log.debug(Log.types.AVATAR, `DomainAvatar: Avatar added: ${pAvatarId.stringify()}`);
        if (this.#_avaMixer) {
            const info = this.#_avaMixer.avatarList.getAvatar(pAvatarId);
            if (info) {
                if (!this.#_avatarsInfo.has(pAvatarId)) {
                    // When avatar attributes change, update the global data
                    info.sessionDisplayNameChanged.connect(this._updateOtherAvatarInfo.bind(this));
                    this.#_avatarsInfo.set(pAvatarId, info);
                } else {
                    Log.error(Log.types.AVATAR, `DomainAvatar: attempt to add avatar that is already in list: ${pAvatarId.stringify()}`);
                }
            } else {
                Log.error(Log.types.AVATAR, `DomainAvatar: avatar added but no info: ${pAvatarId.stringify()}`);
            }
        }
        this._updateOtherAvatarInfo();
    }

    /**
     * Called when an avatar is removed from the domain.
     *
     * Push new avatar count and info.
     *
     * @param pAvatarId The BitInt ID of the removed avatar.
     */
    private _handleOnAvatarRemoved(pAvatarId: Uuid) {
        Log.debug(Log.types.AVATAR, `DomainAvatar: Avatar removed: ${pAvatarId.stringify()}`);
        const info = this.#_avatarsInfo.get(pAvatarId);
        if (info) {
            // undo the .connect that happened when added. (Does this method signature work?)
            info.sessionDisplayNameChanged.disconnect(this._updateOtherAvatarInfo.bind(this));
            this.#_avatarsInfo.delete(pAvatarId);
        }
        this._updateOtherAvatarInfo();
    }

    /**
     * Update the info for my avatar in the Vue store.
     *
     * The called dispatcher extracts the information for the Store.
     */
    private _updateMyAvatarInfo() {
        userStore.updateLocalAvatarInfo(this.#_domain, this);
    }

    /**
     * Update the information for the other avatars in the scene
     *
     * The called dispatcher extracts the information for the Store.
     */
    private _updateOtherAvatarInfo() {
        userStore.updateLocalAvatarInfo(this.#_domain, this);
        applicationStore.updateAllAvatars(this, this.#_avatarsInfo);
    }

    // Just update my avatar's position
    private _updateAvatarPosition(pPos: vec3) {
        userStore.updateLocalAvatarInfo(this.#_domain, this, pPos);
    }

    // Turn a vector position into a displayable string
    static positionAsString(pPos: Nullable<vec3>): string {
        const posDigits = 2;
        let ret = "0,0,0";
        if (pPos && pPos.x && pPos.y && pPos.z) {
            ret = `${pPos.x.toFixed(posDigits)},${pPos.y.toFixed(posDigits)},${pPos.z.toFixed(posDigits)}`;
        }
        return ret;
    }
}
