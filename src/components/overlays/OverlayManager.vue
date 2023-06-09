<!--
//  OverlayManager.vue
//
//  Created by Kalila L. & Heather Anderson on May 14th, 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
-->

<template>
    <div v-for="overlay in overlays" :key="overlay.name">
        <component :is="overlay.name + 'Overlay'" :propsToPass="overlay" @overlay-action="onAction(overlay.name, $event)"/>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Log from "@Modules/debugging/log";

export interface Overlay {
    name: string;
    overlayStatus: string;
}

export default defineComponent({
    name: "OverlayManager",

    data: () => ({
        overlays: [] as Overlay[]
    }),

    methods: {
        getOverlayIndex(overlayName: string): number {
            for (let i = 0; i < this.overlays.length; i++) {
                if (this.overlays[i].name === overlayName) {
                    return i;
                }
            }

            return -1;
        },

        onAction(overlay: string, eventAction: string) {
            let parameter = "";
            let action = eventAction;
            Log.debug(Log.types.OTHER, `OverlayManager.onAction: ${overlay}: ${action}`);
            const index = this.getOverlayIndex(overlay);

            // check if the action is in the format command:parameter
            if (action.indexOf(":") > -1) {
                parameter = action.split(":")[1];
                action = action.split(":")[0];
            }

            switch (action) {
                case "select": {
                    const splice = this.overlays.splice(index, 1)[0];
                    this.overlays.push(splice);
                    break;
                }
                case "minimize":
                    if (this.overlays[index].overlayStatus === "minimized") {
                        this.overlays[index].overlayStatus = "restored";
                    } else {
                        this.overlays[index].overlayStatus = "minimized";
                    }
                    break;
                case "maximize":
                    if (this.overlays[index].overlayStatus === "maximized") {
                        this.overlays[index].overlayStatus = "restored";
                    } else {
                        this.overlays[index].overlayStatus = "maximized";
                    }
                    break;
                case "close":
                    this.overlays.splice(index, 1);
                    break;
                case "openOverlay":
                    this.openOverlay(parameter);
                    break;
                case "toggleOverlay":
                    this.toggleOverlay(parameter);
                    break;
                default:
                    window.alert("Action not supported: " + action);
                    break;
            }
        },

        openOverlay(overlay: string) {
            Log.debug(Log.types.OTHER, `OverlayManager.openOverlay: ${overlay}`);
            const index = this.getOverlayIndex(overlay);

            if (index >= 0) {
                const splice = this.overlays.splice(index, 1)[0];
                splice.overlayStatus = "restored";
                this.overlays.push(splice);
            } else {
                this.overlays.push({
                    "name": overlay,
                    "overlayStatus": "restored"
                });
            }
        },

        toggleOverlay(overlay: string) {
            Log.debug(Log.types.OTHER, `OverlayManager.toggleOverlay: ${overlay}`);
            const index = this.getOverlayIndex(overlay);

            if (index >= 0) {
                this.overlays.splice(index, 1);
            } else {
                this.overlays.push({
                    "name": overlay,
                    "overlayStatus": "restored"
                });
            }
        }
    }
});
</script>
