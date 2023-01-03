<!--
//  MetaverseLogin.vue
//
//  Created by Kalila L. on May 18th, 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
-->

<template>
    <q-form
        @submit="onSubmit"
        class="q-gutter-md"
    >
        <q-input
            v-model="username"
            filled
            dense
            label="Username"
            hint="Enter your username."
            :disable="loading"
            :error="loginError"
            @focus="loginError = undefined"
        />

        <q-input
            v-model="password"
            filled
            dense
            label="Password"
            :type="showPassword ? 'text' : 'password'"
            hint="Enter your password."
            :disable="loading"
            :error="loginError"
            @focus="loginError = undefined"
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
            <q-btn label="Login" type="submit" color="primary" :disable="usernameEmpty || passwordEmpty" :loading="loading" />
        </div>
    </q-form>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Account } from "@Modules/account";

export default defineComponent({
    name: "MetaverseLogin",

    emits: ["closeDialog"],

    data: () => ({
        username: "",
        password: "",
        showPassword: false,
        loading: false,
        loginError: undefined as true | undefined
    }),

    computed: {
        usernameEmpty: function() {
            return this.username.length <= 0;
        },
        passwordEmpty: function() {
            return this.password.length <= 0;
        }
    },

    methods: {
        async onSubmit() {
            this.loading = true;
            try {
                const loginResponse = await Account.login(this.username, this.password);

                if (loginResponse) {
                    this.$q.notify({
                        type: "positive",
                        textColor: "white",
                        icon: "cloud_done",
                        message: "Welcome " + this.username + "."
                    });
                    this.loading = false;
                    this.loginError = undefined;
                    this.$emit("closeDialog");
                } else {
                    this.$q.notify({
                        type: "negative",
                        textColor: "white",
                        icon: "warning",
                        message: "Please check your username/password."
                    });
                    this.loading = false;
                    this.loginError = true;
                }
            } catch (result) {
                // TODO: what is the type of "result"? Define the fields
                this.$q.notify({
                    type: "negative",
                    textColor: "white",
                    icon: "warning",
                    message: "Login attempt failed: " + (result as string)
                });
                this.loading = false;
            }
        }
    }
});
</script>
