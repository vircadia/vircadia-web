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
        :defaultHeight="800"
        :defaultWidth="800"
        :defaultLeft="300"
        :defaultTop="10"
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
            <div
                v-if="loading && !error"
                class="absolute-center"
                style="display: flex;flex-flow: column nowrap;align-items: center;gap: 10px;text-align: center;"
            >
                <q-spinner
                    size="xl"
                    class="q-ma-none"
                    style="margin-left: -16px;"
                ></q-spinner>
                <p v-if="longLoad">This is taking longer than usual. Hang on...</p>
                <p v-else>Loading avatar...</p>
            </div>
            <p
                v-if="error"
                class="absolute-center bg-negative q-px-md q-py-sm rounded-borders"
            >Something went wrong. Please try again.</p>
            <iframe
                v-show="!loading && !error"
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
import { AvatarStoreInterface } from "@Base/modules/avatar/StoreInterface";
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
interface RPMRenderData {
    renders: string[]
}

export default defineComponent({
    name: "ReadyPlayerMeOverlay",

    props: {
        // Primary
        propsToPass: { type: Object, default: () => ({}) }
    },

    components: {
        OverlayShell
    },

    data() {
        return {
            loading: false,
            longLoad: false,
            error: false,
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
            }

            // Get user id
            if (json?.eventName === "v1.user.set") {
                console.log(`User with id ${json.data.id} set: ${JSON.stringify(json)}`);
            }
        },

        renderAvatarImage(ID: string) {
            const url = AvatarStoreInterface.getModelData(ID, "file");
            const params = {
                model: url,
                // Type of portrait to render.
                scene: "fullbody-portrait-v1-transparent",
                // Facial expression. Default: Empty.
                "blendShapes": {
                    "Wolf3D_Avatar": {
                        "mouthSmile": 0.5
                    }
                }
            };
            const request = new XMLHttpRequest();
            request.open("POST", "https://render.readyplayer.me/render");
            request.setRequestHeader("Content-type", "application/json");
            request.send(JSON.stringify(params));
            request.onload = function() {
                // Parse the response and load the image.
                const response = JSON.parse(request.responseText) as RPMRenderData;
                const image = response.renders[0];
                AvatarStoreInterface.setModelData(ID, "image", image);
            };
        },

        setAvatar(url: string): void {
            const scene = Renderer.getScene();
            this.loading = true;
            const longLoadTimeout = window.setTimeout(() => {
                this.longLoad = true;
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            }, 15000);

            const ID = AvatarStoreInterface.createNewModel({
                name: "New Avatar",
                image: "",
                file: url,
                scale: 1,
                starred: true
            });
            this.renderAvatarImage(ID);

            scene.loadMyAvatar(url)
                .then(() => {
                    this.loading = false;
                    window.clearTimeout(longLoadTimeout);
                    this.longLoad = false;
                    this.closeOverlay();
                })
                .catch((err) => {
                    console.warn("Failed to load RPM avatar:", err);
                    this.loading = false;
                    window.clearTimeout(longLoadTimeout);
                    this.longLoad = false;
                    this.error = true;
                    window.setTimeout(() => {
                        this.error = false;
                    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                    }, 1000);
                });
        },

        closeOverlay(): void {
            this.$emit("overlay-action", "close");
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
