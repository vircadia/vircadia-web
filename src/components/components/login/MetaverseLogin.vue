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
    <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
        <q-input
            v-model="username"
            filled
            label="Username"
            hint="Enter your username."
            lazy-rules
            :rules="[
                (val) => (val && val.length > 0) || 'Please enter a username.',
            ]"
        />

        <q-input
            v-model="password"
            filled
            label="Password"
            :type="showPassword ? 'text' : 'password'"
            hint="Enter your password."
            lazy-rules
            :rules="[
                (val) => (val && val.length > 0) || 'Please enter a password.',
            ]"
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
            <q-btn
                label="Reset"
                type="reset"
                color="primary"
                flat
                class="q-mr-sm"
            />
            <q-btn label="Login" type="submit" color="primary" />
        </div>
    </q-form>

    <q-expansion-item
        v-model="metaverseServerSettingExpansion"
        expand-icon="language"
        label="Advanced"
        expand-icon-class="text-red"
        header-class="clean-header"
    >
        <q-card class="no-padding">
            <q-card-section class="no-padding">
                <q-input
                    v-model="metaverseServerSetting"
                    label="Metaverse Server"
                >
                    <template v-slot:before>
                        <q-icon name="language" size="18px" color="primary" />
                    </template>

                    <template v-slot:append>
                        <q-icon
                            name="save"
                            size="18px"
                            color="primary"
                            @click="
                                metaverseServerStore = metaverseServerSetting;
                                metaverseServerSettingExpansion = false;
                            "
                            class="cursor-pointer"
                        />
                    </template>
                </q-input>
            </q-card-section>
        </q-card>
    </q-expansion-item>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Account } from "@Modules/account";
import { Utility } from "@Modules/utility";

export default defineComponent({
    name: "MetaverseLogin",

    emits: ["closeDialog"],

    data: function() {
        return {
            username: "",
            password: "",
            showPassword: false,
            metaverseServerSettingExpansion: false,
            metaverseServerSetting: this.$store.state.metaverse.server
        };
    },
    computed: {
        metaverseServerStore: {
            get() {
                return this.$store.state.metaverse.server;
            },
            async set(newValue: string) {
                await Utility.metaverseConnectionSetup(
                    newValue
                );
            }
        }
    },

    methods: {
        async onSubmit() {
            try {
                const loginResponse = await Account.login(
                    this.username,
                    this.password,
                    this.$store.state.metaverse.server
                );

                if (loginResponse) {
                    this.$q.notify({
                        type: "positive",
                        textColor: "white",
                        icon: "cloud_done",
                        message: "Welcome " + this.username + "."
                    });

                    this.$emit("closeDialog");
                } else {
                    this.$q.notify({
                        type: "negative",
                        textColor: "white",
                        icon: "warning",
                        message: "Login attempted failed"
                    });
                }
            } catch (result) {
                // TODO: what is the type of "result"? Define the fields
                this.$q.notify({
                    type: "negative",
                    textColor: "white",
                    icon: "warning",
                    // message: "Login attempted failed: " + result.error
                    message: "Login attempted failed: " + (result as string)
                });
            }
        },

        onReset() {
            this.username = "";
            this.password = "";
        }
    }
});
</script>
