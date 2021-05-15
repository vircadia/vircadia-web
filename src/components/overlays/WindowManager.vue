<!--
//  WindowManager.vue
//
//  Created by Kalila L. & Heather Anderson on May 14th, 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
-->

<template>
    <div v-for="overlay in overlays" :key="overlay">
        <component :is="overlay" @overlay-action="onAction(overlay, $event)" />
    </div>
</template>

<script>
export default {
    // TODO: Needs to be renamed to OverlayManager
    name: 'WindowManager',

    props: {
        // Primary
        // parentSize: { type: Object, required: true }
    },

    data: () => ({
        overlays: []
    }),

    methods: {
        onAction (overlay, action) {
            const index = this.overlays.indexOf(overlay);

            switch (action) {
            case 'select':
                this.overlays.splice(index, 1);
                this.overlays.push(overlay);
                break;
            case 'close':
                this.overlays.splice(index, 1);
                break;
            default:
                window.alert('Action not supported: ' + action);
                break;
            }
        },

        openOverlay (overlay) {
            const index = this.overlays.indexOf(overlay);

            if (index >= 0) {
                this.overlays.splice(index, 1);
            }

            this.overlays.push(overlay);
        }
    }
};
</script>
