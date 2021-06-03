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
testing
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
        loadPlacesList () {
            // if (this.localWorld === true) {
            //     this.peopleList = this.testLocal;
            // } else if (this.previewWorld) {
            //     this.peopleList = this.testPreview;
            // } else if (this.friends === true) {
            //     this.peopleList = this.testFriends;
            // } else if (this.connections === true) {
            //     this.peopleList = this.testConnections;
            // }
        }
    },

    created: function () {
        // By default, the people list will load a list of people in your world.
        // However, in the future the list can and should be reused to load lists
        // of friends, previews of users in worlds, etc.
        this.loadPlacesList();
    },

    mounted: function () {
    }
};
</script>
