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
        :propsToPass="propsToPass"
        :defaultHeight="500"
        :defaultWidth="400"
        :defaultLeft="50"
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
                    placeholder="Search"
                    class="col"
                >
                    <template v-slot:append>
                        <q-icon name="search" />
                    </template>
                </q-input>
            </div>
            <q-scroll-area
                class="col"
            >
                <q-list style="max-Width: 400px;" :showing="!loading">
                    <q-item v-for="place in filteredAndSortedData" :key="place.placeId" clickable v-ripple>
                        <q-item-section side top>
                            <q-icon name="info" color="white" />
                        </q-item-section>

                        <q-item-section top>
                            <q-item-label lines="1">{{ place.name }}</q-item-label>
                            <q-item-label caption lines="1">{{ place.description }}</q-item-label>
                        </q-item-section>

                        <q-item-section side top>
                            <q-badge color="white" text-color="black">
                                {{ place.current_attendance }}
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

<script>
import OverlayShell from '../OverlayShell.vue';

export default {
    name: 'Explore',

    props: {
        // Primary
        propsToPass: { type: Object, default: () => ({}) }
    },

    components: {
        OverlayShell
    },

    data: () => ({
        placesList: [],
        loading: false,
        filterText: ''
    }),

    computed: {
        filteredAndSortedData: function () {
            let returnData = this.placesList;

            returnData = returnData.filter((item) => {
                return (!item.name.toLowerCase().indexOf(this.filterText.toLowerCase()));
            });

            returnData = returnData.sort((a, b) => {
                if (a.current_attendance > b.current_attendance) {
                    return -1;
                }
                if (a.current_attendance < b.current_attendance) {
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
        async loadPlacesList () {
            this.loading = true;
            const placesResult = await this.$store.state.Explore.retrievePlaces(this.$store.state.metaverseConfig.server);
            this.placesList = placesResult.data.places;
            this.loading = false;
        }
    },

    created: function () {
        this.loadPlacesList();
    },

    mounted: function () {
    }
};
</script>
