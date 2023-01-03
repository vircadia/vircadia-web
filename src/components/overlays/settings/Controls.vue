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
.keyboardKey {
    display: flex;
    justify-content: center;
    align-items: center;
    width: fit-content;
    min-width: 3.5ch;
    padding: 2px 1ch;
    color: white;
    font-size: 1.0rem;
    text-align: center;
    background: radial-gradient(circle at center, #888 20%, #556);
    background-position: center;
    background-size: 170%;
    border-radius: 5px;
    box-shadow: 0px 3px 0px #444;
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
            class="column no-wrap items-stretch full-height"
            style="background: transparent;box-shadow: none;"
        >
            <p
                class="q-mt-sm q-mb-none text-caption text-grey-6"
                style="width: 100%;text-align: center;"
            >Select a control to rebind it.</p>
            <p
                class="q-mb-sm text-caption text-grey-6"
                style="width: 100%;text-align: center;"
            >Press ESC to cancel.</p>
            <q-scroll-area class="full-height">
                <q-list class="q-pb-md" @keydown.prevent.stop="listenForRebind($event)">
                    <template v-for="(category, key) of $store.state.controls" :key="key">
                        <!-- <q-separator /> -->
                        <q-item-label header style="text-transform: capitalize;">{{ key }}</q-item-label>
                        <template v-for="(bind, control) of category" :key="control">
                            <q-item
                                clickable
                                v-ripple
                                :inset-level="1"
                                @click="setCurrentlyBinding(key, control as string)"
                            >
                                <q-item-section>
                                    <q-item-label>{{ bind.name }}</q-item-label>
                                </q-item-section>
                                <q-item-section>
                                    <div
                                        v-if="currentlyBinding.control === control"
                                        class="rebindPrompt text-grey-6"
                                    >Press any key...</div>
                                    <div v-else class="row q-gutter-x-sm">
                                        <div class="keyboardKey">{{ formatKeyName(bind.keybind) }}</div>
                                        <q-icon
                                            v-if="specialKeyIndicator(bind.keybind)"
                                            :name="specialKeyIndicator(bind.keybind)?.icon"
                                            :title="specialKeyIndicator(bind.keybind)?.message"
                                            class="q-mt-sm"
                                        />
                                    </div>
                                </q-item-section>
                            </q-item>
                        </template>
                    </template>
                </q-list>
            </q-scroll-area>
        </q-card>
    </OverlayShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import OverlayShell from "../OverlayShell.vue";
import { Store, Mutations as StoreMutations } from "@Store/index";

export default defineComponent({
    name: "Controls",
    props: {
        // Primary.
        propsToPass: { type: Object, default: () => ({}) }
    },
    components: {
        OverlayShell
    },
    data() {
        return {
            currentlyBinding: {
                category: undefined as keyof typeof Store.state.controls | undefined,
                control: undefined as string | undefined
            }
        };
    },
    methods: {
        formatKeyName(keyCode: string): string {
            // Letters.
            if (keyCode.includes("Key")) {
                return keyCode.split("Key")[1];
            }
            // Top-row numbers.
            if (keyCode.includes("Digit")) {
                return keyCode.split("Digit")[1];
            }
            // Number pad numbers.
            if (keyCode.includes("Numpad")) {
                return keyCode.split("Numpad")[1];
            }
            // Arrow keys.
            const arrowKeys = {
                "ArrowUp": "↑",
                "ArrowDown": "↓",
                "ArrowLeft": "←",
                "ArrowRight": "→"
            } as { [key: string]: string };
            if (keyCode in arrowKeys) {
                return arrowKeys[keyCode];
            }
            // Control keys.
            const controlKeys = {
                "ShiftLeft": "Left Shift",
                "ShiftRight": "Right Shift",
                "ControlLeft": "Left Control",
                "ControlRight": "Right Control",
                "AltLeft": "Left Alt",
                "AltRight": "Right Alt"
            } as { [key: string]: string };
            if (keyCode in controlKeys) {
                return controlKeys[keyCode];
            }
            // Other (symbols, specials, etc).
            return keyCode;
        },
        specialKeyIndicator(keyCode: string): { icon: string, message: string } | undefined {
            if (keyCode.includes("Control") || keyCode.includes("Alt")) {
                return {
                    icon: "priority_high",
                    message: "This key may have unintended side effects"
                };
            }
            if (keyCode.includes("Numpad")) {
                return {
                    icon: "dialpad",
                    message: "This key is on the number pad"
                };
            }
            if (keyCode.includes("Gamepad")) {
                return {
                    icon: "gamepad",
                    message: "This button is on a gamepad"
                };
            }
            return undefined;
        },
        keybindAlreadyInUse(keybind: string): boolean {
            // eslint-disable-next-line max-len
            return Boolean(Object.entries(Store.state.controls).find((category) => Object.entries(category[1]).find((value) => value[1].keybind === keybind)));
        },
        setCurrentlyBinding(category?: keyof typeof Store.state.controls, control?: string): void {
            if (!category || !control) {
                this.currentlyBinding.category = undefined;
                this.currentlyBinding.control = undefined;
            }
            this.currentlyBinding.category = category;
            this.currentlyBinding.control = control;
        },
        listenForRebind(event: KeyboardEvent): void {
            const keycode = event.code;
            // Disallow binding Escape, NumLock, Meta keys, and Function keys.
            if (
                keycode === ""
                || keycode === "Escape"
                || keycode === "NumLock"
                || keycode.includes("Meta")
                || (/^F[0-9]{1,2}$/iu).test(keycode)
            ) {
                this.currentlyBinding.category = undefined;
                this.currentlyBinding.control = undefined;
            }
            // Disallow binding multiple controls to the same key.
            if (this.keybindAlreadyInUse(keycode)) {
                if (
                    this.currentlyBinding.category
                    && this.currentlyBinding.control
                    && Store.state.controls[this.currentlyBinding.category][this.currentlyBinding.control].keybind !== keycode
                ) {
                    this.$q.notify({
                        type: "negative",
                        textColor: "white",
                        icon: "warning",
                        message: `"${this.formatKeyName(keycode)}" is already in use.`
                    });
                }
                this.currentlyBinding.category = undefined;
                this.currentlyBinding.control = undefined;
            }
            // Otherwise, bind the new key.
            if (this.currentlyBinding.category && this.currentlyBinding.control) {
                // Reset the `currentlyBinding` vars ASAP to reduce the risk of binding a bounced keypress.
                const category = this.currentlyBinding.category;
                const key = this.currentlyBinding.control;
                this.currentlyBinding.category = undefined;
                this.currentlyBinding.control = undefined;
                // Rebind the key.
                this.rebindKey(category, key, event.code);
            }
        },
        rebindKey(category: keyof typeof Store.state.controls, control: string, newBind: string): void {
            if (category in Store.state.controls && control in Store.state.controls[category]) {
                Store.commit(StoreMutations.MUTATE, {
                    property: `controls.${category}.${control}.keybind`,
                    value: newBind
                });
            }
        }
    }
});
</script>
