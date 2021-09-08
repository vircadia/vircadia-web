<!--
//  MainLayout.vue
//
//  Created by Kalila L. on May 9th, 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
-->
<!--
    Display of the main page.
    The page is a usual Vue page with a hidden menu bar on the left controlled by
    an "account_circle" in the top menu bar.
    The page top bar contains connected information.
    Overlay dialogs are controlled by $store.state.dialog settings.
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

                    <div>{{ $store.state.globalConsts.APP_NAME }} {{ $store.state.globalConsts.APP_VERSION }}</div>
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
                        <img :src="getProfilePicture">
                    </q-avatar>
                    <div class="text-weight-bold">
                        {{ $store.state.account.isLoggedIn ? $store.state.account.username : "Guest" }}
                    </div>
                    <div>{{ getLocation }}</div>
                </div>
            </q-img>

            <div v-show="$store.state.account.isLoggedIn" class="absolute" style="top: 20px; right: 5px">
                <q-btn
                    style="font-size: 10px;"
                    round
                    unelevated
                    color="primary"
                    icon="logout"
                    @click="logout"
                />
            </div>

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
                    <!-- Custom menu item for account / login logic -->
                    <q-item
                        v-if="!$store.state.account.isLoggedIn"
                        clickable
                        v-ripple
                        @click="openDialog('Login', true)"
                    >
                        <q-item-section avatar>
                            <q-icon name="login" />
                        </q-item-section>
                        <q-item-section>
                            Login
                        </q-item-section>
                    </q-item>

                    <q-item
                        v-else
                        clickable
                        v-ripple
                        @click="onClickOpenOverlay('Account')"
                    >
                        <q-item-section avatar>
                            <q-icon name="account_circle" />
                        </q-item-section>
                        <q-item-section>
                            Account
                        </q-item-section>
                    </q-item>
                    <!-- End custom menu item for account / login logic -->

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
                            @click="menuItem.action ? menuItem.action
                                : onClickOpenOverlay(menuItem.link || menuItem.label)"
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
            <MainScene>
                <template v-slot:manager>
                    <OverlayManager ref="OverlayManager" />
                </template>
            </MainScene>
        </q-page-container>

        <!-- <component @close-dialog="closeDialog" v-if="dialog.show" v-bind:is="dialog.which"></component> -->

        <q-dialog v-model="getDialogState">
            <q-card
                class="column no-wrap items-stretch q-pa-md"
                style="background: rgba(0, 0, 0, 0.8);"
            >
                <component @closeDialog='closeDialog' v-bind:is="$store.state.dialog.which"></component>
            </q-card>
        </q-dialog>

    </q-layout>
</template>

<script lang="ts">

import { defineComponent } from "vue";

// Components
import MainScene from "@Components/MainScene.vue";
import OverlayManager from "@Components/overlays/OverlayManager.vue";

import { Mutations as StoreMutations } from "@Store/index";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Log from "@Modules/debugging/log";

export default defineComponent({
    name: "MainLayout",

    $refs!: {   // definition to make this.$ref work with TypeScript
        MainScene: HTMLFormElement,
        OverlayManager: HTMLFormElement
    },

    components: {
        MainScene,
        OverlayManager
    },

    data() {
        return {
            // Toolbar
            locationInput: "",
            // User Menu
            userMenuOpen: false,
            userMenu: [
                {
                    icon: "people",
                    label: "People",
                    link: "",
                    isCategory: false,
                    separator: true
                },
                {
                    icon: "chat",
                    label: "Chat",
                    link: "ChatWindow",
                    isCategory: false,
                    separator: true
                },
                {
                    icon: "travel_explore",
                    label: "Explore",
                    link: "",
                    isCategory: false,
                    separator: true
                },
                {
                    icon: "settings",
                    label: "Settings",
                    link: "",
                    isCategory: true,
                    separator: false
                },
                {
                    icon: "headphones",
                    label: "Audio",
                    link: "",
                    isCategory: false,
                    separator: true
                },
                {
                    icon: "lightbulb",
                    label: "Light / Dark",
                    action: () => {
                        this.$q.dark.toggle();
                        console.info("Toggle Dark");
                    },
                    isCategory: false,
                    separator: true
                }
            ]
        };
    },

    computed: {
        getDialogState: {
            get(): boolean {
                // ESLint doesn't seem to know about 'this' inside a 'get' function
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return
                return this.$store.state.dialog.show;
            },
            set(newValue: boolean) {
                // ESLint doesn't seem to know about 'this' inside a 'set' function
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                this.setDialogState(newValue);
            }
        },

        getLocation: function(): string {
            if (this.$store.state.location.current) {
                return this.$store.state.location.current;
            }
            return this.$store.state.location.state;
        },
        getProfilePicture: function() {
            if (this.$store.state.account.images && this.$store.state.account.images.thumbnail) {
                return this.$store.state.account.images.thumbnail;
            }
            return "../assets/vircadia-icon.svg";
        }
    },

    methods: {
        setDialogState: function(newValue: boolean) {
            this.$store.commit(StoreMutations.MUTATE, {
                property: "dialog.show",
                value: newValue
            });
        },
        // Drawers
        toggleUserMenu: function(): void {
            this.userMenuOpen = !this.userMenuOpen;
        },

        // Connections
        connect: function() {
            console.info("Connecting to...", this.locationInput);
        },

        disconnect: function() {
            console.info("Disconnecting from...", this.$store.state.location.current);
        },

        // Metaverse

        logout: function() {
            // TODO: figure out how Metaverse class instance is initialized
            // this.$store.state.Metaverse.logout();
        },

        // Dialog Handling
        openDialog: function(pWhich: string, shouldShow: boolean) {
            // We want to reset the element first.
            this.$store.commit(StoreMutations.MUTATE, {
                property: "dialog",
                with: {
                    "show": false,
                    "which": ""
                }
            });

            this.$store.commit(StoreMutations.MUTATE, {
                property: "dialog",
                with: {
                    "show": shouldShow,
                    "which": pWhich
                }
            });
        },

        closeDialog: function() {
            this.$store.commit(StoreMutations.MUTATE, {
                property: "dialog",
                with: {
                    "show": false,
                    "which": ""
                }
            });
        },
        onClickOpenOverlay: function(pOverlay: string) {
            // TODO: figure out how to properly type $ref references. Following 'disable' is a poor solution
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
            (this.$refs.OverlayManager as typeof OverlayManager).openOverlay(pOverlay);
        }
    }
});
</script>
