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
    .slide-left-enter-active,
    .slide-left-leave-active {
        transition: all 0.25s ease-out;
    }

    .slide-left-enter-active {
        margin-left: 0px;
    }

    .slide-left-leave-active {
        position: absolute;
        // top: 18px;
        // left: 4.5rem;
    }

    .slide-left-enter-from {
        opacity: 0;
        transform: translateX(30px);
    }

    .slide-left-leave-to {
        opacity: 0;
        transform: translateX(-30px);
    }
</style>

<template>
    <OverlayShell
        icon="people"
        :title="`People (${Array.from($store.state.avatars.avatarsInfo.keys()).length})`"
        :managerProps="propsToPass"
        :defaultHeight="500"
        :defaultWidth="350"
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
                style="height: 100%"
            >
                <q-list v-if="Array.from($store.state.avatars.avatarsInfo.keys()).length > 0">
                    <q-item
                        v-for="avaInfo in $store.state.avatars.avatarsInfo.values()"
                        :key="avaInfo.sessionId.stringify()"
                        class="q-mb-none"
                        dense
                        clickable
                        v-ripple
                        @click="
                            showMoreOptions[avaInfo.sessionId.stringify()] = !showMoreOptions[avaInfo.sessionId.stringify()]"
                    >
                        <q-item-section avatar>
                            <q-avatar class="q-mb-sm" color="primary" >
                                <img v-if="getProfilePicture(avaInfo)" :src="getProfilePicture(avaInfo)">
                                <span v-else style="user-select: none;">{{ getDisplayName(avaInfo).substring(0, 2) }}</span>
                            </q-avatar>
                        </q-item-section>
                        <q-item-section>
                            <div class="col q-pt-none">
                                <div class="row" style="align-items: center;gap: 16px;">
                                    <q-item-label>{{ getDisplayName(avaInfo) }}</q-item-label>
                                    <q-item-label v-if="avaInfo.isAdmin" caption lines="1">Admin</q-item-label>
                                    <q-btn
                                        flat
                                        round
                                        dense
                                        ripple
                                        icon="more_horiz"
                                        :text-color="$q.dark.isActive ? 'white' : 'dark'"
                                        title="More options"
                                        style="margin-left: auto;"
                                        @click.stop="
                                            showMoreOptions[avaInfo.sessionId.stringify()] =
                                            !showMoreOptions[avaInfo.sessionId.stringify()]"
                                    />
                                </div>
                                <TransitionGroup name="slide-left">
                                    <div
                                        v-if="showMoreOptions[avaInfo.sessionId.stringify()]"
                                        class="row q-mb-none q-pt-xs"
                                        style="align-items: center;gap: 4px;width: 100%;"
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
                                        ></q-btn>
                                        <q-btn
                                            icon="person_add_alt_1"
                                            text-color="primary"
                                            flat
                                            round
                                            dense
                                            ripple
                                            title="Add friend"
                                            disable
                                            @click.stop=""
                                        ></q-btn>
                                        <template v-if="canKick">
                                            <!--Admin Controls-->
                                            <q-btn
                                                icon="volume_off"
                                                text-color="negative"
                                                flat
                                                round
                                                dense
                                                ripple
                                                title="Server mute"
                                                :disable="!canKick"
                                                @click.stop="adminServerMute(avaInfo.sessionId)"
                                            ></q-btn>
                                            <q-btn
                                                icon="remove_circle"
                                                text-color="negative"
                                                flat
                                                round
                                                dense
                                                ripple
                                                title="Kick player"
                                                :disable="!canKick"
                                                @click.stop="adminKick(avaInfo.sessionId)"
                                            ></q-btn>
                                            <q-btn
                                                icon="remove_circle"
                                                text-color="negative"
                                                flat
                                                round
                                                dense
                                                ripple
                                                title="Kick player with IP"
                                                :disable="!canKick"
                                                @click.stop="adminKick(avaInfo.sessionId, banByIP())"
                                            ></q-btn>
                                        </template>
                                    </div>
                                    <div
                                        v-else
                                        class="row"
                                        style="align-items: center;gap: 16px;min-width: 70%;"
                                    >
                                        <q-slider
                                            :min="0"
                                            :max="100"
                                            :step="5"
                                            snap
                                            :color="avaInfo.muted || avaInfo.volume === 0 ? 'red' : 'primary'"
                                            style="width: calc(100% - 48px);"
                                            :model-value="avaInfo.volume"
                                            @update:model-value="(value) => setVolume(avaInfo.sessionId, value)"
                                        />
                                        <q-icon
                                            role="button"
                                            size="sm"
                                            flat
                                            round
                                            ripple
                                            :color="avaInfo.muted || avaInfo.volume === 0 ? 'red' : 'primary'"
                                            :name="avaInfo.muted || avaInfo.volume === 0 ? 'volume_off' : 'volume_up'"
                                            :title="avaInfo.muted || avaInfo.volume === 0 ?
                                                `Unmute ${avaInfo.displayName}` : `Mute ${avaInfo.displayName}`"
                                            @click.stop="complementMuted(avaInfo)"
                                        />
                                    </div>
                                </TransitionGroup>
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
import { Store, Mutations as StoreMutations, AvatarInfo } from "@Store/index";
import { DomainMgr } from "@Modules/domain";
import { Renderer } from "@Modules/scene";
import { ModerationFlags, Uuid } from "@vircadia/web-sdk";
import { DomainAudio } from "@Modules/domain/audio";

export interface PeopleEntry {
    displayName: string;
    username: string;
    sessionUUID: string;
    volume: number;
    muted: boolean;
    admin: boolean;
}

export default defineComponent({
    name: "People",

    props: {
        // Primary
        propsToPass: { type: Object, default: () => ({}) }
    },

    components: {
        OverlayShell
    },

    data: () => ({
        showMoreOptions: {} as { [key: string]: boolean },
        canKick: false
    }),

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
            if (value) {
                // Request the desired gain from the Domain server.
                const domainServer = DomainMgr.ActiveDomain?.DomainClient;
                if (domainServer) {
                    domainServer.users.setAvatarGain(
                        sessionId,
                        DomainAudio.getGainFromPercentage(value)
                    );
                }

                // Update the avatar's gain value in the Store.
                Store.commit(StoreMutations.UPDATE_AVATAR_VALUE, {
                    sessionId,
                    field: "volume",
                    value
                });
            }
        },

        /**
         * Complement the muted state of a given avatar.
         * @param pAvaInfo The avatar's session info.
         */
        complementMuted(pAvaInfo: AvatarInfo): void {
            const newMute = !pAvaInfo.muted;

            // Request the desired mute state from the Domain server.
            const domainServer = DomainMgr.ActiveDomain?.DomainClient;
            if (domainServer) {
                domainServer.users.setPersonalMute(
                    pAvaInfo.sessionId,
                    newMute
                );
            }

            // Update the avatar's mute value in the Store.
            Store.commit(StoreMutations.UPDATE_AVATAR_VALUE, {
                sessionId: pAvaInfo.sessionId,
                field: "muted",
                value: newMute
            });
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
            const domainServer = DomainMgr.ActiveDomain?.DomainClient;
            if (domainServer) {
                domainServer.users.mute(sessionId);
            }
        },

        adminKick(sessionId: Uuid, banFlags?: number): void {
            const domainServer = DomainMgr.ActiveDomain?.DomainClient;
            if (domainServer) {
                domainServer.users.kick(sessionId, banFlags);
            }
        }
    },

    mounted() {
        // Subscribe to the `canKickChanged` signal from the Domain Server.
        const domainServer = DomainMgr.ActiveDomain?.DomainClient;
        // Set the initial `canKick` state.
        this.canKick = Boolean(domainServer?.users.canKick);
        domainServer?.users.canKickChanged.connect(() => {
            // Update the `canKick` state accordingly.
            this.canKick = Boolean(domainServer?.users.canKick);
        });
    }
});
</script>
