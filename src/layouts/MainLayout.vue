<!--
//  MainLayout.vue
//
//  Created by Kalila L. on May 9th, 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
-->

<template>
    <q-layout class="full-height" id="mainLayout" view="lHh Lpr lFf">
        <q-header id="header" elevated>
            <div class="row no-wrap">
                <q-toolbar
                    class="col-4"
                >
                    <q-btn
                        flat
                        round
                        icon="account_circle"
                        aria-label="User Menu"
                        @click="toggleUserMenu"
                    />

                    <q-toolbar-title>
                        {{ getLocation }}
                    </q-toolbar-title>
                </q-toolbar>

                <q-toolbar
                    class="col-8"
                >
                    <q-input rounded outlined v-model="locationInput" class="q-mr-md" label="Connect to" />
                    <q-btn-group push>
                        <q-btn push label="Connect" icon="login" @click="connect" />
                        <q-btn push label="Disconnect" icon="close" @click="disconnect" />
                    </q-btn-group>
                    <q-space />

                    <div>Vircadia Web v{{ $store.state.globalConsts.APP_VERSION }}</div>
                </q-toolbar>
            </div>
        </q-header>

        <q-drawer
            v-model="userMenuOpen"
            show-if-above
            bordered
        >

            <q-img class="" src="https://cdn.quasar.dev/img/material.png" style="height: 150px">
                <div class="absolute-bottom bg-transparent">
                    <q-avatar size="56px" class="q-mb-sm">
                        <img :src="getProflePicture">
                    </q-avatar>
                    <div class="text-weight-bold">{{ $store.state.account.username ? $store.state.account.username : "Guest" }}</div>
                    <div>{{ getLocation }}</div>
                </div>
            </q-img>

            <div class="q-mini-drawer-hide absolute" style="top: 100px; right: -21px">
                <q-btn
                    round
                    unelevated
                    color="accent"
                    icon="chevron_left"
                    @click="userMenuOpen = false"
                />
            </div>

            <q-scroll-area
                style="height: calc(100% - 150px);"
            >
                <q-list>
                    <template v-for="(menuItem, index) in userMenu" :key="index">
                        <q-item-label
                            v-if="menuItem.isCategory"
                            header
                        >
                            {{ menuItem.label }}
                        </q-item-label>
                        <q-item
                            v-else
                            clickable
                            v-ripple
                        >
                            <q-item-section avatar>
                                <q-icon :name="menuItem.icon" />
                            </q-item-section>
                            <q-item-section>
                                {{ menuItem.label }}
                            </q-item-section>
                        </q-item>
                        <q-separator :key="'sep' + index" v-if="menuItem.separator" />
                    </template>
                </q-list>
            </q-scroll-area>

        </q-drawer>

        <q-page-container class="full-height">
            <MainScene/>
        </q-page-container>

        <q-dialog v-model="audioDialog" persistent>
            <Audio></Audio>
        </q-dialog>
    </q-layout>
</template>

<script>
// Modules
import { AudioInput } from '../modules/audio/input/input';
// Components
import MainScene from '../components/MainScene';
import Audio from '../components/settings/Audio';

export default {
    name: 'MainLayout',

    components: {
        MainScene,
        Audio
    },

    data: () => ({
        audioDialog: false,
        // Toolbar
        locationInput: '',
        // User Menu
        userMenuOpen: false,
        userMenu: [
            {
                icon: 'account_circle',
                label: 'Account',
                link: '',
                isCategory: false,
                separator: true
            },
            {
                icon: 'public',
                label: 'Explore',
                link: '',
                isCategory: false,
                separator: true
            },
            {
                icon: 'settings',
                label: 'Settings',
                link: '',
                isCategory: true,
                separator: false
            },
            {
                icon: 'headphones',
                label: 'Audio',
                link: '',
                isCategory: false,
                separator: true
            }
        ]
    }),

    mounted: function () {
        this.mountAudioInputClass();
    },

    computed: {
        getLocation: function () {
            if (this.$store.state.location.current) {
                return this.$store.state.location.current;
            } else {
                return this.$store.state.location.state;
            }
        },
        getProflePicture: function () {
            if (this.$store.state.account.profilePicture) {
                return this.$store.state.account.profilePicture;
            } else {
                return '../assets/vircadia-icon.svg';
            }
        }
    },

    methods: {
        // Bootstrapping
        mountAudioInputClass: function () {
            this.$store.commit('mutate', {
                property: 'audio',
                update: true,
                with: {
                    input: new AudioInput(this.$store, 'audio.input')
                }
            });
        },

        // Drawers
        toggleUserMenu: function () {
            this.userMenuOpen = !this.userMenuOpen;
        },

        // Connections
        connect: function () {
            console.info('Connecting to...', this.locationInput);
        },

        disconnect: function () {
            console.info('Disconnecting from...', this.$store.state.location.current);
        }
    }
};
</script>
