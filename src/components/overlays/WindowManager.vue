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
    <div v-for="overlay in overlays" :key="overlay.name">
        <component :is="overlay.name" :propsToPass="overlay" @overlay-action="onAction(overlay.name, $event)" />
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
        getOverlayIndex (overlayName) {
            for (let i = 0; i < this.overlays.length; i++) {
                if (this.overlays[i].name === overlayName) {
                    return i;
                }
            };

            return -1;
        },

        onAction (overlay, action) {
            const index = this.getOverlayIndex(overlay);

            switch (action) {
            case 'select': {
                const splice = this.overlays.splice(index, 1)[0];
                this.overlays.push(splice);
                break;
            }
            case 'minimize':
                this.overlays[index].overlayStatus = 'minimized';
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
            const index = this.getOverlayIndex(overlay);

            if (index >= 0) {
                const splice = this.overlays.splice(index, 1)[0];
                splice.overlayStatus = 'restored';
                this.overlays.push(splice);
            } else {
                this.overlays.push({
                    'name': overlay,
                    'overlayStatus': 'restored'
                });
            }
        }
    }
};
</script>
