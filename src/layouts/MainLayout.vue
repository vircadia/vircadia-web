<!-- eslint-disable max-len -->
<!--
//  MainLayout.vue
//
//  Created by Kalila L. on May 9th, 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
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

<style scoped lang="scss">
.verticalAudioLevel {
    position: relative;
    display: block;
    width: 0.7ch;
    min-height: 40px;
    color: $primary;
    font-size: 1rem;
    background-color: #8884;
    border-radius: 0.7ch;
    overflow: hidden;

    > span {
        position: absolute;
        bottom: 0px;
        display: block;
        width: 100%;
        height: 0%;
        color: inherit;
        background-color: currentColor;
        border-radius: inherit;
        transition: 0.05s ease height;
    }
}
</style>

<style lang="scss">
.v-enter-active,
.v-leave-active {
  transition: opacity 0.2s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>

<template>
    <q-layout class="full-height" id="mainLayout" view="lHh Lpr lFf">
        <q-header
            id="header"
            elevated
            style="color: unset;background-color: unset;"
            :style="{background: headerStyle}"
        >
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
                <q-toolbar :style="{ padding: isMobile ? '0px 0px 0px 8px' : '0px 12px' }">
                    <q-btn
                        flat
                        round
                        dense
                        icon="menu"
                        aria-label="User Menu"
                        @click="toggleUserMenu"
                        :class="{
                            'q-mr-sm': isDesktop,
                            'q-mr-xs': isMobile
                        }"
                    />
                    <q-separator dark vertical inset />

                    <q-btn
                        v-if="isDesktop"
                        flat
                        round
                        dense
                        icon="travel_explore"
                        aria-label="Explore"
                        @click="onClickOpenOverlay('Explore')"
                        class="q-mr-sm q-ml-sm"
                    />

                    <div
                        class="verticalAudioLevel q-my-auto"
                        :class="{ 'q-ml-sm': isMobile }"
                    >
                        <span
                            :class="`text-${microphoneColor}`"
                            :style="{ height: `${AudioIOInstance.inputLevel}%` }"
                        ></span>
                    </div>

                    <div>
                        <q-btn-dropdown
                            v-if="isDesktop"
                            split
                            flat
                            round
                            dense
                            fab-mini
                            :title="
                                !$store.state.audio.user.hasInputAccess ?
                                undefined :
                                $store.state.audio.user.muted ?
                                'Unmute microphone' :
                                'Mute microphone'"
                            :icon="$store.state.audio.user.muted || !$store.state.audio.user.hasInputAccess ? 'mic_off' : 'mic'"
                            :color="microphoneColor"
                            class="q-mr-sm q-ml-sm"
                            :style="{
                                backgroundColor: $q.dark.isActive ? '#282828' : '#e8e8e8'
                            }"
                            :disable-dropdown="!$store.state.audio.user.hasInputAccess"
                            v-model="micMenuState"
                            @click="toggleMicrophoneMute"
                        >
                            <q-list style="max-width: 300px;" @click.stop="">
                                <q-item v-for="input in $store.state.audio.inputsList" :key="input.deviceId">
                                    <q-radio
                                        @click="AudioIOInstance.requestInputAccess(input.deviceId);micMenuState = false;"
                                        v-model="AudioIOInstance.selectedInput"
                                        :val="input.label"
                                        :label="input.label"
                                        :title="input.label"
                                        color="teal"
                                        class="ellipsis"
                                    />
                                </q-item>
                            </q-list>
                        </q-btn-dropdown>
                        <q-btn
                            v-else
                            split
                            flat
                            round
                            dense
                            fab-mini
                            :title="
                                !$store.state.audio.user.hasInputAccess ?
                                undefined :
                                $store.state.audio.user.muted ?
                                'Unmute microphone' :
                                'Mute microphone'"
                            :icon="$store.state.audio.user.muted || !$store.state.audio.user.hasInputAccess ? 'mic_off' : 'mic'"
                            :color="microphoneColor"
                            @click="toggleMicrophoneMute"
                            class="q-mr-sm q-ml-sm"
                            :style="{
                                backgroundColor: $q.dark.isActive ? '#282828' : '#e8e8e8'
                            }"
                        />
                        <q-tooltip
                            v-if="!$store.state.audio.user.hasInputAccess"
                            class="bg-black"
                            transition-show="jump-down"
                            transition-hide="jump-up"
                        >Please allow microphone access.</q-tooltip>
                    </div>

                    <q-toolbar-title
                        :class="{ 'q-px-xs': isMobile }"
                    >
                        <q-item-section>
                            <q-item-label
                                style="display: flex;flex-direction: row;justify-content: flex-start;align-items: center;"
                                :style="{ fontSize: isMobile ? '0.8em' : 'inherit' }"
                            >
                                {{ getDomainServerState }}
                                <Transition>
                                    <div
                                        v-show="getDomainServerState === 'CONNECTING' || $store.state.renderer.contentIsLoading"
                                        class="q-ml-md"
                                        style="display: flex;
                                            flex-direction: row;justify-content: flex-start;align-items: center;"
                                    >
                                        <q-spinner
                                            :size="isMobile ? 'xs' : 'sm'"
                                            :title="$store.state.renderer.contentIsLoading ? 'Loading content' : undefined"
                                        />
                                        <p class="q-my-none q-ml-md text-caption">
                                            {{ `${$store.state.renderer.contentLoadingSpeed.toFixed(1)}MB&sol;s` }}
                                        </p>
                                        <q-tooltip
                                            :class="{
                                                'bg-black': $q.dark.isActive,
                                                'text-white': $q.dark.isActive
                                            }"
                                            :hide-delay="300"
                                        >
                                            {{ $store.state.renderer.contentIsLoading
                                                && $store.state.renderer.contentLoadingInfo
                                                ? $store.state.renderer.contentLoadingInfo : "Loading..." }}
                                        </q-tooltip>
                                    </div>
                                </Transition>
                            </q-item-label>
                        </q-item-section>
                    </q-toolbar-title>

                    <template v-if="isDesktop">
                        <q-item clickable v-ripple
                            @click="$store.state.account.isLoggedIn ?
                            onClickOpenOverlay('Account') : openDialog('Login', true)"
                        >
                            <q-item-section side>
                                <q-avatar size="48px">
                                    <q-icon :name="getProfilePicture" size="xl"/>
                                </q-avatar>
                            </q-item-section>
                            <q-item-section>
                                <q-item-label>
                                    {{ $store.state.account.isLoggedIn ? $store.state.account.username : "Guest" }}
                                </q-item-label>
                                <q-item-label caption>
                                    {{ $store.state.account.isLoggedIn ?
                                    "Logged in" :
                                    `Click to log in to the ${$store.state.theme.globalServiceTerm.toLowerCase()}.` }}
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
                            <q-menu v-model="settingsMenuState" @show="aMenuIsOpen = true">
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
                                            @click="menuItem.action ? menuItem.action()
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
                    </template>

                    <q-separator dark vertical inset />

                    <q-btn-dropdown
                        stretch
                        flat
                        :dense="isMobile"
                        :class="{ 'q-ml-xs': isMobile }"
                        :persistent="false"
                        v-model="helpMenuState"
                        @show="aMenuIsOpen = true"
                    >
                        <template v-slot:label>
                            <q-avatar rounded :size="isDesktop ? '48px' : '32px'">
                                <img :src="$store.state.theme.logo">
                            </q-avatar>
                        </template>
                        <q-list class="q-pb-sm">
                            <template v-if="isMobile">
                                <q-item-label header>Account</q-item-label>
                                <q-item clickable v-ripple
                                    @click="$store.state.account.isLoggedIn ?
                                    onClickOpenOverlay('Account') : openDialog('Login', true)"
                                >
                                    <q-item-section side>
                                        <q-avatar size="48px">
                                            <q-icon :name="getProfilePicture" size="xl"/>
                                        </q-avatar>
                                    </q-item-section>
                                    <q-item-section>
                                        <q-item-label>
                                            {{ $store.state.account.isLoggedIn ? $store.state.account.username : "Guest" }}
                                        </q-item-label>
                                        <q-item-label caption>
                                            {{ $store.state.account.isLoggedIn ?
                                            "Logged in" :
                                            `Click to log in to the ${$store.state.theme.globalServiceTerm.toLowerCase()}.` }}
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

                                <q-separator inset spaced />

                                <q-item-label header>Settings</q-item-label>
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
                                        @click="menuItem.action ? menuItem.action()
                                            : onClickOpenOverlay(menuItem.link || menuItem.label)"
                                        @touch-end="helpMenuState = false"
                                    >
                                        <q-item-section avatar>
                                            <q-icon :name="menuItem.icon" />
                                        </q-item-section>
                                        <q-item-section>
                                            {{ menuItem.label }}
                                        </q-item-section>
                                    </q-item>
                                </template>

                                <q-separator inset spaced />
                            </template>
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
                                    <q-item-label
                                        caption
                                        class="row"
                                        style="align-items: center;"
                                        :title="getLocation"
                                    >
                                        <p class="q-ma-none text-no-wrap ellipsis" style="max-width: 300px;">
                                            {{ getLocation }}
                                        </p>
                                        <q-btn
                                            flat
                                            round
                                            dense
                                            :icon="domainLocationCopied ? 'done' : 'content_copy'"
                                            :disable="domainLocationCopied"
                                            title="Copy"
                                            @click.stop="copyDomainLocationToClipboard()"
                                        />
                                    </q-item-label>
                                </q-item-section>
                            </q-item>
                            <q-item>
                                <q-item-section>
                                    <q-item-label>{{ $store.state.theme.globalServiceTerm }}</q-item-label>
                                    <q-item-label caption>{{ getMetaverseServerState.toUpperCase() }}</q-item-label>
                                    <q-item-label
                                        caption
                                        class="row"
                                        style="align-items: center;"
                                        :title="getMetaverseServerLocation"
                                    >
                                        <p class="q-ma-none text-no-wrap ellipsis" style="max-width: 300px;">
                                            {{ getMetaverseServerLocation }}
                                        </p>
                                        <q-btn
                                            flat
                                            round
                                            dense
                                            :icon="metaverseLocationCopied ? 'done' : 'content_copy'"
                                            :disable="metaverseLocationCopied"
                                            title="Copy"
                                            @click.stop="copyMetaverseLocationToClipboard()"
                                        />
                                    </q-item-label>
                                </q-item-section>
                            </q-item>
                            <q-separator inset spaced />
                            <q-item-label header>About</q-item-label>
                            <q-item>
                                <q-item-section>
                                    <q-item-label>{{ $store.state.globalConsts.APP_NAME }}</q-item-label>
                                    <q-item-label caption>{{ $store.state.globalConsts.APP_VERSION_TAG }}</q-item-label>
                                </q-item-section>
                            </q-item>
                            <q-item>
                                <q-item-section>
                                    <q-item-label>Vircadia Web SDK</q-item-label>
                                    <q-item-label caption>{{ $store.state.globalConsts.SDK_VERSION_TAG }}</q-item-label>
                                </q-item-section>
                            </q-item>
                        </q-list>
                    </q-btn-dropdown>
                </q-toolbar>
            </div>
        </q-header>

        <q-page-container class="full-height">
            <MainScene
                :interactive="!aMenuIsOpen"
                @click.prevent="hideSettingsAndHelpMenus()"
                @joint-conference-room="joinConferenceRoom($event)"
            >
                <template v-slot:manager>
                    <OverlayManager ref="OverlayManager" />
                </template>
            </MainScene>
        </q-page-container>

        <q-dialog v-model="getDialogState">
            <q-card
                class="column no-wrap items-stretch"
                style="width: 310px;"
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

import { Store, Mutations as StoreMutations, Actions as StoreActions, JitsiRoomInfo } from "@Store/index";
import { Utility } from "@Modules/utility";
import { Account } from "@Modules/account";
import { AudioMgr } from "@Modules/scene/audio";
import { AudioIO } from "@Modules/ui/audioIO";


// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Log from "@Modules/debugging/log";

export default defineComponent({
    name: "MainLayout",

    $refs: {   // definition to make this.$ref work with TypeScript
        MainScene: HTMLFormElement,
        OverlayManager: HTMLFormElement
    },

    components: {
        MainScene,
        OverlayManager
    },

    data() {
        return {
            mobileBreakpoint: 800,
            isDesktop: true,
            isMobile: false,
            // Toolbar
            micMenuState: false,
            AudioIOInstance: new AudioIO(),
            locationInput: "",
            settingsMenu: [
                {
                    icon: "headphones",
                    label: "Audio",
                    link: "",
                    isCategory: false,
                    separator: true
                },
                {
                    icon: "gamepad",
                    label: "Controls",
                    link: "",
                    isCategory: false,
                    separator: true
                },
                {
                    icon: "desktop_windows",
                    label: "Graphics",
                    link: "",
                    isCategory: false,
                    separator: true
                },
                {
                    icon: "badge",
                    label: "Nametags",
                    action: () => {
                        this.$store.commit(StoreMutations.MUTATE, {
                            property: "avatar.showNametags",
                            value: !this.$store.state.avatar.showNametags
                        });
                        Log.info(Log.types.OTHER, "Toggle Avatar Nametags");
                    },
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
                    separator: false
                }
            ],
            settingsMenuState: false,
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
            helpMenuState: false,
            aMenuIsOpen: false,
            lastConnectedDomain: undefined as string | undefined,
            domainLocationCopied: false,
            metaverseLocationCopied: false
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
            return this.$store.state.avatar.location ?? "Not currently connected to a domain.";
        },

        // Displays the state of the domain server on the user interface
        getDomainServerState: function(): string {
            return this.$store.state.domain.connectionState ?? "DISCONNECTED";
        },
        getMetaverseServerState: function(): string {
            return this.$store.state.metaverse.connectionState;
        },
        getMetaverseServerLocation: function(): string {
            return this.$store.state.metaverse.server ?? "Not currently connected to a metaverse server.";
        },
        getProfilePicture: function() {
            if (this.$store.state.account.images && this.$store.state.account.images.thumbnail) {
                return this.$store.state.account.images.thumbnail;
            }
            return "account_circle";
        },

        headerStyle: function(): string {
            // Style the header bar based on the Theme config.
            if (this.$store.state.theme.globalStyle === "none") {
                return "unset";
            }
            const opacities = {
                "aero": "5c",
                "mica": "30"
            };
            if (this.$store.state.theme.headerStyle === "none") {
                return "unset";
            }
            const gradients = {
                "gradient-left": "circle at 0% 50%",
                "gradient-right": "circle at 100% 50%"
            };
            const gradient = gradients[this.$store.state.theme.headerStyle];
            const primary = this.$store.state.theme.colors.primary;
            const secondary = this.$store.state.theme.colors.secondary;
            const end = this.$q.dark.isActive ? "#121212" : "#ffffff";
            const opacity = opacities[this.$store.state.theme.globalStyle];
            return `radial-gradient(${gradient}, ${secondary}${opacity} 15%, ${primary}${opacity} 40%, ${end}${opacity} 95%)`;
        },

        microphoneColor: function(): string {
            if (!this.$store.state.audio.user.hasInputAccess) {
                return "grey-6";
            }
            if (this.$store.state.audio.user.muted) {
                return "red";
            }
            return "primary";
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
            // this.userMenuOpen = !this.userMenuOpen;
            // TODO: figure out how to properly type $ref references. Following 'disable' is a poor solution
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
            (this.$refs.OverlayManager as typeof OverlayManager).toggleOverlay("menu");
        },
        // Settings & Help menus clickaway
        hideSettingsAndHelpMenus: function(): void {
            if (this.aMenuIsOpen) {
                this.aMenuIsOpen = false;
                this.settingsMenuState = false;
                this.helpMenuState = false;
            }
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
            Log.info(Log.types.UI, `Connecting to... ${locationAddress}`);
            // eslint-disable-next-line @typescript-eslint/unbound-method
            await Utility.connectionSetup(locationAddress);
        },

        disconnect: async function() {
            Log.info(Log.types.UI, `Disconnecting from... ${this.$store.state.avatar.location}`);
            this.lastConnectedDomain = this.$store.state.avatar.location;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            await Utility.disconnectActiveDomain();
        },

        // Metaverse

        logout: function() {
            // eslint-disable-next-line no-void
            void Account.logout();
            this.$q.notify({
                type: "positive",
                textColor: "white",
                icon: "cloud_done",
                message: "Logged out."
            });
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
            // TODO: figure out how to properly type $ref references. Following 'disable' is a poor solution.
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
            (this.$refs.OverlayManager as typeof OverlayManager).openOverlay(pOverlay);
        },
        joinConferenceRoom: function(room: JitsiRoomInfo) {
            this.$store.commit(StoreMutations.JOIN_CONFERENCE_ROOM, room);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            (this.$refs.OverlayManager as typeof OverlayManager).toggleOverlay("Jitsi");
        },
        openUrl: function(pUrl: string) {
            openURL(pUrl);
        },
        toggleMicrophoneMute: function() {
            if (this.$store.state.audio.user.hasInputAccess) {
                AudioMgr.muteAudio();
            }
        },
        async copyDomainLocationToClipboard(): Promise<void> {
            this.domainLocationCopied = true;
            await navigator.clipboard.writeText(this.getLocation);
            const transitionTime = 1700;
            window.setTimeout(() => {
                this.domainLocationCopied = false;
            }, transitionTime);
        },
        async copyMetaverseLocationToClipboard(): Promise<void> {
            this.metaverseLocationCopied = true;
            await navigator.clipboard.writeText(this.getMetaverseServerLocation);
            const transitionTime = 1700;
            window.setTimeout(() => {
                this.metaverseLocationCopied = false;
            }, transitionTime);
        }
    },
    mounted: function() {
        // Set the isDesktop and isMobile flags according to the window's width.
        this.isMobile = window.innerWidth < this.mobileBreakpoint;
        this.isDesktop = !this.isMobile;
        window.addEventListener("resize", () => {
            this.isMobile = window.innerWidth < this.mobileBreakpoint;
            this.isDesktop = !this.isMobile;
        });

        Account.onAttributeChange.connect(function(pPayload: { [key: string]: unknown }) {
            // eslint-disable-next-line no-void
            void Store.dispatch(StoreActions.UPDATE_ACCOUNT_INFO, pPayload);
        });

        if (this.isDesktop) {
            // TODO: figure out how to properly type $ref references. Following 'disable' is a poor solution.
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
            (this.$refs.OverlayManager as typeof OverlayManager).openOverlay("menu");
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
            (this.$refs.OverlayManager as typeof OverlayManager).openOverlay("ChatWindow");
        }

        // Set up event listeners for UI-based controls.
        window.addEventListener("keydown", (event) => {
            // Toggle the menu.
            if (event.code === this.$store.state.controls.other.toggleMenu.keybind) {
                // TODO: figure out how to properly type $ref references. Following 'disable' is a poor solution.
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
                (this.$refs.OverlayManager as typeof OverlayManager).toggleOverlay("menu");
            }
            // Open the chat.
            if (event.code === this.$store.state.controls.other.openChat.keybind) {
                // TODO: figure out how to properly type $ref references. Following 'disable' is a poor solution.
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
                (this.$refs.OverlayManager as typeof OverlayManager).openOverlay("ChatWindow");
            }
        });
    }
});
</script>
