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
<!--
                <q-toolbar
                    class="col-8"
                >
                    <q-input rounded outlined v-model="locationInput" class="q-mr-md" label="Connect to" />
                    <q-btn-group push>
                        <q-btn push label="Connect" icon="login" @click="connect" />
                        <q-btn push label="Disconnect" icon="close" @click="disconnect" />
                    </q-btn-group>
                    <q-space />

                    <div>
                        <div>{{ $store.state.globalConsts.APP_NAME }}</div>
                        <div>{{ $store.state.globalConsts.APP_VERSION_TAG }}</div>
                    </div>
                </q-toolbar> -->
                <q-toolbar class="bg-dark text-white">
                    <q-btn
                        flat
                        round
                        dense
                        icon="menu"
                        aria-label="User Menu"
                        @click="toggleUserMenu"
                        class="q-mr-sm"
                    />
                    <q-separator dark vertical inset />

                    <q-btn
                        flat
                        round
                        dense
                        icon="travel_explore"
                        aria-label="Explore"
                        @click="onClickOpenOverlay('Explore')"
                        class="q-mr-sm q-ml-sm"
                    />

                    <q-toolbar-title>
                        <q-item-section>
                            <q-item-label>
                                {{ getLocation }}
                            </q-item-label>
                            <q-item-label caption  class="text-grey">
                                {{ getDomainServerState }}
                            </q-item-label>
                        </q-item-section>
                    </q-toolbar-title>

                    <q-space />

                    <q-item clickable v-ripple
                        @click="$store.state.account.isLoggedIn ? onClickOpenOverlay('Account') : openDialog('Login', true)">
                        <q-item-section side>
                            <q-avatar size="48px">
                                <img :src="getProfilePicture">
                            </q-avatar>
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>
                                {{ $store.state.account.isLoggedIn ? $store.state.account.username : "Guest" }}
                            </q-item-label>
                            <q-item-label caption>
                                {{ $store.state.account.isLoggedIn ? "Logged in" : "Click to login to metaverse" }}
                            </q-item-label>
                        </q-item-section>
                    </q-item>

                    <q-btn
                        v-show="$store.state.account.isLoggedIn"
                        flat
                        round
                        dense
                        icon="logout"
                        aria-label="Logout"
                        @click="logout"
                        class="q-mr-sm q-ml-sm"
                    />

                    <q-separator dark vertical/>
                    <q-btn
                        flat
                        stretch
                        icon="settings"
                        aria-label="Settings Menu"
                    >
                        <q-menu>
                            <q-list>
                                <template v-for="(menuItem, index) in settingsMenu" :key="index">
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
                        </q-menu>
                    </q-btn>

                    <q-separator dark vertical inset />

                    <q-btn-dropdown stretch flat>
                        <template v-slot:label>
                            <q-avatar rounded size="48px">
                                <img :src="defaultProductLogo">
                            </q-avatar>
                        </template>
                        <q-list>
                            <q-item-label header>Help</q-item-label>
                            <q-item v-for="(menuItem, index) in helpMenu" :key="index"
                                clickable
                                v-ripple
                                @click="openUrl(menuItem.link)"
                            >
                                <q-item-section avatar dense>
                                    <q-icon :name="menuItem.icon" />
                                </q-item-section>
                                <q-item-section>
                                    {{ menuItem.label }}
                                </q-item-section>
                            </q-item>
                            <q-separator inset spaced />
                            <q-item-label header>Status</q-item-label>
                            <q-item>
                                <q-item-section>
                                    <q-item-label>Domain</q-item-label>
                                    <q-item-label caption>{{ getDomainServerState }}</q-item-label>
                                </q-item-section>
                            </q-item>
                            <q-item>
                                <q-item-section>
                                    <q-item-label>Metaverse</q-item-label>
                                    <q-item-label caption>{{ getMetaverseServerState }}</q-item-label>
                                </q-item-section>
                            </q-item>
                            <q-separator inset spaced />
                            <q-item-label header>About</q-item-label>
                            <q-item-label></q-item-label>
                            <q-item>
                                <q-item-section>
                                    <q-item-label>{{ $store.state.globalConsts.APP_NAME }}</q-item-label>
                                    <q-item-label caption>{{ $store.state.globalConsts.APP_VERSION_TAG }}</q-item-label>
                                </q-item-section>
                            </q-item>
                        </q-list>
                    </q-btn-dropdown>
                </q-toolbar>
            </div>
        </q-header>

        <q-page-container class="full-height">
            <MainScene>
                <template v-slot:manager>
                    <OverlayManager ref="OverlayManager" />
                </template>
            </MainScene>
        </q-page-container>

        <q-dialog v-model="getDialogState">
            <q-card
                class="column no-wrap items-stretch"
                style="background: rgba(0, 0, 0, 0.8);"
            >
                <component @closeDialog='closeDialog' :is="$store.state.dialog.which"></component>
            </q-card>
        </q-dialog>

    </q-layout>
</template>

<script lang="ts">

import { defineComponent } from "vue";
import { openURL } from "quasar";

// Components
import MainScene from "@Components/MainScene.vue";
import OverlayManager from "@Components/overlays/OverlayManager.vue";

import { Store, Mutations as StoreMutations, Actions as StoreActions } from "@Store/index";
import { Utility } from "@Modules/utility";
import { Account } from "@Modules/account";
import { Metaverse } from "@Modules/metaverse/metaverse";
import { Domain } from "@Modules/domain/domain";
import { ConnectionState } from "@vircadia/web-sdk";

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
                }
            ],
            settingsMenu: [
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
                        Log.info(Log.types.OTHER, "Toggle Dark");
                    },
                    isCategory: false,
                    separator: true
                }
            ],
            helpMenu: [
                {
                    icon: "chat",
                    label: "Discord",
                    link: "https://discord.com/invite/Pvx2vke"
                },
                {
                    icon: "forum",
                    label: "Forum",
                    link: "https://forum.vircadia.com/"
                },
                {
                    icon: "support",
                    label: "User Documentation",
                    link: "https://docs.vircadia.com/"
                }
            ],
            defaultProductLogo: "../assets/vircadia-icon.svg"
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
            return "Not currently connected to a domain";
        },

        // Displays the state of the domain server on the user interface
        getDomainServerState: function(): string {
            if (this.$store.state.domain.url && this.$store.state.domain.url.length > 0) {
                return `${this.$store.state.domain.connectionState} (${this.$store.state.domain.url})`;
            }
            return this.$store.state.domain.connectionState;
        },
        getMetaverseServerState: function(): string {
            if (this.$store.state.metaverse.server && this.$store.state.metaverse.server.length > 0) {
                return `${this.$store.state.metaverse.connectionState} (${this.$store.state.metaverse.server})`;
            }
            return this.$store.state.metaverse.connectionState;
        },
        getProfilePicture: function() {
            if (this.$store.state.account.images && this.$store.state.account.images.thumbnail) {
                return this.$store.state.account.images.thumbnail;
            }
            return "../assets/defaultProfile.svg";
        }
    },
    watch: {
        // call again the method if the route changes
        "$route": "parseRouteParams"
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
            // this.userMenuOpen = !this.userMenuOpen;
            // TODO: figure out how to properly type $ref references. Following 'disable' is a poor solution
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
            (this.$refs.OverlayManager as typeof OverlayManager).toggleOverlay("menu");
        },

        // Pressed "connect"
        // Connect to the specified domain-server and the associated metaverse-server
        // Also add state update links to keep the Vuex state variables up to date.
        connect: async function() {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            await this.connectToAddress(this.locationInput);
        },
        connectToAddress: async function(locationAddress: string) {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            Log.info(Log.types.UI, `Connecting to...${locationAddress}`);
            await Utility.connectionSetup(locationAddress,
                // function called when domain-server connection state changes
                (pDomain: Domain, pNewState: ConnectionState, pInfo: string) => {
                    Log.info(Log.types.COMM, `MainLayout: domain-server state change: ${pNewState}: ${pInfo}`);
                    // eslint-disable-next-line no-void
                    void Store.dispatch(StoreActions.UPDATE_DOMAIN, {
                        domain: pDomain,
                        newState: pDomain.DomainStateAsString,
                        info: pInfo
                    });
                },
                // function called when metaverse-server connection state changes
                (pMetaverse: Metaverse, pNewState: string) => {
                    Log.info(Log.types.COMM, `MainLayout: metaverse-server state change: ${pNewState}`);
                    // eslint-disable-next-line no-void
                    void Store.dispatch(StoreActions.UPDATE_METAVERSE, {
                        metaverse: pMetaverse,
                        newState: pNewState
                    });
                }
            );
        },

        disconnect: function() {
            Log.info(Log.types.UI, `Disconnecting from to...${this.$store.state.location.current}`);
        },

        // Metaverse

        logout: function() {
            // eslint-disable-next-line no-void
            void Account.logout();
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
        },
        openUrl: function(pUrl: string) {
            openURL(pUrl);
        },
        parseRouteParams: async function() {
            Log.info(Log.types.UI, "Parse Route params");
            const addressParam = this.$route.params.address as string;
            if (addressParam && addressParam.length > 0) {
                Log.info(Log.types.UI, `Connect to...${addressParam}`);
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                await this.connectToAddress(addressParam);
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                this.$router.push({ path: "/" });
            }
        }
    },
    mounted: async function() {
        Account.onAttributeChange.connect(function(pPayload: { [key: string]: unknown }) {
            // eslint-disable-next-line no-void
            void Store.dispatch(StoreActions.UPDATE_ACCOUNT_INFO, pPayload);
        });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        await this.parseRouteParams();

        // TODO: figure out how to properly type $ref references. Following 'disable' is a poor solution
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        (this.$refs.OverlayManager as typeof OverlayManager).openOverlay("menu");
    }
});
</script>
