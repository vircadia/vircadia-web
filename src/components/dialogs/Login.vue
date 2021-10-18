<!--
//  Login.vue
//
//  Created by Kalila L. on May 18th, 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
-->

<template>
    <q-bar class="bar"
    >
        <div class="title" >Metaverse Login</div>
        <q-space />
        <q-btn dense flat icon="close" @click="$emit('closeDialog', 'close')" />
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
                <MetaverseLogin @closeDialog="$emit('closeDialog')"></MetaverseLogin>
            </q-tab-panel>

            <q-tab-panel name="metaverseRegister">
                <MetaverseRegister @register-success="onMetaverseRegister"></MetaverseRegister>
            </q-tab-panel>
        </q-tab-panels>
    </q-card-section>
</template>

<script lang="ts">
import { defineComponent } from "vue";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Log from "@Modules/debugging/log";

import MetaverseLogin from "@Components/components/login/MetaverseLogin.vue";
import MetaverseRegister from "@Components/components/login/MetaverseRegister.vue";

export default defineComponent({
    name: "Login",

    emits: ["closeDialog"],

    components: {
        MetaverseLogin,
        MetaverseRegister
    },

    data: () => ({
        tab: "metaverseLogin"
    }),

    methods: {
        onMetaverseRegister() {
            this.tab = "metaverseLogin";
        }
    }
});
</script>
