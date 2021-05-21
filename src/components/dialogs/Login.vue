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
    <q-card-section>
        <div class="row no-wrap items-center">
            <div class="col text-h4 ellipsis">
                Metaverse
            </div>
        </div>

    </q-card-section>

    <q-separator />

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

<script>
import MetaverseLogin from '../components/login/MetaverseLogin.vue';
import MetaverseRegister from '../components/login/MetaverseRegister.vue';

export default {
    name: 'Login',

    emits: ['closeDialog'],

    props: {
    },

    components: {
        MetaverseLogin,
        MetaverseRegister
    },

    data: () => ({
        tab: 'metaverseLogin'
    }),

    computed: {
    },

    methods: {
        onMetaverseRegister () {
            this.tab = 'metaverseLogin';
        }
    },

    created: function () {
    },

    mounted: function () {
    }
};
</script>
