//
//  avatar.ts
//
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { AvatarMixer, SignalEmitter, vec3, Uuid, MyAvatarInterface, ScriptAvatar, Vec3 } from "@vircadia/web-sdk";
import { AssignmentClientState, Client } from "@Modules/domain/client";
import { Domain } from "@Modules/domain/domain";
import { DataMapper } from "@Modules/domain/dataMapper";
import { applicationStore, userStore } from "@Stores/index";
import Log from "@Modules/debugging/log";

export class DomainAvatarClient extends Client {
    private _domain: Domain;
    private _avatarMixer: Nullable<AvatarMixer>;
    private _avatarsInfo: Map<Uuid, ScriptAvatar>;
    private _myAvatarLastPosition: vec3;
    public onStateChange: SignalEmitter;

    constructor(domain: Domain) {
        super();
        this._domain = domain;
        this._avatarMixer = new AvatarMixer(domain.ContextId);
        this._avatarMixer.myAvatar.displayName = userStore.avatar.displayName;
        this.onStateChange = new SignalEmitter();
        this._avatarMixer.onStateChanged = this._handleOnStateChanged.bind(this);

        // Info for tracking the local avatar.
        this._myAvatarLastPosition = Vec3.ZERO;
        this._avatarMixer.myAvatar.displayNameChanged.connect(() => userStore.updateLocalAvatarInfo(this._domain, this));
        this._avatarMixer.myAvatar.sessionDisplayNameChanged.connect(() => userStore.updateLocalAvatarInfo(this._domain, this));

        // Connections for tracking other avatars.
        this._avatarsInfo = new Map<Uuid, ScriptAvatar>();
        this._avatarMixer.avatarList.avatarAdded.connect(this._handleOnAvatarAdded.bind(this));
        this._avatarMixer.avatarList.avatarRemoved.connect(this._handleOnAvatarRemoved.bind(this));

        // Copy this information into the Store for the UI.
        this._updateOtherAvatarInfo();
    }

    /**
     * A reference to the Avatar Mixer.
     */
    public get Mixer(): Nullable<AvatarMixer> {
        return this._avatarMixer;
    }

    /**
     * A reference to the local avatar interface.
     */
    public get MyAvatar(): Nullable<MyAvatarInterface> {
        return this._avatarMixer?.myAvatar;
    }

    /**
     * The state of the underlying assignment client.
     */
    public get clientState(): AssignmentClientState {
        return this._avatarMixer?.state ?? AssignmentClientState.DISCONNECTED;
    }

    /**
     * Update the stored information about all avatars.
     */
    public update(): void {
        if (!this._avatarMixer) {
            return;
        }

        this._avatarMixer.update();
        if (this._avatarMixer.myAvatar) {
            // Clone the avatar's current position.
            const position = { ...this._avatarMixer.myAvatar.position };
            // If the position has changed significantly, update the value in the Store.
            const positionTolerance = 0.01;
            if (!DataMapper.compareVec3(position, this._myAvatarLastPosition, positionTolerance)) {
                this._myAvatarLastPosition = position;
                userStore.updateLocalAvatarInfo(this._domain, this, position);
            }
        }
        this._updateOtherAvatarInfo();
    }

    /**
     * Handle the changing state of the AvatarMixer.
     * @param newState the new state of the AvatarMixer
     */
    private _handleOnStateChanged(newState: AssignmentClientState): void {
        Log.debug(
            Log.types.AVATAR,
            "Domain Avatar Client: Avatar Mixer state changed to ",
            AvatarMixer.stateToString(this._avatarMixer?.state ?? AssignmentClientState.DISCONNECTED)
        );
        this.onStateChange.emit(this._domain, this, newState); // Signature: Domain, DomainAvatar, AssignmentClientState.
    }

    /**
     * Called when an avatar is added to the scene.
     * @param avatarId the BigInt ID of the added avatar.
     */
    private _handleOnAvatarAdded(avatarId: Uuid) {
        Log.debug(Log.types.AVATAR, `Domain Avatar Client: Avatar added: ${avatarId.stringify()}.`);
        if (this._avatarMixer) {
            const info = this._avatarMixer.avatarList.getAvatar(avatarId);
            if (info) {
                if (!this._avatarsInfo.has(avatarId)) {
                    // When avatar attributes change, update the global data
                    info.sessionDisplayNameChanged.connect(this._updateOtherAvatarInfo.bind(this));
                    this._avatarsInfo.set(avatarId, info);
                } else {
                    Log.error(Log.types.AVATAR, `Domain Avatar Client: Attempt to add avatar that is already in list: ${avatarId.stringify()}.`);
                }
            } else {
                Log.error(Log.types.AVATAR, `Domain Avatar Client: Avatar added without info: ${avatarId.stringify()}.`);
            }
        }
        this._updateOtherAvatarInfo();
    }

    /**
     * Update the stored information when an avatar is removed from the domain.
     * @param avatarId The BigInt ID of the removed avatar.
     */
    private _handleOnAvatarRemoved(avatarId: Uuid) {
        Log.debug(Log.types.AVATAR, `Domain Avatar Client: Avatar removed: ${avatarId.stringify()}.`);
        const info = this._avatarsInfo.get(avatarId);
        if (info) {
            // undo the .connect that happened when added. (Does this method signature work?)
            info.sessionDisplayNameChanged.disconnect(this._updateOtherAvatarInfo.bind(this));
            this._avatarsInfo.delete(avatarId);
        }
        this._updateOtherAvatarInfo();
    }

    /**
     * Update the stored information for the other avatars in the scene.
     */
    private _updateOtherAvatarInfo() {
        userStore.updateLocalAvatarInfo(this._domain, this);
        applicationStore.updateAllAvatars(this, this._avatarsInfo);
    }
}
