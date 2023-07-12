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
    private domain: Domain;
    private avatarMixer: Nullable<AvatarMixer>;
    private avatarsInfo: Map<Uuid, ScriptAvatar>;
    private myAvatarLastPosition: vec3;
    public onStateChange: SignalEmitter;

    constructor(domain: Domain) {
        super();
        this.domain = domain;
        this.avatarMixer = new AvatarMixer(domain.ContextId);
        this.avatarMixer.myAvatar.displayName = userStore.avatar.displayName;
        this.onStateChange = new SignalEmitter();
        this.avatarMixer.onStateChanged = this.handleOnStateChanged.bind(this);

        // Info for tracking the local avatar.
        this.myAvatarLastPosition = Vec3.ZERO;
        this.avatarMixer.myAvatar.displayNameChanged.connect(() => userStore.updateLocalAvatarInfo(this.domain, this));
        this.avatarMixer.myAvatar.sessionDisplayNameChanged.connect(() => userStore.updateLocalAvatarInfo(this.domain, this));

        // Connections for tracking other avatars.
        this.avatarsInfo = new Map<Uuid, ScriptAvatar>();
        this.avatarMixer.avatarList.avatarAdded.connect(this.handleOnAvatarAdded.bind(this));
        this.avatarMixer.avatarList.avatarRemoved.connect(this.handleOnAvatarRemoved.bind(this));

        // Copy this information into the Store for the UI.
        this.updateOtherAvatarInfo();
    }

    /**
     * A reference to the Avatar Mixer.
     */
    public get Mixer(): Nullable<AvatarMixer> {
        return this.avatarMixer;
    }

    /**
     * A reference to the local avatar interface.
     */
    public get MyAvatar(): Nullable<MyAvatarInterface> {
        return this.avatarMixer?.myAvatar;
    }

    /**
     * The state of the underlying assignment client.
     */
    public get clientState(): AssignmentClientState {
        return this.avatarMixer?.state ?? AssignmentClientState.DISCONNECTED;
    }

    /**
     * Update the stored information about all avatars.
     */
    public update(): void {
        if (!this.avatarMixer) {
            return;
        }

        this.avatarMixer.update();
        if (this.avatarMixer.myAvatar) {
            // Clone the avatar's current position.
            const pos = { ...this.avatarMixer.myAvatar.position };
            // If the position has changed significantly, update the value in the Store.
            const positionTolerance = 0.01;
            if (!DataMapper.compareVec3(pos, this.myAvatarLastPosition, positionTolerance)) {
                this.myAvatarLastPosition = pos;
                userStore.updateLocalAvatarInfo(this.domain, this, pos);
            }
        }
        this.updateOtherAvatarInfo();
    }

    /**
     * Handle the changing state of the AvatarMixer.
     * @param newState the new state of the AvatarMixer
     */
    private handleOnStateChanged(newState: AssignmentClientState): void {
        Log.debug(Log.types.AVATAR,
            `Domain Avatar Client: Avatar Mixer state changed to ${AvatarMixer.stateToString(this.avatarMixer?.state ?? AssignmentClientState.DISCONNECTED)}.`);
        this.onStateChange.emit(this.domain, this, newState); // Signature: Domain, DomainAvatar, AssignmentClientState.
    }

    /**
     * Called when an avatar is added to the scene.
     * @param avatarId the BigInt ID of the added avatar.
     */
    private handleOnAvatarAdded(avatarId: Uuid) {
        Log.debug(Log.types.AVATAR, `Domain Avatar Client: Avatar added: ${avatarId.stringify()}.`);
        if (this.avatarMixer) {
            const info = this.avatarMixer.avatarList.getAvatar(avatarId);
            if (info) {
                if (!this.avatarsInfo.has(avatarId)) {
                    // When avatar attributes change, update the global data
                    info.sessionDisplayNameChanged.connect(this.updateOtherAvatarInfo.bind(this));
                    this.avatarsInfo.set(avatarId, info);
                } else {
                    Log.error(Log.types.AVATAR, `Domain Avatar Client: Attempt to add avatar that is already in list: ${avatarId.stringify()}.`);
                }
            } else {
                Log.error(Log.types.AVATAR, `Domain Avatar Client: Avatar added without info: ${avatarId.stringify()}.`);
            }
        }
        this.updateOtherAvatarInfo();
    }

    /**
     * Update the stored information when an avatar is removed from the domain.
     * @param avatarId The BigInt ID of the removed avatar.
     */
    private handleOnAvatarRemoved(avatarId: Uuid) {
        Log.debug(Log.types.AVATAR, `Domain Avatar Client: Avatar removed: ${avatarId.stringify()}.`);
        const info = this.avatarsInfo.get(avatarId);
        if (info) {
            // undo the .connect that happened when added. (Does this method signature work?)
            info.sessionDisplayNameChanged.disconnect(this.updateOtherAvatarInfo.bind(this));
            this.avatarsInfo.delete(avatarId);
        }
        this.updateOtherAvatarInfo();
    }

    /**
     * Update the stored information for the other avatars in the scene.
     */
    private updateOtherAvatarInfo() {
        userStore.updateLocalAvatarInfo(this.domain, this);
        applicationStore.updateAllAvatars(this, this.avatarsInfo);
    }
}
