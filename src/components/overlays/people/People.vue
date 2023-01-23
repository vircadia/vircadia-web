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
                                <img v-if="getProfilePicture(avaInfo)"
                                    :src="getProfilePicture(avaInfo)"
                                    @click='complementMuted(avaInfo)'>
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
                                        <template v-if="true">
                                            <!--Admin Controls-->
                                            <q-btn
                                                icon="volume_off"
                                                text-color="negative"
                                                flat
                                                round
                                                dense
                                                ripple
                                                title="Server mute"
                                                @click.stop="adminServerMute(avaInfo.sessionId)"
                                            ></q-btn>
                                            <q-btn
                                                icon="logout"
                                                text-color="negative"
                                                flat
                                                round
                                                dense
                                                ripple
                                                title="Kick player"
                                                @click.stop="adminKick(avaInfo.sessionId)"
                                            ></q-btn>
                                            <q-btn
                                                icon="remove_circle"
                                                text-color="negative"
                                                flat
                                                round
                                                dense
                                                ripple
                                                title="Ban player"
                                                @click.stop=""
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
                                            :step="10"
                                            snap
                                            :color="avaInfo.muted || avaInfo.volume === 0 ? 'red' : 'primary'"
                                            style="width: calc(100% - 48px);"
                                            :model-value="avaInfo.volume"
                                            @update:model-value="(value) => updateVolume(avaInfo.sessionId, value)"
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
        <!-- <q-inner-loading :showing="">
            <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading> -->
    </OverlayShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import OverlayShell from "../OverlayShell.vue";
import { Store, Mutations as StoreMutations, AvatarInfo } from "@Store/index";
import { DomainMgr } from "@Modules/domain";
import { Renderer } from "@Modules/scene";
import { Uuid } from "@vircadia/web-sdk";

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
        propsToPass: { type: Object, default: () => ({}) },
        // Component Specific
        localWorld: { type: Boolean, default: true },
        previewWorld: { type: String, default: undefined },
        friends: { type: Boolean, default: false },
        connections: { type: Boolean, default: false }
    },

    components: {
        OverlayShell
    },

    data: () => ({
        showMoreOptions: {} as { [key: string]: boolean },
        // Following is legacy test code. Can be removed when real stuff is working
        peopleList: [] as PeopleEntry[],
        testLocal: [
            {
                displayName: "Hallo",
                username: "nani",
                sessionUUID: "{123e4567-e89b-12d3-a456-426614174000}",
                volume: 100,
                muted: true,
                admin: false
            },
            {
                displayName: "Waifu",
                username: "testerino",
                sessionUUID: "{56556655-12d3-12d3-a456-426614174000}",
                volume: 90,
                muted: false,
                admin: true
            }
        ],
        testPreview: [
            {
                displayName: "World",
                username: "preview",
                sessionUUID: "{65464565-12d3-12d3-a456-426614174000}",
                volume: 100,
                muted: true,
                admin: false
            },
            {
                displayName: "Preview",
                username: "world",
                sessionUUID: "{76566666-12d3-12d3-a456-426614174000}",
                volume: 90,
                muted: false,
                admin: true
            }
        ],
        testFriends: [
            {
                displayName: "We",
                username: "wut",
                sessionUUID: "{96666687-12d3-12d3-a456-426614174000}",
                volume: 100,
                muted: true,
                admin: false
            },
            {
                displayName: "RFriends",
                username: "hay",
                sessionUUID: "{43999992-12d3-12d3-a456-426614174000}",
                volume: 90,
                muted: false,
                admin: true
            }
        ],
        testConnections: [
            {
                displayName: "Nice",
                username: "to",
                sessionUUID: "{654-12d3-12d3-a456-426614174000}",
                volume: 100,
                muted: true,
                admin: false
            },
            {
                displayName: "Meet",
                username: "you",
                sessionUUID: "{321-12d3-12d3-a456-426614174000}",
                volume: 90,
                muted: false,
                admin: true
            }
        ]
    }),

    methods: {
        // Load test data. Can be removed when real code is working
        loadPeopleList() {
            if (this.localWorld === true) {
                this.peopleList = this.testLocal;
            } else if (this.previewWorld) {
                this.peopleList = this.testPreview;
            } else if (this.friends === true) {
                this.peopleList = this.testFriends;
            } else if (this.connections === true) {
                this.peopleList = this.testConnections;
            }
        },

        // Get the profile picture for this avatar or 'undefined' if none
        // Note: can methods be async since fetching the profile picture is a network op
        // Note: is this fetched through the domain-server? Here we have sessionID, not accountID.
        getProfilePicture(pAvaInfo: AvatarInfo): string | undefined {
            // Should store profile pictures after retrieving and then pull each
            // subsequent one from cache instead of hitting metaverse every time.

            // This is filler functionality to enable the UI to be developed more correctly now.
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const dn = this.getDisplayName(pAvaInfo);
            if (dn && dn === "testerino") {
                return "https://cdn.quasar.dev/img/avatar4.jpg";
            }
            return undefined;
        },

        // Get the avatar's display name from the info.
        getDisplayName(pAvaInfo: AvatarInfo): string {
            return pAvaInfo.displayName ?? "anonymous";
        },

        // Update the volume of a given avatar.
        updateVolume(sessionId: Uuid, value: number | null) {
            if (value) {
                Store.commit(StoreMutations.UPDATE_AVATAR_VALUE, {
                    sessionId,
                    field: "volume",
                    value
                });
            }
        },

        // Complement the value of the muted data for this particular avatar.
        complementMuted(pAvaInfo: AvatarInfo): void {
            const newMute = !pAvaInfo.muted;
            Store.commit(StoreMutations.UPDATE_AVATAR_VALUE, {
                sessionId: pAvaInfo.sessionId,
                field: "muted",
                value: newMute
            });
        },

        teleportToAvatar(pAvaInfo: AvatarInfo) {
            Renderer.getScene().teleportMyAvatarToOtherPeople(pAvaInfo.sessionId.stringify());
        },

        adminServerMute(sessionId: Uuid): void {
            const domainServer = DomainMgr.ActiveDomain?.DomainClient;
            if (domainServer) {
                domainServer.users.mute(sessionId);
            }
        },

        adminKick(sessionId: Uuid): void {
            const domainServer = DomainMgr.ActiveDomain?.DomainClient;
            if (domainServer) {
                domainServer.users.kick(sessionId);
            }
        }
    },

    created: function() {
        // By default, the people list will load a list of people in your world.
        // However, in the future the list can and should be reused to load lists
        // of friends, previews of users in worlds, etc.
        // this.loadPeopleList();
    }
});
</script>
