<!--
//  Menu.vue
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
        icon="menu"
        title="Menu"
        :managerProps="propsToPass"
        :defaultHeight="300"
        :defaultWidth="200"
        :defaultLeft="10"
        :defaultTop="10"
        :hoverShowBar="false"
        :style="{ 'background': 'rgba(0, 0, 0, 0.6)', 'box-shadow': 'none', border: 'none' }"
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
                    <template v-for="(menuItem, index) in userMenu" :key="index">
                        <q-item-label
                            v-if="menuItem.isCategory"
                            header
                        >
                            {{ menuItem.label }}
                        </q-item-label>
                        <q-item
                            v-else
                            clickable
                            v-ripple
                            @click="menuItem.action ? menuItem.action
                                : $emit('overlay-action', 'openOverlay:' + (menuItem.link || menuItem.label))"
                        >
                            <q-item-section avatar>
                                <q-icon :name="menuItem.icon" />
                            </q-item-section>
                            <q-item-section>
                                {{ menuItem.label }}
                            </q-item-section>
                        </q-item>
                        <q-separator :key="'sep' + index" v-if="menuItem.separator" />
                    </template>
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

export default defineComponent({
    name: "People",

    props: {
        // Primary
        propsToPass: { type: Object, default: () => ({}) }
    },

    components: {
        OverlayShell
    },

    data: () => ({
        userMenu: [
            {
                icon: "people",
                label: "People",
                link: "",
                isCategory: false,
                separator: true
            },
            {
                icon: "chat",
                label: "Chat",
                link: "ChatWindow",
                isCategory: false,
                separator: true
            },
            {
                icon: "travel_explore",
                label: "Explore",
                link: "",
                isCategory: false,
                separator: true
            }
        ]
    }),

    computed: {
    },

    methods: {

    }

    // mounted: function () {
    // }
});
</script>
