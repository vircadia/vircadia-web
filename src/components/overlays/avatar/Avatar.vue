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
                        v-if="!!(AvatarStoreInterface.getActiveModelData('image'))"
                        :src="AvatarStoreInterface.getActiveModelData('image')"
                        :draggable="false"
                        width="100px"
                        height="100px"
                        ratio="1"
                        class="q-mt-md q-mb-xs"
                        style="border-radius: 7px;"
                    />
                    <q-icon
                        v-else
                        name="mood"
                        size="xl"
                        class="q-pt-md q-pb-xs"
                        style="width: 100px;height: 100px;"
                    ></q-icon>
                    <div class="col">
                        <div
                            title="Display name"
                            class="text-h5 text-left q-pl-md q-mt-md q-mb-sm cursor-pointer"
                        >
                            {{ displayNameStore }}
                            <q-icon
                                title="Edit display name"
                                v-ripple
                                q-hoverable
                                name="edit"
                                class="text-grey q-ml-sm"
                            >
                                <span class="q-focus-helper"></span>
                            </q-icon>
                            <q-popup-edit
                                v-model="displayNameStore"
                                auto-save
                                v-slot="scope"
                                :validate="validateDisplayName"
                                >
                                <q-input
                                    v-model="scope.value"
                                    dense
                                    autofocus
                                    counter
                                    :color="AvatarStoreInterface.validateDisplayName(scope.value) ? 'primary' : 'negative'"
                                    @keyup.enter="scope.set"
                                />
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
                                    :icon="AvatarStoreInterface.getActiveModelData('starred') ? 'star' : 'star_outline'"
                                    :text-color="AvatarStoreInterface.getActiveModelData('starred') ?
                                        'yellow' : $q.dark.isActive ? 'white' : 'dark'"
                                    title="Favorite"
                                    @click.stop="
                                        AvatarStoreInterface.setActiveModelData(
                                            'starred',
                                            !AvatarStoreInterface.getActiveModelData('starred')
                                        )
                                    "
                                />
                            </div>
                            <div class="col">
                                <p class="text-subtitle1 q-mb-none">
                                    {{ AvatarStoreInterface.getActiveModelData('name') }}
                                </p>
                                <div
                                    :title="AvatarStoreInterface.getActiveModelData('file')"
                                    class="text-caption ellipsis q-mb-xs"
                                    style="max-width: 27ch;"
                                >
                                    {{ AvatarStoreInterface.getActiveModelData('file') }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <q-separator inset spaced />
                <template v-if="Object.entries($store.state.avatar.models).length > 0">
                    <p class="text-subtitle1 text-left q-pl-md q-mt-md q-mb-xs">Your avatars:</p>
                    <q-list>
                        <q-item
                            v-for="(avatar, id) in $store.state.avatar.models"
                            :key="id"
                            class="q-mb-sm"
                            clickable
                            v-ripple
                            @click="selectAvatar(id)"
                        >
                            <q-item-section avatar>
                                <q-img
                                    v-if="!!avatar.image"
                                    :src="avatar.image"
                                    :draggable="false"
                                    ratio="1"
                                    style="border-radius: 7px;"
                                />
                                <q-icon
                                    v-else
                                    name="mood"
                                    size="lg"
                                ></q-icon>
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
                                    @click.stop="AvatarStoreInterface.setModelData(id, 'starred', !avatar.starred)"
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
                    {{ Object.entries(this.$store.state.avatar.models).length > 0 ? 'Or c' : 'C' }}reate your own avatar with:
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
import { Renderer } from "@Modules/scene";
import { MyAvatarController } from "@Modules/avatar";
import { AvatarStoreInterface } from "@Modules/avatar/StoreInterface";
import { saveLocalValue } from "@Modules/localStorage";

import Log from "@Modules/debugging/log";

export default defineComponent({
    name: "Avatar",

    props: {
        // Primary
        propsToPass: { type: Object, default: () => ({}) }
    },

    components: {
        OverlayShell
    },

    data() {
        return {
            AvatarStoreInterface
        };
    },

    computed: {
        displayNameStore: {
            get: function(): string {
                return this.$store.state.avatar.displayName;
            },
            set: function(pVal: string): void {
                Log.debug(Log.types.AVATAR, `Avatar.vue: set displayNameStore. inputInfo=${pVal}`);
                const scene = Renderer.getScene();
                const avatarController = scene._myAvatar?.getComponent(MyAvatarController.typeName) as MyAvatarController;
                if (avatarController) {
                    avatarController.displayName = pVal;
                }
                saveLocalValue("displayName", pVal);
            }
        }
    },

    methods: {
        selectAvatar(modelId: string): void {
            if (modelId in this.$store.state.avatar.models) {
                AvatarStoreInterface.setActiveModel(modelId);
                saveLocalValue("activeModel", modelId);
                const scene = Renderer.getScene();
                scene.loadMyAvatar(AvatarStoreInterface.getModelData(modelId, "file") as string)
                    // .catch is a syntax error!?
                    // eslint-disable-next-line @typescript-eslint/dot-notation
                    .catch((err) => console.warn("Failed to load avatar:", err));
            }
        },
        validateDisplayName(value: string): boolean {
            // Validates against:
            // 1. Only contains alphanumeric characters, underscore, hyphen, and dot.
            // 2. Underscore, hyphen, and dot can't be at the start or end of a username.
            // 3. Underscore, hyphen, and dot can't be next to each other (e.g user_.name).
            // 4. Underscore, hyphen, or dot can't be used multiple times in a row (e.g user__name / user..name).
            // 5. Number of characters must be between 2 and 20.
            return (/^(?=[a-z0-9._-]{2,20}$)(?!.*[-_.]{2})[^-_.].*[^-_.]$/iu).test(value);
        }
    }
});
</script>
