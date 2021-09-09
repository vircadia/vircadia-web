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
        :propsToPass="propsToPass"
        :defaultHeight="300"
        :defaultWidth="300"
        :defaultLeft="0"
        :hoverShowBar="true"
        :style="{ 'background': 'rgba(0, 0, 0, 0.3)', 'box-shadow': 'none', border: 'none' }"
    >
        <q-card
            class="column no-wrap items-stretch full-height"
            style="background: transparent; box-shadow: none;"
        >
            <q-scroll-area
                class="col"
                style="height: 100%"
            >
                <q-list>
                    <q-item v-for="person in peopleList" :key="person.sessionUUID" class="q-mb-sm" clickable v-ripple>
                        <q-item-section avatar>
                            <q-avatar color="primary">
                                <img v-if="getProfilePicture(person.username)" :src="getProfilePicture(person.username)">
                                <span v-else>{{ person.displayName.charAt(0) }}</span>
                            </q-avatar>
                        </q-item-section>

                        <q-item-section>
                            <q-item-label>{{ person.displayName }}</q-item-label>
                            <q-item-label v-if="person.admin" caption lines="1">Admin</q-item-label>
                        </q-item-section>
                        <q-item-section avatar>
                            <q-icon
                                @click='person.muted = !person.muted'
                                :color="person.muted ? 'red' : 'primary'"
                                :name="person.muted ? 'volume_off' : 'volume_up'"
                            />
                        </q-item-section>
                        <q-item-section>
                            <q-slider
                                v-model="person.volume"
                                :min="0"
                                :max="100"
                                :color="person.muted ? 'red' : 'primary'"
                            />
                        </q-item-section>
                    </q-item>
                </q-list>
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

        getProfilePicture(username: string): string | null {
            // Should store profile pictures after retrieving and then pull each
            // subsequent one from cache instead of hitting metaverse every time.

            // This is filler functionality to enable the UI to be developed more correctly now.
            if (username === "testerino") {
                return "https://cdn.quasar.dev/img/avatar4.jpg";
            }
            return null;
        }
    },

    created: function() {
        // By default, the people list will load a list of people in your world.
        // However, in the future the list can and should be reused to load lists
        // of friends, previews of users in worlds, etc.
        this.loadPeopleList();
    }

    // mounted: function () {
    // }
});
</script>
