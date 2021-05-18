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

<script>
export default {
    name: 'MetaverseRegister',

    data: () => ({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        showPassword: false,
        showConfirmPassword: false
    }),

    computed: {

    },

    methods: {
        onSubmit () {
        },

        onReset () {
            this.username = '';
            this.email = '';
            this.password = '';
            this.confirmPassword = '';
        }
    },

    created: function () {
    },

    mounted: function () {
    }
};
</script>
