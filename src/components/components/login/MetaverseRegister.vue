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
        class="column q-gutter-y-md"
        ref="registrationForm"
        @submit="submit"
    >
        <q-input
            v-model="username"
            filled
            dense
            label="Username"
            hint="Enter your username."
            lazy-rules
            :rules="[val => val && val.length > 0 || 'Please enter a username.']"
            :disable="loading"
        />

        <q-input
            v-model="email"
            filled
            dense
            label="Email"
            hint="Enter your email."
            lazy-rules
            :rules="[val => val && val.length > 0 || 'Please enter an email.']"
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
            :rules="[val => val && val.length > 0 || 'Please enter a password.']"
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
            :rules="[val => val && val.length > 0 && val === password || 'Please ensure your passwords match.']"
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

        <q-btn
            label="Register"
            type="submit"
            color="primary"
            class="q-ml-auto"
            :loading="loading"
        />
    </q-form>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Account } from "@Modules/account";

export default defineComponent({
    name: "MetaverseRegister",

    emits: ["success", "failure"],

    data() {
        return {
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            showPassword: false,
            showConfirmPassword: false,
            loading: false
        };
    },

    methods: {
        async submit() {
            this.loading = true;
            const registerSuccessful = await Account.createAccount(this.username, this.password, this.email);
            this.loading = false;

            if (!registerSuccessful) {
                this.$q.notify({
                    type: "negative",
                    textColor: "white",
                    icon: "warning",
                    message: "Something went wrong..."
                });
                this.$emit("failure");
                return;
            }

            if (registerSuccessful.accountAwaitingVerification) {
                this.$q.notify({
                    type: "info",
                    textColor: "white",
                    icon: "email",
                    timeout: 0,
                    message: `Check your email to complete registration.`,
                    actions: [{ label: "Dismiss", color: "white" }]
                });
            } else {
                this.$q.notify({
                    type: "positive",
                    textColor: "white",
                    icon: "cloud_done",
                    message: "Registration successful."
                });
            }
            (this.$refs.registrationForm as HTMLFormElement).reset();
            this.$emit("success");
        }
    }
});
</script>
