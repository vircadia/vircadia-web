<!--
//  Avatar.vue
//
//  Created by Giga on 27 Aug 2022.
//  Copyright 2022 Vircadia contributors.
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

<template>
    <OverlayShell
        icon="directions_run"
        title="Avatar"
        :managerProps="propsToPass"
        :defaultHeight="450"
        :defaultWidth="380"
        :defaultLeft="300"
        :hoverShowBar="false"
        :style="{
            'box-shadow': '0 1px 5px rgb(0 0 0 / 20%), 0 2px 2px rgb(0 0 0 / 14%), 0 3px 1px -2px rgb(0 0 0 / 12%)',
            border: 'none'
        }"
    >
        <q-card
            class="column no-wrap items-stretch full-height"
            style="background: transparent; box-shadow: none;"
        >
            <q-scroll-area
                class="col"
                style="height: 100%;"
            >
                <div class="row q-mb-md q-px-md">
                    <q-img
                        :src="getAvatarDataFromId(activeAvatar, 'image')"
                        draggable="false"
                        width="100px"
                        height="100px"
                        ratio="1"
                        class="q-mt-md q-mb-xs"
                        style="border-radius: 7px;"
                    />
                    <div class="col">
                        <div
                            title="Display name"
                            class="text-h5 text-left q-pl-md q-mt-md q-mb-sm cursor-pointer"
                        >
                            {{ playerName }}
                            <q-icon
                                title="Edit display name"
                                v-ripple
                                q-hoverable
                                name="edit"
                                class="text-grey q-ml-sm"
                            >
                                <span class="q-focus-helper"></span>
                            </q-icon>
                            <q-popup-edit v-model="playerName" auto-save v-slot="scope">
                                <q-input v-model="scope.value" dense autofocus counter @keyup.enter="scope.set" />
                            </q-popup-edit>
                        </div>
                        <div class="row q-ml-md q-pl-xs" style="border: 1px solid #8888;border-radius: 7px;">
                            <div class="text-caption q-mr-sm q-mt-sm">
                                <q-btn
                                    flat
                                    round
                                    dense
                                    fab-mini
                                    ripple
                                    :icon="getAvatarDataFromId(activeAvatar, 'starred') ? 'star' : 'star_outline'"
                                    :text-color="
                                        getAvatarDataFromId(activeAvatar, 'starred') ?
                                        'yellow' : $q.dark.isActive ? 'white' : 'dark'
                                    "
                                    title="Favorite"
                                    @click.stop="
                                        setAvatarDataFromId(
                                            activeAvatar,
                                            'starred',
                                            !getAvatarDataFromId(activeAvatar, 'starred')
                                        )
                                    "
                                />
                            </div>
                            <div class="col">
                                <p class="text-subtitle1 q-mb-none">
                                    {{ getAvatarDataFromId(activeAvatar, 'name') }}
                                </p>
                                <div
                                    :title="getAvatarDataFromId(activeAvatar, 'file')"
                                    class="text-caption ellipsis q-mb-xs"
                                    style="max-width: 27ch;"
                                >
                                    {{ getAvatarDataFromId(activeAvatar, 'file') }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <q-separator inset spaced />
                <template v-if="avatarList.length > 0">
                    <p class="text-subtitle1 text-left q-pl-md q-mt-md q-mb-xs">Your avatars:</p>
                    <q-list>
                        <q-item
                            v-for="avatar in avatarList"
                            :key="avatar.id"
                            class="q-mb-sm"
                            clickable
                            v-ripple
                            @click="selectAvatar(avatar.id)"
                        >
                            <q-item-section avatar>
                                <q-img
                                    :src="avatar.image"
                                    draggable="false"
                                    ratio="1"
                                    style="border-radius: 7px;"
                                />
                            </q-item-section>
                            <q-item-section>
                                {{ avatar.name }}
                            </q-item-section>
                            <q-item-section
                                style="flex: none;"
                            >
                                <q-btn
                                    flat
                                    round
                                    dense
                                    fab-mini
                                    ripple
                                    :icon="avatar.starred ? 'star' : 'star_outline'"
                                    :text-color="avatar.starred ? 'yellow' : $q.dark.isActive ? 'white' : 'dark'"
                                    title="Favorite"
                                    @click.stop="avatar.starred = !avatar.starred"
                                />
                            </q-item-section>
                        </q-item>
                        <q-item class="q-mb-sm">
                            <q-item-section>
                                <q-btn
                                    title="Add another avatar"
                                >
                                    <q-icon name="add" />
                                </q-btn>
                            </q-item-section>
                        </q-item>
                    </q-list>
                </template>
                <p v-else class="text-subtitle1 text-grey text-center q-mt-md">You have no saved avatars.</p>
                <q-separator inset spaced />
                <p class="text-subtitle1 text-center q-mt-md q-mb-xs">
                    {{ avatarList.length > 0 ? 'Or c' : 'C' }}reate your own avatar with:
                </p>
                <q-item class="q-pb-lg">
                    <q-item-section>
                        <q-btn
                            color="cyan-12"
                            text-color="dark"
                            @click="$emit('overlay-action', 'openOverlay:ReadyPlayerMe')"
                        >Ready Player Me</q-btn>
                    </q-item-section>
                </q-item>
            </q-scroll-area>
        </q-card>
    </OverlayShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import OverlayShell from "../OverlayShell.vue";

export interface AvatarEntry {
    name: string,
    id: string,
    image: string,
    file: string,
    scale: number,
    starred: boolean
}

export default defineComponent({
    name: "Avatar",

    props: {
        // Primary
        propsToPass: { type: Object, default: () => ({}) }
    },

    components: {
        OverlayShell
    },

    data: () => ({
        // The following is demo data:
        playerName: "Player",
        activeAvatar: "HTP45FSQ",
        avatarList: [
            {
                name: "Woody",
                id: "OC9RB9SH",
                image: "https://cdn-1.vircadia.com/us-e-1/Bazaar/Avatars/Woody/img/icon.png",
                file: "https://cdn-1.vircadia.com/us-e-1/Bazaar/Avatars/Woody/fbx/Woody.fst",
                scale: 1,
                starred: true
            },
            {
                name: "Kim",
                id: "HTP45FSQ",
                image: "https://cdn-1.vircadia.com/us-e-1/Bazaar/Avatars/Kim/img/icon.png",
                file: "https://cdn-1.vircadia.com/us-e-1/Bazaar/Avatars/Kim/fbx/Kim.fst",
                scale: 1,
                starred: true
            },
            {
                name: "Mason",
                id: "D14RUU5V",
                image: "https://cdn-1.vircadia.com/us-e-1/Bazaar/Avatars/Mason/img/icon.png",
                file: "https://cdn-1.vircadia.com/us-e-1/Bazaar/Avatars/Mason/fbx/Mason.fst",
                scale: 1,
                starred: false
            },
            {
                name: "Mike",
                id: "WNURE8HN",
                image: "https://cdn-1.vircadia.com/us-e-1/Bazaar/Avatars/Mike/img/icon.png",
                file: "https://cdn-1.vircadia.com/us-e-1/Bazaar/Avatars/Mike/fbx/Mike.fst",
                scale: 1,
                starred: false
            },
            {
                name: "Sean",
                id: "WENLVB35",
                image: "https://cdn-1.vircadia.com/us-e-1/Bazaar/Avatars/Sean/img/icon.png",
                file: "https://cdn-1.vircadia.com/us-e-1/Bazaar/Avatars/Sean/fbx/Sean.fst",
                scale: 1,
                starred: false
            },
            {
                name: "Summer",
                id: "UFMXDIRC",
                image: "https://cdn-1.vircadia.com/us-e-1/Bazaar/Avatars/Summer/img/icon.png",
                file: "https://cdn-1.vircadia.com/us-e-1/Bazaar/Avatars/Summer/fbx/Summer.fst",
                scale: 1,
                starred: false
            },
            {
                name: "Tanya",
                id: "A9LB4T5D",
                image: "https://cdn-1.vircadia.com/us-e-1/Bazaar/Avatars/Tanya/img/icon.png",
                file: "https://cdn-1.vircadia.com/us-e-1/Bazaar/Avatars/Tanya/fbx/Tanya.fst",
                scale: 1,
                starred: false
            }
        ] as AvatarEntry[]
    }),

    methods: {
        checkIfAvatarExists(id: string): boolean {
            for (const avatar of this.avatarList) {
                if (avatar.id === id) {
                    return true;
                }
            }
            return false;
        },
        getAvatarDataFromId(id: string, value?: keyof AvatarEntry): AvatarEntry | string | boolean | number {
            let avatarData = {} as AvatarEntry;

            for (const avatar of this.avatarList) {
                if (avatar.id === id) {
                    if (value && value in avatar) {
                        return avatar[value];
                    }
                    avatarData = avatar;
                    return avatarData;
                }
            }

            return false;
        },
        setAvatarDataFromId(id: string, key: keyof AvatarEntry, value: never): void {
            for (const avatar of this.avatarList) {
                if (avatar.id === id) {
                    if (key && key in avatar) {
                        avatar[key] = value;
                    }
                }
            }
        },
        selectAvatar(id: string): void {
            if (this.checkIfAvatarExists(id)) {
                this.activeAvatar = id;
            }
        }
    }
});
</script>