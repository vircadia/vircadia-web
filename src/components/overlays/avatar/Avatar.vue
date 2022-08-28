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
                <template v-if="avatarList.length > 0">
                    <p class="text-subtitle1 text-left q-pl-md q-mt-md q-mb-xs">Your avatars:</p>
                    <q-list>
                        <q-item
                            v-for="avatar in avatarList"
                            :key="avatar.id"
                            class="q-mb-sm"
                            clickable
                            v-ripple
                        >
                            <q-item-section avatar>
                                <img
                                    :src="avatar.image"
                                    draggable="false"
                                    alt=""
                                    width="56"
                                    height="56"
                                    style="border-radius: 7px;"
                                >
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
        avatarList: [
            {
                name: "Avatar 1",
                id: "HTP45FSQ",
                image: "https://vircadia.com/img/kalilaLang-2.9ab98e2c.webp",
                starred: true
            },
            {
                name: "Avatar 2",
                id: "U7RLFE2D",
                image: "https://vircadia.com/img/ry.3ec4f6e3.jpg",
                starred: false
            },
            {
                name: "Avatar 3",
                id: "PA245FE2",
                image: "https://vircadia-avatar.s3.amazonaws.com/diamond-sword-light/DS_Light_12.jpg",
                starred: false
            }
        ] as AvatarEntry[]
    }),

    methods: {
    }
});
</script>
