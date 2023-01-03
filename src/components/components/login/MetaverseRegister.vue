<!--
//  MetaverseRegister.vue
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
        class="q-gutter-md"
        ref="registrationForm"
        @submit="onSubmit"
    >
        <q-input
            v-model="username"
            filled
            dense
            label="Username"
            hint="Enter your username."
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please enter a username.']"
            :disable="loading"
        />

        <q-input
            v-model="email"
            filled
            dense
            label="Email"
            hint="Enter your email."
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please enter an email.']"
            :disable="loading"
        />

        <q-input
            v-model="password"
            filled
            dense
            label="Password"
            :type="showPassword ? 'text' : 'password'"
            hint="Enter your password."
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please enter a password.']"
            :disable="loading"
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
            dense
            label="Confirm Password"
            :type="showConfirmPassword ? 'text' : 'password'"
            hint="Enter your password again."
            lazy-rules
            :rules="[ val => val && val.length > 0 && val === password || 'Please ensure your passwords match.']"
            :disable="loading"
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
            <q-btn label="Register" type="submit" color="primary" :loading="loading" />
        </div>
    </q-form>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { Account } from "@Modules/account";

export default defineComponent({
    name: "MetaverseRegister",

    data: () => ({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        showPassword: false,
        showConfirmPassword: false,
        loading: false
    }),

    emits: ["register-success", "register-failure"],

    methods: {
        async onSubmit() {
            this.loading = true;
            try {
                const result = await Account.createAccount(this.username, this.password, this.email);
                this.loading = false;

                if (!result) {
                    this.$q.notify({
                        type: "negative",
                        textColor: "white",
                        icon: "warning",
                        message: "Something went wrong..."
                    });
                    console.log("Registration failed:", result);
                    this.$emit("register-failure");
                    return;
                }

                if (result.accountAwaitingVerification === true) {
                    this.$q.notify({
                        type: "info",
                        textColor: "white",
                        icon: "email",
                        timeout: 0,
                        message: `Check your email "${this.email}" to complete registration.`,
                        actions: [{ label: "Dismiss", color: "white", handler: () => { /* ... */ } }]
                    });
                } else {
                    this.$q.notify({
                        type: "positive",
                        textColor: "white",
                        icon: "cloud_done",
                        message: "Successfully registered."
                    });
                }
                (this.$refs.registrationForm as HTMLFormElement).reset();
                this.$emit("register-success");
            } catch (error) {
                this.$q.notify({
                    type: "negative",
                    textColor: "white",
                    icon: "warning",
                    message: "Something went wrong..."
                });
                console.log("Registration failed:", error);
                this.$emit("register-failure");
                this.loading = false;
            }
        }
    }
});
</script>
