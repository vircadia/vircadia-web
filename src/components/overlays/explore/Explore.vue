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
        icon="public"
        title="Explore"
        :propsToPass="propsToPass"
        :defaultHeight="500"
        :defaultWidth="500"
        :defaultLeft="200"
        :hoverShowBar="false"
        :style="{ 'background': 'rgba(0, 0, 0, 0.3)', 'box-shadow': 'none', border: 'none' }"
    >
        <q-card
            class="column no-wrap items-stretch full-height"
            style="background: transparent; box-shadow: none;"
        >
            <q-scroll-area
                class="col"
            >
                <q-list>
                    <q-item v-for="place in placesList" :key="place.placeId" class="q-mb-sm" clickable v-ripple>
                        <q-item-section>
                            <q-item-label>{{ place.name }}</q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>
            </q-scroll-area>
        </q-card>
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
        placesList: []

    }),

    computed: {
    },

    methods: {
        async loadPlacesList () {
            const placesResult = await this.$store.state.Explore.retrievePlaces(this.$store.state.metaverseConfig.server);
            this.placesList = placesResult.data.places;
        }
    },

    created: function () {
        this.loadPlacesList();
    },

    mounted: function () {
    }
};
</script>
