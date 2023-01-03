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
                            title="Field-of-View"
                        >
                            Field of View
                        </q-item-section>
                        <q-item-section>
                            <div class="row q-gutter-x-md">
                                <input
                                    type="range"
                                    name="fieldOfView"
                                    min="70"
                                    max="120"
                                    step="5"
                                    v-model="fieldOfView"
                                >
                                <output for="fieldOfView">{{ fieldOfView }}</output>
                            </div>
                        </q-item-section>
                    </q-item>
                </q-list>
            </q-scroll-area>
        </q-card>
    </OverlayShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import OverlayShell from "../OverlayShell.vue";
import { Mutations as StoreMutations } from "@Store/index";

export default defineComponent({
    name: "Graphics",
    props: {
        // Primary.
        propsToPass: { type: Object, default: () => ({}) }
    },
    components: {
        OverlayShell
    },
    computed: {
        fieldOfView: {
            get(): number {
                return this.$store.state.graphics.fieldOfView;
            },
            set(value: number | string) {
                this.$store.commit(StoreMutations.MUTATE, {
                    property: "graphics.fieldOfView",
                    value: typeof value === "string" ? parseInt(value, 10) : value
                });
            }
        }
    }
});
</script>
