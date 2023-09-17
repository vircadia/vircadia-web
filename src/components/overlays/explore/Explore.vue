<!--
//  Explore.vue
//
//  Created by Kalila L. on June 8th, 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
-->

<style lang="scss" scoped>
    .q-field {
        background-color: rgba(0, 0, 0, 0.4);
    }
</style>
<style lang="scss">
    .exploreScrollContainer .q-scrollarea__content {
        width: 100%;
    }
    .exploreItem {
        background-size: cover; background-position: center;
    }
    .exploreItem .textShadow {
        text-shadow: 1px 1px 2px black, 0 0 25px black, 0 0 5px black;
    }
    .exploreItem .q-item__section {
        z-index: 1;
    }
    .exploreItemBackground {
        position: absolute;
        left: 0px;
        top: 0px;
        width: 100%;
        height: 100%;
        backdrop-filter: blur(3px);
        z-index: 0;
    }
    .exploreLabel {
        width: fit-content;
        padding: 1px 6px;
        border-radius: 4px;
    }
    .exploreLocationInfo {
        position: relative;
        display: grid;
        grid-template-columns: calc(3.6em + 5px) 1fr 1fr 3.5ch 11ch;
        grid-template-rows: 1.8em 1.8em;
        column-gap: 5px;
        row-gap: 5px;
        font-size: smaller;

        > img {
            grid-area: 1 / 1 / 3 / 2;
            display: block;
            width: 100%;
            height: 100%;
            aspect-ratio: 1;
            border: 3px solid transparent;
            border-radius: 50%;
        }

        /* Vue was throwing an error when trying to bind classes directly to the img element. */
        /* So I have bound these classes to the parent instead. */
        &.disconnected > img {
            border-color: $negative;
        }

        &.connecting > img {
            border-color: $warning;
            animation: exploreLocationInfoConnecting 1.5s ease infinite;

            @keyframes exploreLocationInfoConnecting {
                0%   {border-color: $warning;}
                100% {border-color: transparent;}
            }
        }

        &.connected > img {
            border-color: $positive;
        }

        > p {
            margin: 0px;
            padding: 0.2em 1ch;
            border: 1px solid #8888;
            border-radius: 5px;

            &.locationProtocol {
                grid-area: 1 / 1 / 3 / 2;
                display: flex;
                flex-flow: column nowrap;
                justify-content: center;
                align-items: center;
                font-size: 0.7em;
                text-align: center;

                &.WSS,
                &.HTTPS {
                    border-color: goldenrod;
                }
            }

            &.locationDomain {
                grid-area: 1 / 2 / 2 / 4;
                border-color: $primary;
            }

            &.locationPosition {
                grid-area: 2 / 2 / 3 / 3;
            }

            &.locationRotation {
                grid-area: 2 / 3 / 3 / 4;
            }

        }

        > .locationBookmark,
        > .locationCopy,
        > .locationButton {
            display: flex;
            flex-flow: row nowrap;
            justify-content: flex-start;
            align-items: center;
            width: 100%;
            height: 100%;
        }

        > .locationBookmark {
            grid-area: 1 / 4 / 2 / 5;
        }

        > .locationCopy {
            grid-area: 2 / 4 / 3 / 5;
        }

        > .locationButton {
            grid-area: 1 / 5 / 3 / 6;
            justify-content: center;
        }
    }
</style>
<template>
    <OverlayShell
        icon="travel_explore"
        title="Explore"
        :managerProps="propsToPass"
        :defaultHeight="500"
        :defaultWidth="400"
        :defaultLeft="250"
        :defaultTop="10"
        :hoverShowBar="false"
        :style="{ border: 'none' }"
    >
        <q-card
            class="column no-wrap items-stretch full-height"
            style="background: transparent; box-shadow: none;"
        >
            <div
                class="exploreLocationInfo q-pa-sm"
                :class="{
                    'connected': applicationStore.metaverse.connectionState === 'CONNECTED',
                    'connecting': applicationStore.metaverse.connectionState === 'CONNECTING',
                    'disconnected': applicationStore.metaverse.connectionState === 'DISCONNECTED'
                }"
            >
                <img
                    :src="applicationStore.theme.logo"
                    :alt="`${applicationStore.theme.productName} logo`"
                >
                <p
                    class="locationDomain text-no-wrap ellipsis cursor-pointer"
                    :title="'Domain: ' + parseLocation(getLocation, 'domain')"
                >
                    <q-icon
                        :name="protocolIsSecure(parseLocation(getLocation, 'protocol')) ? 'lock' : 'no_encryption'"
                        size="1em"
                        :title="
                            protocolIsSecure(parseLocation(getLocation, 'protocol')) ?
                            'Connection secured with ' + parseLocation(getLocation, 'protocol') :
                            parseLocation(getLocation, 'protocol')
                        "
                    />
                    {{ parseLocation(getLocation, 'domain') }}
                    <q-popup-edit v-model="domain" v-slot="scope">
                        Domain
                        <q-input dense autofocus v-model="domain" />
                        <div class="row q-gutter-x-md q-mt-xs">
                            <q-btn @click="() => { scope.cancel();loadLocation(userStore.avatar.location); }">Cancel</q-btn>
                            <q-btn color="primary" @click="() => { scope.set();setLocation(); }">Ok</q-btn>
                        </div>
                    </q-popup-edit>
                </p>
                <p
                    class="locationPosition text-no-wrap ellipsis cursor-pointer"
                    :title="'Position: ' + parseLocation(getLocation, 'position').toString().replace('{', '').replace('}', '')"
                >
                    {{ parseLocation(getLocation, 'position').toString().replace('{', '').replace('}', '') }}
                    <q-popup-edit v-model="position" v-slot="scope">
                        Position
                        <q-input dense type="number" label="X" v-model="position.x" />
                        <q-input dense type="number" label="Y" v-model="position.y" />
                        <q-input dense type="number" label="Z" v-model="position.z" />
                        <div class="row q-gutter-x-md q-mt-xs">
                            <q-btn @click="() => { scope.cancel();loadLocation(userStore.avatar.location); }">Cancel</q-btn>
                            <q-btn color="primary" @click="() => { scope.set();setLocation(); }">Ok</q-btn>
                        </div>
                    </q-popup-edit>
                </p>
                <p
                    class="locationRotation text-no-wrap ellipsis cursor-pointer"
                    :title="'Rotation: ' + parseLocation(getLocation, 'rotation').toString().replace('{', '').replace('}', '')"
                >
                    {{ parseLocation(getLocation, 'rotation').toString().replace('{', '').replace('}', '') }}
                    <q-popup-edit v-model="rotation" v-slot="scope">
                        Rotation
                        <q-input dense type="number" label="X" v-model="rotation.x" />
                        <q-input dense type="number" label="Y" v-model="rotation.y" />
                        <q-input dense type="number" label="Z" v-model="rotation.z" />
                        <q-input dense type="number" label="W" v-model="rotation.w" />
                        <div class="row q-gutter-x-md q-mt-xs">
                            <q-btn @click="() => { scope.cancel();loadLocation(userStore.avatar.location); }">Cancel</q-btn>
                            <q-btn color="primary" @click="() => { scope.set();setLocation(); }">Ok</q-btn>
                        </div>
                    </q-popup-edit>
                </p>
                <div class="locationBookmark">
                    <q-btn
                        flat
                        round
                        v-ripple
                        :icon="locationBookmarked ? 'done' : 'bookmark'"
                        :disable="locationBookmarked"
                        size="sm"
                        class="q-pa-none"
                        title="Bookmark this location"
                    >
                        <q-popup-edit v-model="newBookmark" v-slot="scope">
                            New Bookmark
                            <q-input
                                dense
                                label="Name"
                                counter
                                v-model="newBookmark.name"
                                :validate="validateBookmarkName"
                            />
                            <q-color
                                no-header
                                no-footer
                                class="q-mt-xs"
                                format-model="hex"
                                v-model="newBookmark.color"
                            ></q-color>
                            <div class="row q-gutter-x-md q-mt-xs">
                                <q-btn @click="() => { scope.cancel(); }">Cancel</q-btn>
                                <q-btn color="primary" @click="() => { scope.set();addLocationToBookmarks(); }">Ok</q-btn>
                            </div>
                        </q-popup-edit>
                    </q-btn>
                </div>
                <div class="locationCopy">
                    <q-btn
                        flat
                        round
                        v-ripple
                        :icon="locationCopied ? 'done' : 'content_copy'"
                        :disable="locationCopied"
                        size="sm"
                        class="q-pa-none"
                        title="Copy location link"
                        @click.stop="copyLocationToClipboard()"
                    />
                </div>
                <div class="locationButton">
                    <q-btn
                        v-show="getShowDisconnect"
                        dense
                        color="secondary"
                        size="sm"
                        class="q-ml-sm absolute"
                        style="margin-top: -4px;"
                        @click="disconnect()"
                        :label="getDisconnectLabel"
                    />
                    <q-btn
                        v-show="getShowConnect"
                        dense
                        color="secondary"
                        size="sm"
                        class="q-ml-sm absolute"
                        style="margin-top: -4px;"
                        @click="connectToLastAddress()"
                        label="Connect"
                    />
                </div>
            </div>
            <div class="row">
                <q-input
                    borderless
                    dense
                    filled
                    debounce="300"
                    v-model="filterText"
                    placeholder="Search or enter location"
                    class="col"
                    append-icon="mdi-location-enter"
                    v-on:keyup.enter="visitIconCallback"
                >
                    <template v-slot:append>
                        <q-icon name="search" />
                        <q-icon name="launch" @click="visitIconCallback" clickable v-ripple/>
                    </template>
                </q-input>
            </div>
            <q-tabs
                v-model="tab"
                no-caps
                dense
                class="text-white shadow-2"
            >
                <q-tab name="all" label="All" />
                <q-tab name="bookmarks" label="Bookmarks" />
            </q-tabs>
            <q-tab-panels v-model="tab" animated class="full-height">
                <q-tab-panel name="all" class="q-pa-none non-selectable">
                    <q-list :showing="!loading">
                        <q-item
                            v-for="place in filteredAndSortedData"
                            :key="place.placeId"
                            clickable
                            v-ripple
                            @click="openLocation(place.address)"
                            :style="place.thumbnail ? 'background-image: url(' + place.thumbnail +');' : '' "
                            class="exploreItem"
                        >
                            <div class="exploreItemBackground"></div>
                            <q-item-section side>
                                <q-btn round
                                    color="white"
                                    icon="fas fa-info"
                                    clickable
                                    @click.stop="openDetails(place)"
                                    class="text-secondary"
                                    size="10px"
                                />
                            </q-item-section>

                            <q-item-section top>
                                <q-item-label
                                    lines="1"
                                    :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'"
                                    class="exploreLabel"
                                >
                                    {{ place.name }}
                                </q-item-label>
                                <q-item-label
                                    caption lines="1"
                                    :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'"
                                    class="exploreLabel"
                                >
                                    {{ place.description }}
                                </q-item-label>
                            </q-item-section>

                            <q-item-section side>
                                <q-badge color="white" text-color="black">
                                    {{ place.currentAttendance }}
                                    <q-icon
                                        name="people"
                                        size="14px"
                                        class="q-ml-xs"
                                    />
                                </q-badge>
                            </q-item-section>
                        </q-item>
                    </q-list>
                </q-tab-panel>
                <q-tab-panel name="bookmarks" class="full-height q-pa-none non-selectable">
                    <q-list :showing="!loading">
                        <p
                            v-if="userStore.bookmarks.locations.length <= 0"
                            class="text-grey-6 q-pt-lg"
                            style="width: 100%;text-align: center;"
                        >You have no bookmarks</p>
                        <q-item
                            v-else
                            v-for="(bookmark, index) of userStore.bookmarks.locations"
                            :key="bookmark.name"
                            clickable
                            v-ripple
                            style="height: 4em;"
                            @click="openLocation(bookmark.url)"
                        >
                            <q-item-section side>
                                <q-avatar
                                    :style="{ backgroundColor: bookmark.color, border: '4px solid #888' }"
                                    size="md"
                                />
                            </q-item-section>
                            <q-item-section>
                                <div class="col" style="width: 100%;overflow: hidden;">
                                    <p class="q-ma-none text-no-wrap ellipsis">{{ bookmark.name }}</p>
                                    <p
                                        class="q-ma-none text-caption text-grey-5 text-no-wrap ellipsis"
                                        :title="bookmark.url"
                                    >{{ bookmark.url }}</p>
                                </div>
                            </q-item-section>
                            <q-item-section>
                                <q-btn
                                    dense
                                    flat
                                    fab-mini
                                    icon="edit"
                                    title="Edit bookmark"
                                    @click.stop="() => {newBookmark.name = bookmark.name;newBookmark.color = bookmark.color;}"
                                >
                                    <q-popup-edit v-model="newBookmark" v-slot="scope">
                                        New Bookmark
                                        <q-input
                                            dense
                                            label="Name"
                                            counter
                                            v-model="newBookmark.name"
                                            :validate="validateBookmarkName"
                                        />
                                        <q-color
                                            no-header
                                            no-footer
                                            class="q-mt-xs"
                                            format-model="hex"
                                            v-model="newBookmark.color"
                                        ></q-color>
                                        <div class="row q-gutter-x-md q-mt-xs">
                                            <q-btn @click="() => { scope.cancel(); }">Cancel</q-btn>
                                            <q-btn
                                                color="primary"
                                                @click="() => { scope.set();updateBookmark(index); }"
                                            >Ok</q-btn>
                                        </div>
                                    </q-popup-edit>
                                </q-btn>
                                <q-btn
                                    dense
                                    flat
                                    fab-mini
                                    color="red"
                                    icon="delete"
                                    title="Delete bookmark"
                                    @click.stop="deleteBookmark(index)"
                                />
                            </q-item-section>
                        </q-item>
                    </q-list>
                </q-tab-panel>
            </q-tab-panels>
            <div
                class="row q-px-md q-py-sm"
                style="align-items: center;gap: 16px;border-top: 1px solid #8888;"
            >
                <p class="q-ma-none">Stuck?</p>
                <q-btn
                    size="sm"
                    color="secondary"
                    @click="resetPosition()"
                >Reset position</q-btn>
            </div>
        </q-card>
        <q-inner-loading :showing="loading">
            <q-spinner size="xl" color="primary" />
        </q-inner-loading>
    </OverlayShell>
</template>

<script lang="ts">
import { defineComponent, watch } from "vue";
import { Vector3, Vector4 } from "@babylonjs/core";
import { applicationStore, userStore } from "@Stores/index";
import { Utility } from "@Modules/utility";
import { Location } from "@Modules/domain/location";
import { API } from "@Modules/metaverse/API";
import type { PlaceEntry } from "@Modules/metaverse/APIPlaces";
import { Renderer } from "@Modules/scene";
import Log from "@Modules/debugging/log";
import OverlayShell from "../OverlayShell.vue";

// Conditional types for the `parseLocation()` method.
type LocationSegmentName = "protocol" | "domain" | "port" | "position" | "rotation";
type LocationSegment<T> =
    T extends "protocol" ? string :
        T extends "domain" ? string :
            T extends "port" ? number :
                T extends "position" ? Vector3 :
                    T extends "rotation" ? Vector4 :
                        string;

export default defineComponent({
    name: "ExploreOverlay",

    props: {
        // Primary
        propsToPass: { type: Object, default: () => ({}) }
    },

    components: {
        OverlayShell
    },

    setup() {
        return {
            applicationStore,
            userStore
        };
    },

    data() {
        return {
            placesList: new Array<PlaceEntry>(),
            loading: false,
            filterText: "",
            locationInput: "",
            lastConnectedDomain: undefined as string | undefined,
            newBookmark: {
                name: "",
                color: ""
            },
            locationBookmarked: false,
            locationCopied: false,
            domain: "",
            // eslint-disable-next-line new-cap
            position: Vector3.Zero(),
            // eslint-disable-next-line new-cap
            rotation: Vector4.Zero(),
            tab: "all"
        };
    },

    computed: {
        getLocation: function(): string {
            return this.userStore.avatar.location ?? "Not currently connected to a domain.";
        },
        // Displays the state of the domain server on the user interface
        getDomainServerState: function(): string {
            if (this.applicationStore.domain.url && this.applicationStore.domain.url.length > 0) {
                return `${this.applicationStore.domain.connectionState} (${this.applicationStore.domain.url})`;
            }
            return this.applicationStore.domain.connectionState;
        },
        getShowConnect: function() : boolean {
            if (this.applicationStore.domain.url && this.applicationStore.domain.url.length > 0
                    && this.applicationStore.domain.connectionState === "DISCONNECTED" && this.lastConnectedDomain) {
                return true;
            }
            return false;
        },
        getShowDisconnect: function() : boolean {
            if (this.applicationStore.domain.url && this.applicationStore.domain.url.length > 0
                    && this.applicationStore.domain.connectionState.startsWith("CONNECT")) {
                return true;
            }
            return false;
        },
        getDisconnectLabel: function() : string {
            if (this.applicationStore.domain.connectionState === "CONNECTING") {
                return "Cancel";
            }
            if (this.applicationStore.domain.connectionState === "CONNECTED") {
                return "Disconnect";
            }
            return "false";
        },

        filteredAndSortedData: function(): PlaceEntry[] {
            let returnData = this.placesList;

            returnData = returnData.filter((item) => !item.name.toLowerCase().indexOf(this.filterText.toLowerCase()));

            returnData = returnData.sort((a, b) => {
                if (a.currentAttendance > b.currentAttendance) {
                    return -1;
                }
                if (a.currentAttendance < b.currentAttendance) {
                    return 1;
                }
                if (a.name.toLowerCase() < b.name.toLowerCase()) {
                    return -1;
                }
                if (a.name.toLowerCase() > b.name.toLowerCase()) {
                    return 1;
                }
                return 0;
            });

            return returnData;
        }
    },

    methods: {
        async loadPlacesList(): Promise<void> {
            this.loading = true;
            this.placesList = await API.getActivePlaceList();
            this.loading = false;
        },

        async openLocation(path: string): Promise<void> {
            Log.info(Log.types.UI, `Connecting to... ${path}`);
            // Check if just the position/rotation values differ from the current location.
            const prev = new Location(this.$route.path.replace("/", ""));
            const next = new Location(path);
            await Utility.connectionSetup(prev.hostname === next.hostname ? next.pathname : path);
        },

        openDetails(place: PlaceEntry): void {
            alert("Not currently implemented: Show details - " + place.name);
        },

        async visitIconCallback() {
            if (this.filterText !== "") {
                await this.openLocation(this.filterText);
            }
        },

        resetPosition(): void {
            // Reset the player's position back to the world's spawn point.
            const scene = Renderer.getScene();
            scene.resetMyAvatarPositionAndOrientation();
        },

        // Pressed "connect"
        // Connect to the specified domain-server and the associated metaverse-server
        // Also add state update links to keep the Vuex state variables up to date.
        connect: async function() {
            await this.connectToAddress(this.locationInput);
        },
        connectToLastAddress: async function() {
            if (this.lastConnectedDomain) {
                await this.connectToAddress(this.lastConnectedDomain);
            }
        },
        connectToAddress: async function(locationAddress: string) {
            Log.info(Log.types.UI, `Connecting to... ${locationAddress}`);
            await Utility.connectionSetup(locationAddress);
        },

        disconnect: function() {
            Log.info(Log.types.UI, `Disconnecting from... ${this.userStore.avatar.location}`);
            this.lastConnectedDomain = this.userStore.avatar.location;
            Utility.disconnectActiveDomain();
        },

        parseLocation<T extends LocationSegmentName>(location: string, segment: T): LocationSegment<T> {
            try {
                if (location.length > 0) {
                    const url = new URL(location);
                    if (segment === "protocol") {
                        const protocol = url.protocol.toUpperCase();
                        return (protocol.includes(":") ? protocol.split(":")[0] : protocol) as LocationSegment<T>;
                    }
                    if (segment === "domain") {
                        return url.hostname as LocationSegment<T>;
                    }
                    if (segment === "port") {
                        return url.port as LocationSegment<T>;
                    }
                    if (segment === "position") {
                        const position = url.pathname.split("/")[1];
                        return new Vector3(
                            parseFloat(position.split(",")[0]),
                            parseFloat(position.split(",")[1]),
                            parseFloat(position.split(",")[2])
                        ) as LocationSegment<T>;
                    }
                    if (segment === "rotation") {
                        const rotation = url.pathname.split("/")[2];
                        return new Vector4(
                            parseFloat(rotation.split(",")[0]),
                            parseFloat(rotation.split(",")[1]),
                            parseFloat(rotation.split(",")[2]),
                            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                            parseFloat(rotation.split(",")[3])
                        ) as LocationSegment<T>;
                    }
                }
            } catch {
                return "None" as LocationSegment<T>;
            }
            return "None" as LocationSegment<T>;
        },

        loadLocation(value: string): void {
            this.domain = this.parseLocation(value, "domain");
            this.position = this.parseLocation(value, "position");
            this.rotation = this.parseLocation(value, "rotation");
        },

        setLocation(): void {
            const position = `${this.position.x.toString()},${this.position.y.toString()},${this.position.z.toString()}`;
            const rotation = `${this.rotation.x.toString()},${this.rotation.y.toString()},${this.rotation.z.toString()},${this.rotation.w.toString()}`;

            const newLocation = `${this.domain}/${position}/${rotation}`;
            (async () => {
                await this.openLocation(newLocation);
            })();
        },

        protocolIsSecure(protocol: string): boolean {
            return protocol === "WSS" || protocol === "HTTPS";
        },

        addLocationToBookmarks(): void {
            this.userStore.bookmarks.locations.push({
                name: this.newBookmark.name,
                color: this.newBookmark.color,
                url: this.userStore.avatar.location
            });
            this.newBookmark.name = "";
            this.newBookmark.color = "";
        },

        updateBookmark(index: number): void {
            const location = this.userStore.bookmarks.locations[index].url;
            this.userStore.bookmarks.locations.splice(index, 1, {
                name: this.newBookmark.name,
                color: this.newBookmark.color,
                url: location
            });
            this.newBookmark.name = "";
            this.newBookmark.color = "";
        },

        deleteBookmark(index: number): void {
            this.userStore.bookmarks.locations.splice(index, 1);
        },

        async copyLocationToClipboard(): Promise<void> {
            this.locationCopied = true;
            await navigator.clipboard.writeText(this.getLocation);
            const transitionTime = 1700;
            window.setTimeout(() => {
                this.locationCopied = false;
            }, transitionTime);
        },

        validateBookmarkName(value: string): boolean {
            // Validates against:
            // 1. Only contains alphanumeric characters, space, underscore, hyphen, and dot.
            // 2. Space, underscore, hyphen, and dot can't be at the start or end of a username.
            // 3. Space, underscore, hyphen, and dot can't be next to each other (e.g user_.name).
            // 4. Space, underscore, hyphen, or dot can't be used multiple times in a row (e.g user__name, user..name).
            // 5. Number of characters must be between 2 and 20.
            // eslint-disable-next-line require-unicode-regexp
            return (/^(?=[a-z0-9._-\s]{2,20}$)(?!.*[-_.\s]{2})[^-_.\s].*[^-_.\s]$/i).test(value);
        }
    },

    created() {
        void this.loadPlacesList();
    },

    beforeMount() {
        this.loadLocation(this.userStore.avatar.location);
        watch(() => this.userStore.avatar.location, (value) => this.loadLocation(value));
    }
});
</script>
