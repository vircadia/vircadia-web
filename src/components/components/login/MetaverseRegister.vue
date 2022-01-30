<!--
//  MetaverseRegister.vue
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
            v-model="email"
            filled
            label="Email"
            hint="Enter your email."
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please enter an email.']"
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

        <q-input
            v-model="confirmPassword"
            filled
            label="Confirm Password"
            :type="showConfirmPassword ? 'text' : 'password'"
            hint="Enter your password again."
            lazy-rules
            :rules="[ val => val && val.length > 0 && val === password || 'Please ensure your passwords match.']"
        >
            <template v-slot:append>
                <q-icon
                    :name="showConfirmPassword ? 'visibility' : 'visibility_off'"
                    class="cursor-pointer"
                    @click="showConfirmPassword = !showConfirmPassword"
                />
            </template>
        </q-input>

        <div align="right">
            <q-btn label="Reset" type="reset" color="primary" flat class="q-mr-sm" />
            <q-btn label="Register" type="submit" color="primary"/>
        </div>
    </q-form>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useQuasar } from "quasar";

import { Account } from "@Modules/account";

export default defineComponent({
    name: "MetaverseRegister",

    props: ["metaverseUrl"],

    data: () => ({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        showPassword: false,
        showConfirmPassword: false
    }),

    methods: {
        async onSubmit() {
            const $q = useQuasar();
            try {
                const awaiting = await Account.createAccount(this.username, this.password, this.email, this.metaverseUrl);
                const result = {        // TODO: temp to replace code above
                    data: {
                        accountWaitingVerification: awaiting
                    }
                };
                this.$emit("register-success");

                if (result.data.accountWaitingVerification === true) {
                    this.$q.notify({
                        type: "info",
                        textColor: "white",
                        icon: "email",
                        timeout: 0,
                        message: "Check your email " + this.email + " to complete registration.",
                        actions: [{ label: "Dismiss", color: "white", handler: () => { /* ... */ } }]
                    });
                } else {
                    this.$q.notify({
                        type: "positive",
                        textColor: "white",
                        icon: "cloud_done",
                        message: "Successfully registered " + this.username + "."
                    });
                }
            } catch (result) {
                // TODO: what is the type of "result"?
                $q.notify({
                    type: "negative",
                    textColor: "white",
                    icon: "warning",
                    // message: "Failed to register: " + result.error
                    message: "Failed to register: " + (result as string)
                });
            }
        },

        onReset() {
            this.username = "";
            this.email = "";
            this.password = "";
            this.confirmPassword = "";
        }
    }
});
</script>
