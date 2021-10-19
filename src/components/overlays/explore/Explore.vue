<!--
//  Explore.vue
//
//  Created by Kalila L. on June 8th, 2021.
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
        icon="travel_explore"
        title="Explore"
        :managerProps="propsToPass"
        :defaultHeight="500"
        :defaultWidth="400"
        :defaultLeft="250"
        :defaultTop="10"
        :hoverShowBar="true"
        :style="{ 'background': 'rgba(0, 0, 0, 0.3)', 'box-shadow': 'none', border: 'none' }"
    >
        <q-card
            class="column no-wrap items-stretch full-height"
            style="background: transparent; box-shadow: none;"
        >
            <div class="row">
                <q-input
                    borderless
                    dense
                    filled
                    debounce="300"
                    v-model="filterText"
                    placeholder="Search or enter location"
                    class="col"
                    append-icon="mdi-location-enter"
                    v-on:keyup.enter="visitIconCallback"
                >
                    <template v-slot:append>
                        <q-icon name="search" />
                        <q-icon name="launch" @click="visitIconCallback" clickable v-ripple/>
                    </template>
                </q-input>
            </div>
            <q-scroll-area
                class="col"
            >
                <q-list style="max-Width: 400px;" :showing="!loading">
                    <q-item v-for="place in filteredAndSortedData"
                            :key="place.placeId"
                            clickable
                            v-ripple
                            @click="openLocation(place.address)">
                        <q-item-section side top>
                            <q-btn round
                                color="white"
                                icon="fas fa-info"
                                clickable
                                @click.stop="openDetails(place)"
                                class="text-purple"
                                size="10px"/>
                        </q-item-section>

                        <q-item-section top>
                            <q-item-label lines="1">{{ place.name }}</q-item-label>
                            <q-item-label caption lines="1">{{ place.description }}</q-item-label>
                        </q-item-section>

                        <q-item-section side top>
                            <q-badge color="white" text-color="black">
                                {{ place.currentAttendance }}
                                <q-icon
                                name="people"
                                size="14px"
                                class="q-ml-xs"
                                />
                            </q-badge>
                        </q-item-section>
                    </q-item>
                </q-list>
            </q-scroll-area>
        </q-card>
        <q-inner-loading :showing="loading">
            <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>
    </OverlayShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import OverlayShell from "../OverlayShell.vue";

export interface PlaceEntry {
    name: string;
    placeId: string;
    address: string;
    description: string;
    currentAttendance: number;
}

export default defineComponent({
    name: "Explore",

    props: {
        // Primary
        propsToPass: { type: Object, default: () => ({}) }
    },

    components: {
        OverlayShell
    },

    data() {
        return {
            placesList: [] as PlaceEntry[],
            loading: false,
            filterText: ""
        };
    },

    computed: {
        filteredAndSortedData: function(): PlaceEntry[] {
            let returnData = this.placesList;

            returnData = returnData.filter((item) => !item.name.toLowerCase().indexOf(this.filterText.toLowerCase()));

            returnData = returnData.sort((a, b) => {
                if (a.currentAttendance > b.currentAttendance) {
                    return -1;
                }
                if (a.currentAttendance < b.currentAttendance) {
                    return 1;
                }
                if (a.name.toLowerCase() < b.name.toLowerCase()) {
                    return -1;
                }
                if (a.name.toLowerCase() > b.name.toLowerCase()) {
                    return 1;
                }
                return 0;
            });

            return returnData;
        }
    },

    methods: {
        // This next 'disable' is because of the commented out call to Explore. Remove when coded.
        // eslint-disable-next-line @typescript-eslint/require-await
        async loadPlacesList(): Promise<void> {
            this.loading = true;
            // TODO: figure out Explore updates and class instance
            // const placesResult = await this.$store.state.Explore.retrievePlaces();
            const placesResult = new Array<PlaceEntry>();
            this.placesList = placesResult;
            this.loading = false;
        },

        openLocation(path: string): void {
            alert("Not currently implemented: Open location - " + path);
        },

        openDetails(place: PlaceEntry): void {
            alert("Not currently implemented: Show details - " + place.name);
        },

        visitIconCallback() {
            if (this.filterText !== "") {
                this.openLocation(this.filterText);
            }
        }
    },

    created: async function(): Promise<void> {
        await this.loadPlacesList();
    }

    // mounted: function () {
    // }
});
</script>
