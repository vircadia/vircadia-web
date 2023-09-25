<!--
//  Controls.vue
//
//  Created by Giga on Dec 14th, 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
-->

<style lang="scss">
</style>

<template>
    <OverlayShell
        icon="desktop_windows"
        title="Graphics"
        :managerProps="propsToPass"
        :defaultHeight="500"
        :defaultWidth="400"
    >
        <q-card
            class="column no-wrap items-stretch full-height"
            style="background: transparent;box-shadow: none;"
        >
            <q-scroll-area class="q-mt-md full-height">
                <q-list class="q-pb-md">
                    <q-item>
                        <q-item-section
                            title="FPS Counter"
                        >
                            FPS Counter
                        </q-item-section>
                        <q-item-section class="q-pl-sm">
                            <q-toggle
                                name="fpsCounter"
                                v-model="userStore.graphics.fpsCounter"
                            />
                        </q-item-section>
                        <q-item-section side style="min-width: 5ch;">
                            <output for="fpsCounter">{{ userStore.graphics.fpsCounter ? `On` : `Off` }}</output>
                        </q-item-section>
                    </q-item>
                    <q-item>
                        <q-item-section
                            title="Field of View"
                        >
                            Field of View
                        </q-item-section>
                        <q-item-section class="q-pl-xl">
                            <q-slider
                                name="fieldOfView"
                                thumbSize="26px"
                                :min="70"
                                :max="120"
                                :step="5"
                                snap
                                v-model="fieldOfView"
                            />
                        </q-item-section>
                        <q-item-section side style="min-width: 5ch;">
                            <output for="fieldOfView">{{ fieldOfView }}</output>
                        </q-item-section>
                    </q-item>
                    <q-item>
                        <q-item-section
                            title="Camera Bobbing"
                        >
                            Camera Bobbing
                        </q-item-section>
                        <q-item-section class="q-pl-sm">
                            <q-toggle
                                name="bloom"
                                v-model="userStore.graphics.cameraBobbing"
                            />
                        </q-item-section>
                        <q-item-section side style="min-width: 5ch;">
                            <output for="bloom">{{ userStore.graphics.cameraBobbing ? `On` : `Off` }}</output>
                        </q-item-section>
                    </q-item>
                    <q-item>
                        <q-item-section
                            title="Bloom"
                        >
                            Bloom
                        </q-item-section>
                        <q-item-section class="q-pl-sm">
                            <q-toggle
                                name="bloom"
                                v-model="userStore.graphics.bloom"
                            />
                        </q-item-section>
                        <q-item-section side style="min-width: 5ch;">
                            <output for="bloom">{{ userStore.graphics.bloom ? `On` : `Off` }}</output>
                        </q-item-section>
                    </q-item>
                    <q-item>
                        <q-item-section
                            title="Fast Approximate Anti-Aliasing"
                        >
                        FXAA
                        </q-item-section>
                        <q-item-section class="q-pl-sm">
                            <q-toggle
                                name="fxaaEnabled"
                                v-model="userStore.graphics.fxaaEnabled"
                            />
                        </q-item-section>
                        <q-item-section side style="min-width: 5ch;">
                            <output for="fxaaEnabled">{{ userStore.graphics.fxaaEnabled ? `On` : `Off` }}</output>
                        </q-item-section>
                    </q-item>
                    <q-item>
                        <q-item-section
                            title="Multisample Anti-Aliasing"
                        >
                            MSAA
                        </q-item-section>
                        <q-item-section class="q-pl-xl">
                            <q-slider
                                name="msaa"
                                thumbSize="26px"
                                :min="1"
                                :max="8"
                                :step="1"
                                snap
                                v-model="msaa"
                            />
                        </q-item-section>
                        <q-item-section side style="min-width: 5ch;">
                            <output for="msaa">{{ msaa === 1 ? `Off` : `&times;${msaa}` }}</output>
                        </q-item-section>
                    </q-item>
                    <q-item>
                        <q-item-section
                            title="Sharpen"
                        >
                            Sharpen
                        </q-item-section>
                        <q-item-section class="q-pl-sm">
                            <q-toggle
                                name="sharpen"
                                v-model="userStore.graphics.sharpen"
                            />
                        </q-item-section>
                        <q-item-section side style="min-width: 5ch;">
                            <output for="sharpen">{{ userStore.graphics.sharpen ? `On` : `Off` }}</output>
                        </q-item-section>
                    </q-item>
                </q-list>
            </q-scroll-area>
        </q-card>
    </OverlayShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { userStore } from "@Stores/index";
import OverlayShell from "../OverlayShell.vue";

export default defineComponent({
    name: "GraphicsOverlay",
    props: {
        // Primary.
        propsToPass: { type: Object, default: () => ({}) }
    },
    components: {
        OverlayShell
    },
    setup() {
        return {
            userStore
        };
    },
    computed: {
        fieldOfView: {
            get(): number {
                return this.userStore.graphics.fieldOfView;
            },
            set(value: number | string) {
                this.userStore.graphics.fieldOfView = typeof value === "string" ? parseInt(value, 10) : value;
            }
        },
        msaa: {
            get(): number {
                return this.userStore.graphics.msaa;
            },
            set(value: number | string) {
                this.userStore.graphics.msaa = typeof value === "string" ? parseInt(value, 10) : value;
            }
        }
    }
});
</script>
