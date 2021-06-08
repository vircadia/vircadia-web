<!--
//  MetaverseLogin.vue
//
//  Created by Kalila L. on May 18th, 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
-->

<template>
    <q-form
        @submit="onSubmit"
        @reset="onReset"
        class="q-gutter-md"
    >
        <q-input
            v-model="username"
            filled
            label="Username"
            hint="Enter your username."
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please enter a username.']"
        />

        <q-input
            v-model="password"
            filled
            label="Password"
            :type="showPassword ? 'text' : 'password'"
            hint="Enter your password."
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please enter a password.']"
        >
            <template v-slot:append>
                <q-icon
                    :name="showPassword ? 'visibility' : 'visibility_off'"
                    class="cursor-pointer"
                    @click="showPassword = !showPassword"
                />
            </template>
        </q-input>

        <div align="right">
            <q-btn label="Reset" type="reset" color="primary" flat class="q-mr-sm" />
            <q-btn label="Login" type="submit" color="primary"/>
        </div>
    </q-form>
</template>

<script>
export default {
    name: 'MetaverseLogin',

    emits: ['closeDialog'],

    data: () => ({
        username: '',
        password: '',
        showPassword: false
    }),

    methods: {
        async onSubmit () {
            try {
                const result = await this.$store.state.Metaverse.login(this.$store.state.metaverseConfig.server, this.username, this.password);
                this.$store.state.Metaverse.commitLogin(this.username, result);

                this.$q.notify({
                    type: 'positive',
                    textColor: 'white',
                    icon: 'cloud_done',
                    message: 'Welcome ' + this.username + '.'
                });

                this.$emit('closeDialog');
            } catch (result) {
                this.$q.notify({
                    type: 'negative',
                    textColor: 'white',
                    icon: 'warning',
                    message: 'Login attempted failed: ' + result.error
                });
            }
        },

        onReset () {
            this.username = '';
            this.password = '';
        }
    }
};
</script>