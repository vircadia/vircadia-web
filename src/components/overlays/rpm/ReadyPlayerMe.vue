<!--
//  ReadyPlayerMe.vue
//
//  Created by Giga on 27 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
-->

<style lang="scss" scoped>
</style>

<template>
    <OverlayShell
        icon="face"
        title="Ready Player Me"
        :managerProps="propsToPass"
        :defaultHeight="600"
        :defaultWidth="800"
        :defaultLeft="300"
        :hoverShowBar="false"
        :style="{
            'box-shadow': '0 1px 5px rgb(0 0 0 / 20%), 0 2px 2px rgb(0 0 0 / 14%), 0 3px 1px -2px rgb(0 0 0 / 12%)',
            border: 'none'
        }"
    >
        <q-card
            class="column no-wrap items-stretch full-height"
            style="background: transparent; box-shadow: none;"
        >
            <iframe
                id="rpm_frame"
                title="Ready Player Me"
                name="ReadyPlayerMe"
                width="800"
                height="600"
                allowfullscreen="false"
                allowpaymentrequest="false"
                allow="camera *; microphone *; clipboard-write"
                frameBorder="0"
                style="width: 100%;height: 100%;"
            ></iframe>
        </q-card>
    </OverlayShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Renderer } from "@Modules/scene";

import OverlayShell from "../OverlayShell.vue";

interface RPMEvent extends MessageEvent {
    data: string
}
interface RPMEventData {
    eventName: string,
    source: string,
    data: {
        id: string,
        url: string
    }
}

export default defineComponent({
    name: "ReadyPlayerMe",

    props: {
        // Primary
        propsToPass: { type: Object, default: () => ({}) }
    },

    components: {
        OverlayShell
    },

    data() {
        return {
            frame: {} as HTMLIFrameElement,
            subdomain: "vircadia"
        };
    },

    methods: {
        parse(event: RPMEvent): RPMEventData | null {
            try {
                return JSON.parse(event.data) as RPMEventData;
            } catch (error) {
                return null;
            }
        },

        subscribe(event: RPMEvent) {
            const json = this.parse(event);

            if (json?.source !== "readyplayerme") {
                return;
            }

            // Susbribe to all events sent from Ready Player Me once frame is ready
            if (this.frame.contentWindow && json?.eventName === "v1.frame.ready") {
                this.frame.contentWindow.postMessage(
                    JSON.stringify({
                        target: "readyplayerme",
                        type: "subscribe",
                        eventName: "v1.**"
                    }),
                    "*"
                );
            }

            // Get avatar GLB URL
            if (json?.eventName === "v1.avatar.exported") {
                const avatarUrl = json.data.url;
                console.log(`Avatar URL: ${avatarUrl}`);
                this.setAvatar(avatarUrl);
                // document.getElementById("frame").hidden = true;
            }

            // Get user id
            if (json?.eventName === "v1.user.set") {
                console.log(`User with id ${json.data.id} set: ${JSON.stringify(json)}`);
            }
        },

        setAvatar(url: string): void {
            const scene = Renderer.getScene();
            scene.loadMyAvatar(url)
                // .catch is a syntax error!?
                // eslint-disable-next-line @typescript-eslint/dot-notation
                .catch((err) => console.log("Failed to load avatar:", err));
        }
    },

    mounted() {
        this.frame = document.getElementById("rpm_frame") as HTMLIFrameElement;
        this.frame.src = `https://${this.subdomain}.readyplayer.me/avatar?frameApi`;

        window.addEventListener("message", (event) => {
            this.subscribe(event);
        });
        document.addEventListener("message", (event) => {
            this.subscribe(event as RPMEvent);
        });
    }
});
</script>
