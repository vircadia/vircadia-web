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

<style lang="scss" scoped>
.rebindPrompt {
    padding: 2px 1ch;
    border: 2px dashed currentColor;
}
</style>

<template>
    <OverlayShell
        icon="gamepad"
        title="Controls"
        :managerProps="propsToPass"
        :defaultHeight="500"
        :defaultWidth="400"
    >
        <q-card
            class="flex column no-wrap full-height"
            style="background: transparent;box-shadow: none;"
        >
            <q-tabs v-model="tab">
                <q-tab name="mouse" icon="mouse" label="">
                    <q-tooltip class="bg-black">Mouse</q-tooltip>
                </q-tab>
                <q-tab name="keyboard" icon="keyboard" label="">
                    <q-tooltip class="bg-black">Keyboard</q-tooltip>
                </q-tab>
                <q-tab name="camera" icon="camera" label="">
                    <q-tooltip class="bg-black">Camera</q-tooltip>
                </q-tab>
            </q-tabs>
            <q-tab-panels
                v-model="tab"
                animated
                class="full-height"
                style="background: transparent;"
            >
                <q-tab-panel name="mouse">
                    <q-scroll-area class="full-height">
                        <q-list class="q-pb-md">
                            <q-item>
                                <q-item-section>
                                    <q-item-label>Sensitivity</q-item-label>
                                </q-item-section>
                                <q-item-section class="q-pl-xl">
                                    <q-slider
                                        name="mouseSensitivity"
                                        thumbSize="26px"
                                        :min="0"
                                        :max="100"
                                        :step="5"
                                        snap
                                        v-model="mouseSensitivity"
                                    />
                                </q-item-section>
                                <q-item-section side style="min-width: 5ch;">
                                    <output for="mouseSensitivity">{{ mouseSensitivity }}</output>
                                </q-item-section>
                            </q-item>
                            <q-item>
                                <q-item-section>
                                    <q-item-label>Acceleration</q-item-label>
                                </q-item-section>
                                <q-item-section class="q-pl-sm">
                                    <q-toggle
                                        name="mouseAcceleration"
                                        v-model="mouseAcceleration"
                                    />
                                </q-item-section>
                                <q-item-section side style="min-width: 5ch;">
                                    <output for="mouseAcceleration">{{ mouseAcceleration ? `On` : `Off` }}</output>
                                </q-item-section>
                            </q-item>
                            <q-item>
                                <q-item-section>
                                    <q-item-label>Invert</q-item-label>
                                </q-item-section>
                                <q-item-section class="q-pl-sm">
                                    <q-toggle
                                        name="mouseInvert"
                                        v-model="mouseInvert"
                                    />
                                </q-item-section>
                                <q-item-section side style="min-width: 5ch;">
                                    <output for="mouseInvert">{{ mouseInvert ? `On` : `Off` }}</output>
                                </q-item-section>
                            </q-item>
                        </q-list>
                    </q-scroll-area>
                </q-tab-panel>

                <q-tab-panel name="keyboard" class="q-px-none q-pb-none column no-wrap items-stretch">
                    <p
                        class="q-mt-xs q-mb-xs text-caption text-grey-6"
                        style="width: 100%;text-align: center;"
                    >Select a control to rebind it.</p>
                    <p
                        class="q-mb-sm text-caption text-grey-6"
                        style="width: 100%;text-align: center;"
                    >Press ESC to cancel.</p>
                    <q-scroll-area class="full-height">
                        <q-list class="q-pb-md" @keydown.prevent.stop="listenForRebind($event)">
                            <template v-for="(category, key) of userStore.controls.keyboard" :key="key">
                                <!-- <q-separator /> -->
                                <q-item-label header style="text-transform: capitalize;">{{ key }}</q-item-label>
                                <template v-for="bind of category" :key="(bind.name as string)">
                                    <q-item
                                        clickable
                                        v-ripple
                                        :inset-level="1"
                                        @click="currentlyBinding = bind"
                                    >
                                        <q-item-section>
                                            <q-item-label>{{ bind.name }}</q-item-label>
                                        </q-item-section>
                                        <q-item-section>
                                            <div
                                                v-if="currentlyBinding?.name === bind.name"
                                                class="rebindPrompt text-grey-6"
                                            >Press any key...</div>
                                            <div v-else class="row q-gutter-x-sm">
                                                <kbd>{{ KeyboardSettings.formatKeyName(bind.keycode) }}</kbd>
                                                <q-icon
                                                    v-if="KeyboardSettings.getSpecialKeyIndicator(bind.keycode)"
                                                    :name="KeyboardSettings.getSpecialKeyIndicator(bind.keycode)?.icon"
                                                    :title="KeyboardSettings.getSpecialKeyIndicator(bind.keycode)?.message"
                                                    class="q-mt-sm"
                                                />
                                            </div>
                                        </q-item-section>
                                    </q-item>
                                </template>
                            </template>
                        </q-list>
                    </q-scroll-area>
                </q-tab-panel>

                <q-tab-panel name="camera" class="q-px-none q-pb-none column no-wrap items-stretch">
                    <q-scroll-area class="full-height">
                        <q-list class="q-pb-md">
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
                        </q-list>
                    </q-scroll-area>
                </q-tab-panel>
            </q-tab-panels>
        </q-card>
    </OverlayShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { userStore } from "@Stores/index";
import { KeyboardSettings, type Keybind } from "@Base/modules/avatar/controller/inputs/keyboardSettings";
import { MouseSettingsController } from "@Base/modules/avatar/controller/inputs/mouseSettings";
import OverlayShell from "../OverlayShell.vue";

export default defineComponent({
    name: "ControlsOverlay",
    props: {
        // Primary.
        propsToPass: { type: Object, default: () => ({}) }
    },
    components: {
        OverlayShell
    },
    setup() {
        return {
            userStore,
            KeyboardSettings
        };
    },
    data() {
        return {
            tab: "mouse",
            currentlyBinding: undefined as Keybind | undefined
        };
    },
    computed: {
        mouseSensitivity: {
            get(): number {
                return this.userStore.controls.mouse.sensitivity;
            },
            set(value: number) {
                MouseSettingsController.sensitivity = value;
            }
        },
        mouseAcceleration: {
            get(): boolean {
                return this.userStore.controls.mouse.acceleration;
            },
            set(value: boolean) {
                MouseSettingsController.acceleration = value;
            }
        },
        mouseInvert: {
            get(): boolean {
                return this.userStore.controls.mouse.invert;
            },
            set(value: boolean) {
                MouseSettingsController.invert = value;
            }
        }
    },
    methods: {
        listenForRebind(event: KeyboardEvent): void {
            const keycode = event.code;
            if (!keycode || !this.currentlyBinding) {
                return;
            }
            KeyboardSettings.rebindControl(this.currentlyBinding, keycode);
            this.currentlyBinding = undefined;
        }
    }
});
</script>
