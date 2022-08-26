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
    .q-field {
        background-color: rgba(0, 0, 0, 0.4);
    }
</style>

<template>
    <OverlayShell
        icon="people"
        title="People"
        :managerProps="propsToPass"
        :defaultHeight="300"
        :defaultWidth="300"
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
                <q-list v-if="$store.state.avatars.avatarsInfo.values().length > 0">
                    <q-item
                        v-for="avaInfo in $store.state.avatars.avatarsInfo.values()"
                        :key="avaInfo.sessionId"
                        class="q-mb-sm"
                        clickable
                        v-ripple
                    >
                        <q-item-section avatar>
                            <q-avatar color="primary">
                                <img v-if="getProfilePicture(avaInfo)"
                                    :src="getProfilePicture(avaInfo)">
                                <span v-else>{{ getDisplayName(avaInfo) }}</span>
                            </q-avatar>
                        </q-item-section>

                        <q-item-section>
                            <q-item-label>{{ getDisplayName(avaInfo) }}</q-item-label>
                            <q-item-label v-if="avaInfo.isAdmin" caption lines="1">Admin</q-item-label>
                        </q-item-section>
                        <q-item-section avatar>
                            <q-icon
                                @click='complementMuted(avaInfo)'
                                :color="avaInfo.muted ? 'red' : 'primary'"
                                :name="avaInfo.muted ? 'volume_off' : 'volume_up'"
                            />
                        </q-item-section>
                        <!-- this slider does not work. Now to modify volume? Maybe a child component for slider?
                        <q-item-section>
                            <q-slider
                                v-model="avaInfo.volume"
                                :min="0"
                                :max="100"
                                :color="avaInfo.muted ? 'red' : 'primary'"
                            />
                        </q-item-section>
                        -->
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

    computed: {
    },

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

        // Get the profile picture for this avatar or 'null' if none
        // Note: can methods be async since fetching the profile picture is a network op
        // Note: is this fetched through the domain-server? Here we have sessionID, not accountID.
        getProfilePicture(pAvaInfo: AvatarInfo): string | null {
            // Should store profile pictures after retrieving and then pull each
            // subsequent one from cache instead of hitting metaverse every time.

            // This is filler functionality to enable the UI to be developed more correctly now.
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const dn = this.getDisplayName(pAvaInfo);
            if (dn && dn === "testerino") {
                return "https://cdn.quasar.dev/img/avatar4.jpg";
            }
            return null;
        },

        // Get the avatar's display name from the info.
        getDisplayName(pAvaInfo: AvatarInfo): string {
            return pAvaInfo.displayName ?? "...";
        },

        // complement the value of the muted data for this particular avatar
        // Must be done with MUTATE since the value is in $store
        complementMuted(pAvaInfo: AvatarInfo): void {
            const newMute = !pAvaInfo.muted;
            Store.commit(StoreMutations.UPDATE_AVATAR_VALUE, {
                sessionId: pAvaInfo.sessionId,
                field: "muted",
                value: newMute
            });
        }
    },

    created: function() {
        // By default, the people list will load a list of people in your world.
        // However, in the future the list can and should be reused to load lists
        // of friends, previews of users in worlds, etc.
        // this.loadPeopleList();
    }

    // mounted: function () {
    // }
});
</script>
