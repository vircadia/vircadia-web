<!--
//  People.vue
//
//  Created by Kalila L. on May 16th, 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
-->

<style lang="scss" scoped>
.volumeIcon {
    display: inline-block;
    width: 1.5em;
    height: 1.5em;
    aspect-ratio: 1;
    color: inherit;
    background-color: currentColor;
    border-radius: 50%;
}
.volumeSlider {
    position: absolute;
    z-index: 1;
    width: calc(48px * 2.5);
    margin-right: 50px;
}
.volumeSlider::before {
    content: '';
    position: absolute;
    z-index: -2;
    inset: 0 -12px;
    background-color: $dark;
    border: 1px solid #8882;
    border-radius: 5px;
}
.volumeSlider::after {
    content: '';
    position: absolute;
    z-index: -1;
    top: 50%;
    right: -12px;
    width: 0.75em;
    height: 0.75em;
    background-color: $dark;
    border: 1px solid #8882;
    border-bottom: unset;
    border-left: unset;
    transform: translate(calc(50% - 1px), -50%) rotate(45deg);
}
</style>

<template>
    <OverlayShell
        icon="people"
        :title="`People (${Array.from(applicationStore.avatars.avatarsInfo.keys()).length})`"
        :managerProps="propsToPass"
        :defaultHeight="500"
        :defaultWidth="400"
        :defaultLeft="300"
        :hoverShowBar="false"
        :style="{
            'box-shadow': '0 1px 5px rgb(0 0 0 / 20%), 0 2px 2px rgb(0 0 0 / 14%), 0 3px 1px -2px rgb(0 0 0 / 12%)',
            border: 'none'
        }"
    >
        <q-card
            class="column no-wrap items-stretch full-height"
            style="background: transparent; box-shadow: none;"
        >
            <q-scroll-area
                class="col"
                style="height: 100%;"
            >
                <q-list v-if="Array.from(applicationStore.avatars.avatarsInfo.keys()).length > 0">
                    <q-item
                        v-for="avaInfo in applicationStore.avatars.avatarsInfo.values()"
                        :key="avaInfo.sessionId.stringify()"
                        class="q-mb-none q-pa-sm"
                        dense
                    >
                        <q-item-section avatar class="q-gutter-y-sm">
                            <q-avatar color="primary">
                                <img v-if="getProfilePicture(avaInfo)" :src="getProfilePicture(avaInfo)">
                                <span v-else style="user-select: none;">{{ getDisplayName(avaInfo).substring(0, 2) }}</span>
                            </q-avatar>
                            <q-item-label v-if="avaInfo.isAdmin" caption lines="1">Admin</q-item-label>
                        </q-item-section>
                        <q-item-section>
                            <div class="row" style="justify-content: space-between;align-items: center;gap: 16px;">
                                <q-item-label>{{ getDisplayName(avaInfo) }}</q-item-label>
                                <div
                                    class="row"
                                    style="position: relative;justify-content: flex-end;align-items: center;gap: 4px;"
                                >
                                    <div
                                        :style="{
                                            opacity: !showVolumeSlider[avaInfo.sessionId.stringify()] ? 1 : 0,
                                            transition: !showVolumeSlider[avaInfo.sessionId.stringify()]
                                                ? '0.25s ease opacity' : 'none',
                                            pointerEvents: !showVolumeSlider[avaInfo.sessionId.stringify()] ? 'all' : 'none'
                                        }"
                                    >
                                        <q-btn
                                            icon="place"
                                            text-color="primary"
                                            flat
                                            round
                                            dense
                                            ripple
                                            :title="`Teleport to ${avaInfo.displayName}`"
                                            @click.stop="teleportToAvatar(avaInfo)"
                                        />
                                        <q-btn
                                            icon="person_add_alt_1"
                                            text-color="primary"
                                            flat
                                            round
                                            dense
                                            ripple
                                            :title="`Add ${avaInfo.displayName} as a friend`"
                                            disable
                                            @click.stop=""
                                        />
                                        <template v-if="canKick">
                                            <!--Admin Controls-->
                                            <q-btn
                                                icon="logout"
                                                text-color="negative"
                                                flat
                                                round
                                                dense
                                                ripple
                                                :title="`Kick ${avaInfo.displayName}`"
                                                :disable="!canKick"
                                                @click.stop="adminKick(avaInfo.sessionId)"
                                            />
                                            <q-btn
                                                icon="remove_circle"
                                                text-color="negative"
                                                flat
                                                round
                                                dense
                                                ripple
                                                :title="`IP Ban ${avaInfo.displayName}`"
                                                :disable="!canKick"
                                                @click.stop="adminKick(avaInfo.sessionId, banByIP())"
                                            />
                                            <q-btn
                                                icon="mic_off"
                                                text-color="negative"
                                                flat
                                                round
                                                dense
                                                ripple
                                                :title="`Server mute ${avaInfo.displayName}`"
                                                :disable="!canKick"
                                                @click.stop="adminServerMute(avaInfo.sessionId)"
                                            />
                                        </template>
                                    </div>
                                    <div style="all: inherit;position: relative;">
                                        <q-slider
                                            thumbSize="26px"
                                            :min="0"
                                            :max="100"
                                            :step="5"
                                            snap
                                            dark
                                            :color="avaInfo.muted || avaInfo.volume === 0 ? 'red' : 'primary'"
                                            :title="`Volume: ${avaInfo.volume}%`"
                                            class="volumeSlider"
                                            :style="{
                                                opacity: showVolumeSlider[avaInfo.sessionId.stringify()] ? 1 : 0,
                                                transition: showVolumeSlider[avaInfo.sessionId.stringify()]
                                                    ? '0.25s ease opacity' : 'none',
                                                pointerEvents: showVolumeSlider[avaInfo.sessionId.stringify()] ? 'all' : 'none'
                                            }"
                                            :model-value="avaInfo.volume"
                                            @update:model-value="(value) => setVolume(avaInfo.sessionId, value)"
                                        />
                                        <q-btn
                                            :text-color="avaInfo.muted || avaInfo.volume === 0 ? 'red' : 'primary'"
                                            flat
                                            round
                                            dense
                                            ripple
                                            :title="`Adjust ${
                                                avaInfo.displayName[avaInfo.displayName.length - 1]?.toLowerCase() === 's'
                                                ? avaInfo.displayName + '\''
                                                : avaInfo.displayName + '\'s'
                                            } volume`"
                                            @click.stop="showVolumeSlider[avaInfo.sessionId.stringify()] =
                                                !showVolumeSlider[avaInfo.sessionId.stringify()]"
                                        >
                                            <q-circular-progress
                                                :angle="180"
                                                :value="avaInfo.volume"
                                                instant-feedback
                                                size="xs"
                                                :thickness="0.3"
                                                track-color="transparent"
                                                show-value
                                                class="q-ma-none"
                                            >
                                                <span class="volumeIcon"></span>
                                            </q-circular-progress>
                                        </q-btn>
                                    </div>
                                    <q-btn
                                        :icon="avaInfo.muted || avaInfo.volume === 0 ? 'volume_off' : 'volume_up'"
                                        :text-color="avaInfo.muted || avaInfo.volume === 0 ? 'red' : 'primary'"
                                        flat
                                        round
                                        dense
                                        ripple
                                        :title="avaInfo.muted || avaInfo.volume === 0
                                            ? `Unmute ${avaInfo.displayName}` : `Mute ${avaInfo.displayName}`"
                                        @click.stop="complementMuted(avaInfo)"
                                    />
                                </div>
                            </div>
                        </q-item-section>
                    </q-item>
                </q-list>
                <p v-else class="text-subtitle1 text-grey text-center q-mt-md">There is no one else in this server.</p>
            </q-scroll-area>
        </q-card>
    </OverlayShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import OverlayShell from "../OverlayShell.vue";
import { applicationStore } from "@Stores/index";
import { type AvatarInfo } from "@Stores/application-store";
import { DomainManager } from "@Modules/domain";
import { Renderer } from "@Modules/scene";
import { ModerationFlags, Uuid } from "@vircadia/web-sdk";
import { DomainAudioClient } from "@Modules/domain/audio";

export interface PeopleEntry {
    displayName: string;
    username: string;
    sessionUUID: string;
    volume: number;
    muted: boolean;
    admin: boolean;
}

export default defineComponent({
    name: "PeopleOverlay",

    props: {
        // Primary
        propsToPass: { type: Object, default: () => ({}) }
    },

    components: {
        OverlayShell
    },

    setup() {
        return {
            applicationStore
        };
    },

    data() {
        return {
            showVolumeSlider: {} as { [key: string]: boolean },
            canKick: false
        };
    },

    methods: {
        // Get the profile picture for this avatar or 'undefined' if none.
        // Note: can methods be async since fetching the profile picture is a network op.
        // Note: is this fetched through the domain-server? Here we have sessionID, not accountID.
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        getProfilePicture(pAvaInfo: AvatarInfo): string | undefined {
            // Should store profile pictures after retrieving and then pull each
            // subsequent one from cache instead of hitting metaverse every time.

            return undefined;
        },

        /**
         * Get the display name for a given avatar.
         * @param pAvaInfo The avatar's session info.
         */
        getDisplayName(pAvaInfo: AvatarInfo): string {
            return pAvaInfo.displayName ?? "anonymous";
        },

        /**
         * Set the audio volume of a given avatar.
         * @param sessionId The session ID of the avatar.
         * @param value The audio volume, expressed as a percentage.
         */
        setVolume(sessionId: Uuid, value: number | null): void {
            if (typeof value === "number") {
                // Request the desired gain from the Domain server.
                const domainServer = DomainManager.ActiveDomain?.DomainClient;
                if (domainServer) {
                    domainServer.users.setAvatarGain(
                        sessionId,
                        DomainAudioClient.getGainFromPercentage(value)
                    );
                }

                // Update the avatar's gain value in the Store.
                this.applicationStore.updateAvatarProperty(sessionId, "volume", value);
            }
        },

        /**
         * Complement the muted state of a given avatar.
         * @param pAvaInfo The avatar's session info.
         */
        complementMuted(pAvaInfo: AvatarInfo): void {
            const newMute = !pAvaInfo.muted;

            // Request the desired mute state from the Domain server.
            const domainServer = DomainManager.ActiveDomain?.DomainClient;
            if (domainServer) {
                domainServer.users.setPersonalMute(
                    pAvaInfo.sessionId,
                    newMute
                );
            }

            // Update the avatar's mute value in the Store.
            this.applicationStore.updateAvatarProperty(pAvaInfo.sessionId, "muted", newMute);
        },

        /**
         * Teleport to a particular avatar.
         * @param pAvaInfo The avatar's session info.
         */
        teleportToAvatar(pAvaInfo: AvatarInfo): void {
            Renderer.getScene().teleportMyAvatarToOtherPeople(pAvaInfo.sessionId.stringify());
        },

        banByIP(): number {
            return ModerationFlags.BanFlags.BAN_BY_USERNAME + ModerationFlags.BanFlags.BAN_BY_FINGERPRINT
                + ModerationFlags.BanFlags.BAN_BY_IP;
        },

        adminServerMute(sessionId: Uuid): void {
            const domainServer = DomainManager.ActiveDomain?.DomainClient;
            if (domainServer) {
                domainServer.users.mute(sessionId);
            }
        },

        adminKick(sessionId: Uuid, banFlags?: number): void {
            const domainServer = DomainManager.ActiveDomain?.DomainClient;
            if (domainServer) {
                domainServer.users.kick(sessionId, banFlags);
            }
        }
    },

    mounted() {
        // Subscribe to the `canKickChanged` signal from the Domain Server.
        const domainServer = DomainManager.ActiveDomain?.DomainClient;
        // Set the initial `canKick` state.
        this.canKick = Boolean(domainServer?.users.canKick);
        domainServer?.users.canKickChanged.connect(() => {
            // Update the `canKick` state accordingly.
            this.canKick = Boolean(domainServer?.users.canKick);
        });
    }
});
</script>
