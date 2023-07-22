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
        @submit="submit"
        class="column q-gutter-y-md"
    >
        <q-input
            v-model="username"
            filled
            dense
            label="Username"
            hint="Enter your username."
            :disable="loading"
            :error="loginError"
            @focus="loginError = false"
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
            @focus="loginError = false"
        >
            <template v-slot:append>
                <q-icon
                    :name="showPassword ? 'visibility' : 'visibility_off'"
                    class="cursor-pointer"
                    @click="showPassword = !showPassword"
                />
            </template>
        </q-input>

        <q-btn
            label="Login"
            type="submit"
            color="primary"
            class="q-ml-auto"
            :disable="username.length <= 0 || password.length <= 0"
            :loading="loading"
        />
    </q-form>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Account } from "@Modules/account";

export default defineComponent({
    name: "MetaverseLogin",

    emits: ["success"],

    data() {
        return {
            username: "",
            password: "",
            showPassword: false,
            loading: false,
            loginError: false
        };
    },

    methods: {
        async submit(): Promise<void> {
            this.loading = true;
            const loginSuccessful = await Account.login(this.username, this.password);
            if (loginSuccessful) {
                this.$q.notify({
                    type: "positive",
                    textColor: "white",
                    icon: "cloud_done",
                    message: "Welcome " + this.username + "."
                });
                this.loginError = false;
                this.$emit("success");
            } else {
                this.$q.notify({
                    type: "negative",
                    textColor: "white",
                    icon: "warning",
                    message: "Please check your username/password."
                });
                this.loginError = true;
            }
            this.loading = false;
        }
    }
});
</script>
