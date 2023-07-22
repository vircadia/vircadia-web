//
//  application-store.ts
//
//  Created by Giga on 30 May 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { defineStore } from "pinia";
import packageInfo from "@Base/../package.json";
import versionInfo from "@Base/../VERSION.json";
import { type ScriptAvatar, type vec3, Vircadia, type Uuid } from "@vircadia/web-sdk";
import { DomainManager } from "@Modules/domain";
import { DomainAudioClient } from "@Modules/domain/audio";
import { DomainAvatarClient } from "@Modules/domain/avatar";
import { AssignmentClientState } from "@Modules/domain/client";
import { ConnectionState, Domain } from "@Modules/domain/domain";
import type { ChatMessage } from "@Modules/domain/message";
import type { WebEntity } from "@Modules/entity/entities";
import type { IWebEntity } from "@Modules/entity/EntityInterfaces";
import type { Metaverse, MetaverseState } from "@Modules/metaverse/metaverse";
import type { Vector3, Quaternion } from "@babylonjs/core";

// Information kept about avatars also include information about our control of that representation
export interface AvatarInfo {
    sessionId: Uuid,        // session Id
    volume: number,         // audio volume setting (0..100)
    muted: boolean,         // whether audio from this avatar is muted
    isAdmin: boolean,       // whether this avatar is an admin in this context
    // information from ScriptAvatar
    isValid: boolean,
    displayName: string,
    position: vec3
}

export interface JitsiRoomInfo {
    name: string;
    id: string;
    entity: WebEntity | IWebEntity;
}

export const useApplicationStore = defineStore("application", {
    state: () => ({
        globalConsts: {
            APP_NAME: process.env.VRCA_PRODUCT_NAME,
            APP_VERSION: packageInfo.version,
            APP_VERSION_TAG: versionInfo["version-tag"],
            SDK_VERSION_TAG: Vircadia.verboseVersion ?? "probably 0.0.4",
            SAFETY_BEFORE_SESSION_TIMEOUT: 21600 // If a token has 6 or less hours left on its life, refresh it.
        },
        defaultConnectionConfig: {
            DEFAULT_METAVERSE_URL: process.env.VRCA_DEFAULT_METAVERSE_URL,
            DEFAULT_DOMAIN_PROTOCOL: process.env.VRCA_DEFAULT_DOMAIN_PROTOCOL,
            DEFAULT_DOMAIN_PORT: process.env.VRCA_DEFAULT_DOMAIN_PORT,
            DEFAULT_DOMAIN_URL: process.env.VRCA_DEFAULT_DOMAIN_URL
        },
        debugging: {},
        notifications: {},
        error: {
            title: "",
            code: "",
            full: ""
        },
        dialog: {
            which: "",
            show: false
        },
        domain: {
            connectionState: Domain.stateToString(ConnectionState.DISCONNECTED),
            info: "",
            url: ""
        },
        avatars: {
            connectionState: DomainAvatarClient.stateToString(AssignmentClientState.DISCONNECTED),
            count: 0,
            avatarsInfo: new Map<Uuid, AvatarInfo>()
        },
        messages: {
            messages: [] as Array<ChatMessage>,
            nextMessageId: 22,
            maxMessages: 150
        },
        // Information about the audio system.
        audio: {
            inputsList: [] as Array<MediaDeviceInfo>,
            outputsList: [] as Array<MediaDeviceInfo>,
            user: {
                connected: false,
                hasInputAccess: false,
                muted: true,
                awaitingCapturePermissions: false,
                currentInputDevice: undefined as Nullable<MediaDeviceInfo>,
                currentOutputDevice: undefined as Nullable<MediaDeviceInfo>,
                userInputStream: undefined as Nullable<MediaStream>
            }
        },
        // Information about the metaverse-server we're connected to.
        metaverse: {
            connectionState: "",
            name: "",
            nickname: "",
            server: "",
            iceServer: undefined as Nullable<string>,
            jitsiServer: undefined as Nullable<string>,
            serverVersion: undefined as Nullable<string>
        },
        // Information about the rendering system.
        renderer: {
            focusSceneId: 0,
            fps: 1,
            cameraLocation: undefined as Nullable<Vector3>,
            cameraRotation: undefined as Nullable<Quaternion>,
            contentIsLoading: false,
            contentLoadingInfo: "",
            contentLoadingSpeed: 0
        },
        // Theme configuration.
        theme: {
            brandName: process.env.VRCA_BRAND_NAME,
            productName: process.env.VRCA_PRODUCT_NAME,
            productDescription: process.env.VRCA_PRODUCT_DESCRIPTION,
            tagline: process.env.VRCA_TAGLINE,
            logo: process.env.VRCA_LOGO ?? "/icons/favicon.svg",
            banner: process.env.VRCA_BANNER ?? "/assets/OpenGraph_banner.png",
            bannerAlt: process.env.VRCA_BANNER_ALT,
            url: process.env.VRCA_HOSTED_URL,
            globalServiceTerm: process.env.VRCA_GLOBAL_SERVICE_TERM,
            versionWatermark: process.env.VRCA_VERSION_WATERMARK,
            colors: {
                primary: process.env.VRCA_COLORS_PRIMARY,
                secondary: process.env.VRCA_COLORS_SECONDARY,
                accent: process.env.VRCA_COLORS_ACCENT
            },
            defaultMode: process.env.VRCA_DEFAULT_MODE,
            globalStyle: process.env.VRCA_GLOBAL_STYLE,
            headerStyle: process.env.VRCA_HEADER_STYLE,
            windowStyle: process.env.VRCA_WINDOW_STYLE,
            // TODO: Move links to their own object (it's not theme related).
            helpLinks: process.env.VRCA_HELP_LINKS
        },
        // First Time Wizard configuration.
        firstTimeWizard: {
            title: process.env.VRCA_WIZARD_TITLE,
            welcomeText: process.env.VRCA_WIZARD_WELCOME_TEXT,
            tagline: process.env.VRCA_WIZARD_TAGLINE,
            buttonText: process.env.VRCA_WIZARD_BUTTON_TEXT,
            pendingLocation: ""
        },
        // Conference data.
        conference: {
            activeRooms: [] as Array<JitsiRoomInfo>,
            currentRoom: {} as JitsiRoomInfo
        },
        // State of interactions with the player's avatar.
        interactions: {
            interactionDistance: 1.5,
            isInteracting: false
        }
    }),

    actions: {
        /**
         * Reset the state of the store to default.
         */
        reset(): void {
            this.$reset();
        },
        /**
         * Update any property of a given avatar.
         * @param sessionId The avatar's unique session ID.
         * @param key The key of the property to update.
         * @param value The new value.
         */
        updateAvatarProperty<T extends keyof AvatarInfo>(sessionId: Uuid, key: T, value: AvatarInfo[T]): void {
            const avatarData = this.avatars.avatarsInfo.get(sessionId);
            if (avatarData) {
                avatarData[key] = value;
            }
        },
        /**
         * Update the stored data for all avatars in the connected domain server.
         * @param domainAvatar A reference to the local avatar instance.
         * @param data A map of all other avatars in the server.
         */
        updateAllAvatars(domainAvatar: DomainAvatarClient, data: Map<Uuid, ScriptAvatar>): void {
            const existingAvatars = this.avatars.avatarsInfo;
            const newAvatars = new Map<Uuid, AvatarInfo>();
            data.forEach((avatar, id) => {
                const existingEntry = existingAvatars.get(id);
                // Fetch the avatar's audio gain from the Domain server.
                const gain = DomainManager.ActiveDomain?.DomainClient?.users?.getAvatarGain(id);
                // If it can't be fetched, assume a default value of 0dB.
                const defaultGain = 0;
                if (existingEntry) {
                    // Update the existing avatar entry.
                    existingEntry.position = avatar.position;
                    existingEntry.displayName = avatar.displayName ? avatar.displayName : avatar.sessionDisplayName;
                    newAvatars.set(id, existingEntry);
                } else {
                    // Add a new entry to the map.
                    newAvatars.set(id, {
                        sessionId: id,
                        volume: DomainAudioClient.getPercentageFromGain(gain ?? defaultGain),
                        muted: false,
                        isAdmin: false,
                        isValid: avatar.isValid,
                        displayName: avatar.displayName ? avatar.displayName : avatar.sessionDisplayName,
                        position: avatar.position
                    });
                }
            });
            this.avatars.avatarsInfo = newAvatars;
            this.avatars.count = newAvatars.size;
            this.avatars.connectionState = DomainAvatarClient.stateToString(domainAvatar?.Mixer?.state ?? AssignmentClientState.DISCONNECTED);
        },
        /**
         * Join a new conference room.
         * @param room A conference room instance/reference.
         */
        joinConferenceRoom(room: JitsiRoomInfo): void {
            this.conference.currentRoom = room;
        },
        /**
         * Add a new conference room to the Store.
         * @param entity The web entity to display the conference room in.
         * @returns A reference to the new room.
         */
        addConferenceRoom(entity: WebEntity | IWebEntity): JitsiRoomInfo {
            const roomName = entity.name ?? "";
            const newRoom = {
                name: roomName,
                id: `${roomName}-${entity.id}`,
                entity
            };
            this.conference.activeRooms.push(newRoom);
            return newRoom;
        },
        /**
         * Remove a conference room from the Store.
         * @param name The name of the room to remove.
         */
        removeConferenceRoom(name: string): void {
            const roomIndex = this.conference.activeRooms.findIndex((room) => room.name === name);
            if (roomIndex !== -1) {
                this.conference.activeRooms.splice(roomIndex, 1);
            }
        },
        /**
         * Add a new chat message to the Store.
         * @param message
         */
        addChatMessage(message: ChatMessage): void {
            // If the message doesn't have some unique identification, add it.
            if (typeof message.id !== "number") {
                message.id = this.messages.nextMessageId;
                this.messages.nextMessageId += 1;
            }
            // Add the message to the store.
            this.messages.messages.push(message);
            // Remove old messages from the list.
            if (this.messages.messages.length > this.messages.maxMessages) {
                this.messages.messages.slice(this.messages.messages.length - this.messages.maxMessages);
            }
        },
        /**
         * Update the stored state of the connected domain server.
         * @param domain A reference to the domain server connection instance.
         * @param state The new state of the server connection.
         * @param info `(Optional)` Additional information about the server.
         */
        updateDomainState(domain: Domain, state: ConnectionState, info?: string): void {
            this.domain.connectionState = Domain.stateToString(state);
            this.domain.info = info ?? this.domain.info;
            this.domain.url = domain.Location.href;
        },
        /**
         * Update the stored state of the connected metaverse server.
         * @param metaverse A reference to the metaverse server connection instance.
         * @param state The new state of the server connection.
         */
        updateMetaverseState(metaverse: Metaverse, state: MetaverseState): void {
            this.metaverse.name = metaverse.MetaverseName;
            this.metaverse.nickname = metaverse.MetaverseNickname;
            this.metaverse.connectionState = state;
            this.metaverse.server = metaverse.MetaverseUrl;
            this.metaverse.iceServer = metaverse.IceServer;
            this.metaverse.jitsiServer = metaverse.JitsiServer;
            this.metaverse.serverVersion = metaverse.ServerVersion;
        }
    }
});
