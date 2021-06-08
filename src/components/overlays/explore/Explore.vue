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
                </q-list>
            </q-scroll-area>
        </q-card>
        <!-- <q-inner-loading :showing="">
            <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading> -->
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
    }),

    computed: {
    },

    methods: {
    },

    created: function () {

    },

    mounted: function () {
    }
};
</script>
