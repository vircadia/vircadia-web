<!--
//  Conference.vue
//
//  Created by Nshan G. on Oct 13th, 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
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
        icon="groups"
        title="Conference"
        :managerProps="propsToPass"
        :defaultHeight="300"
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
                style="height: 100%"
            >
            <q-list v-if="Array.from(applicationStore.conference.activeRooms.keys()).length > 0">
                <q-item
                    v-for="room in applicationStore.conference.activeRooms"
                    :key="room.name"
                    class="q-mb-sm"
                    clickable
                    v-ripple
                >
                    <q-item-section avatar style="min-width: 20px;" title="Meeting is in progress">
                        <div style="position: relative;display: flex;justify-content: center;align-items: center;">
                            <q-spinner-puff
                                size="md"
                                color="red"
                                class="absolute"
                            />
                            <q-icon
                                name="fiber_manual_record"
                                size="xs"
                                color="red"
                            />
                        </div>
                    </q-item-section>
                    <q-item-section>
                        <q-item-label>{{ room.name }}</q-item-label>
                        <q-badge
                            :text-color="$q.dark.isActive ? 'white' : 'black'"
                            class="q-mt-xs"
                            :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'"
                            style="width: fit-content;"
                            title="There are 0 people in this meeting."
                        >
                            <!--TODO: Show the number of people in the meeting, instead of "0"-->
                            0
                            <q-icon
                                name="people"
                                size="14px"
                                class="q-ml-xs"
                            />
                        </q-badge>
                    </q-item-section>
                    <q-item-section side>
                        <q-btn
                            color="cyan-12"
                            text-color="dark"
                            @click="joinConferenceRoom(room as JitsiRoomInfo)"
                        >Join</q-btn>
                    </q-item-section>
                </q-item>
            </q-list>
            <p v-else class="text-subtitle1 text-grey text-center q-mt-md">There are no meetings in this domain.</p>
            </q-scroll-area>
        </q-card>
    </OverlayShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { applicationStore } from "@Stores/index";
import { type JitsiRoomInfo } from "@Stores/application-store";
import OverlayShell from "../OverlayShell.vue";

export default defineComponent({
    name: "ConferenceOverlay",

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
            isAdmin: true
        };
    },

    computed: {
    },

    methods: {
        joinConferenceRoom(room: JitsiRoomInfo) {
            this.applicationStore.joinConferenceRoom(room);
            this.$emit("overlay-action", "openOverlay:Jitsi");
        }
    }
    // mounted: function () {
    // }
});
</script>
