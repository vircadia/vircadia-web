<!--
//  OverlayShell.vue
//
//  Created by Kalila L. on May 13th, 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
-->

<style lang="scss" scoped>
    .outer {
        position: absolute;
        left: 400px;
        top: 200px;
    }

    div.title {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
</style>

<template>
    <q-card
        class="outer no-wrap items-stretch"
        ref="overlayCard"
        @mouseover="onHoverStart"
        @mouseleave="onHoverEnd"
        :style="{
            // Dimensions
            height: overlayHeight + 'px', // Should these two be a string so that we can define vh or whatever at will?
            width: overlayWidth + 'px',
            // Positioning
            position: overlayPosition,
            top: overlayTop,
            bottom: overlayBottom,
            right: overlayRight,
            left: overlayLeft,
            // Styling
            background: overlayBackground,
            border: overlayBorder,
            'box-shadow': overlayBoxShadow
        }"
    >
        <q-slide-transition>
            <q-bar
                v-show="!hoverShowBar || overlayHovered"
            >
                <q-icon :name="icon" />
                <div class="title">{{ title }}</div>

                <q-space />

                <q-btn dense flat icon="minimize" />
                <q-btn dense flat icon="crop_square" />
                <q-btn dense flat icon="close" />
            </q-bar>
        </q-slide-transition>

        <q-card-section
            class="full-height q-pa-none"
        >
            <slot />
        </q-card-section>
    </q-card>
</template>

<script>
export default {
    props: {
        // Primary
        icon: { type: String, required: true },
        title: { type: String, required: true },
        hoverShowBar: { type: Boolean, default: false },
        // Dimensions
        defaultHeight: { type: Number, default: 400 },
        defaultWidth: { type: Number, default: 300 },
        // Positioning
        position: { type: String, default: 'absolute' },
        top: { type: String, default: '200' },
        bottom: { type: String },
        right: { type: String },
        left: { type: String, default: '400' },
        // Styling
        background: { type: String, default: 'unset' },
        border: { type: String, default: 'unset' },
        boxShadow: { type: String, default: 'unset' }
    },

    data () {
        return {
            // Settings and Properties
            overlayHeight: this.defaultHeight,
            overlayWidth: this.defaultWidth,
            overlayPosition: this.position,
            overlayTop: this.top,
            overlayBottom: this.bottom,
            overlayRight: this.right,
            overlayLeft: this.left,
            overlayBackground: this.background,
            overlayBorder: this.border,
            overlayBoxShadow: this.boxShadow,
            // Internal
            overlayHovered: false
        };
    },

    computed: {
    },

    methods: {
        onHoverStart () {
            this.overlayHovered = true;
        },

        onHoverEnd () {
            this.overlayHovered = false;
        }
    },

    mounted () {
    }
};
</script>
