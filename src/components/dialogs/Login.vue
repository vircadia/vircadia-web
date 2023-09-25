<!--
//  Login.vue
//
//  Created by Kalila L. on May 18th, 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
-->

<template>
    <q-bar class="bar">
        <div class="title">{{ applicationStore.theme.globalServiceTerm }} Login</div>
        <q-space />
        <q-btn dense flat icon="close" @click="$emit('close')" />
    </q-bar>

    <q-card-section class="q-pt-none">
        <q-tabs
            v-model="tab"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
        >
            <q-tab name="metaverseLogin" label="Login" />
            <q-tab name="metaverseRegister" label="Register" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="metaverseLogin">
                <MetaverseLogin @success="$emit('close')" />
            </q-tab-panel>

            <q-tab-panel name="metaverseRegister">
                <MetaverseRegister @success="tab = 'metaverseLogin'" />
            </q-tab-panel>
        </q-tab-panels>
    </q-card-section>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { applicationStore } from "@Stores/index";

export default defineComponent({
    name: "LoginDialog",

    emits: ["close"],

    setup() {
        return {
            applicationStore,
            tab: ref("metaverseLogin")
        };
    }
});
</script>
