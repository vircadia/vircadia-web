<!--
//  Explore.vue
//
//  Created by Kalila L. on June 8th, 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
-->

<style lang="scss" scoped>
    .q-field {
        background-color: rgba(0, 0, 0, 0.4);
    }
    .exploreItem {
        background-size: cover; background-position: center;
    }
</style>
<style lang="scss">
    .exploreScrollContainer .q-scrollarea__content{
        width: 100%;
    }
    .exploreItem{
        background-size: cover; background-position: center;
    }
    .exploreItem .textShadow {
        text-shadow: 1px 1px 2px black, 0 0 25px black, 0 0 5px black;
    }
    .exploreItem .q-item__section {
        z-index: 1;
    }
    .exploreItemBackground{
        position: absolute;
        left: 0px;
        top: 0px;
        width: 100%;
        height: 100%;
        backdrop-filter: blur(3px);
        z-index: 0;
    }
    .exploreLabel{
        width: fit-content;
        padding: 1px 6px;
        border-radius: 4px;
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
        :hoverShowBar="false"
        :style="{ border: 'none' }"
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
                class="col exploreScrollContainer"
            >
                <q-list :showing="!loading">
                    <q-item v-for="place in filteredAndSortedData"
                            :key="place.placeId"
                            clickable
                            v-ripple
                            @click="openLocation(place.address)"
                            :style="place.thumbnail ? 'background-image: url(' + place.thumbnail +');' : '' "
                            class="exploreItem"
                            >
                        <div class="exploreItemBackground"></div>
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
                            <q-item-label lines="1"
                            :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'" class="exploreLabel">
                                {{ place.name }}
                            </q-item-label>
                            <q-item-label caption lines="1"
                            :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'" class="exploreLabel">
                                {{ place.description }}
                            </q-item-label>
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
            <div
                class="row absolute-bottom q-px-md q-py-sm"
                style="align-items: center;gap: 16px;border-top: 1px solid #8888;"
            >
                <p class="q-ma-none">Stuck?</p>
                <q-btn
                    size="sm"
                    color="purple"
                    @click="resetPosition()"
                >Reset position</q-btn>
            </div>
        </q-card>
        <q-inner-loading :showing="loading">
            <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>
    </OverlayShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Utility } from "@Modules/utility";
import { Places, PlaceEntry } from "@Modules/places";
import { Renderer } from "@Modules/scene";
import Log from "@Modules/debugging/log";

import OverlayShell from "../OverlayShell.vue";

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
        async loadPlacesList(): Promise<void> {
            this.loading = true;
            const placesResult = await Places.getActiveList();
            this.placesList = placesResult;
            this.loading = false;
        },

        async openLocation(path: string): Promise<void> {
            Log.info(Log.types.UI, `Connecting to... ${path}`);
            // eslint-disable-next-line @typescript-eslint/unbound-method
            await Utility.connectionSetup(path);
        },

        openDetails(place: PlaceEntry): void {
            alert("Not currently implemented: Show details - " + place.name);
        },

        async visitIconCallback() {
            if (this.filterText !== "") {
                await this.openLocation(this.filterText);
            }
        },

        resetPosition(): void {
            // Reset the player's position back to the world's spawn point.
            const scene = Renderer.getScene();
            scene.resetMyAvatarPositionAndOrientation();
        }
    },

    created: async function(): Promise<void> {
        await this.loadPlacesList();
    }

    // mounted: function () {
    // }
});
</script>
