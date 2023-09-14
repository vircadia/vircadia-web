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
    .slide-left-enter-active,
    .slide-left-leave-active {
        transition: all 0.25s ease-out;
    }

    .slide-left-enter-active {
        margin-left: 0px;
    }

    .slide-left-leave-active {
        position: absolute;
        top: 18px;
        left: 4.5rem;
    }

    .slide-left-enter-from {
        opacity: 0;
        transform: translateX(30px);
    }

    .slide-left-leave-to {
        opacity: 0;
        transform: translateX(-30px);
    }

    .q-item--active {
        box-shadow: 3px 0px 0px 0px currentColor inset;
    }
</style>
<style>
    .avatar-search.q-field--standout.q-field--highlighted .q-field__control {
        background: #ffffff12;
    }
    .avatar-search.q-field--standout.q-field--highlighted .q-field__native {
        color: #000;
    }
    .avatar-search.q-field--standout.q-field--highlighted .q-field__label {
        color: #0000008a;
    }
    .avatar-search.q-field--standout.q-field--highlighted .q-field__append {
        color: #0000008a;
    }

    .avatar-search.q-field--standout.q-field--dark.q-field--highlighted .q-field__control {
        background: #ffffff12;
    }
    .avatar-search.q-field--standout.q-field--dark.q-field--highlighted .q-field__native {
        color: #fff;
    }
    .avatar-search.q-field--standout.q-field--dark.q-field--highlighted .q-field__label {
        color: #ffffffb3;
    }
    .avatar-search.q-field--standout.q-field--dark.q-field--highlighted .q-field__append {
        color: #ffffffb3;
    }
</style>

<template>
    <OverlayShell
        icon="directions_run"
        title="Avatar"
        :managerProps="propsToPass"
        :defaultHeight="730"
        :defaultWidth="380"
        :defaultLeft="250"
        :defaultTop="50"
        :hoverShowBar="false"
        :style="{
            'box-shadow': '0 1px 5px rgb(0 0 0 / 20%), 0 2px 2px rgb(0 0 0 / 14%), 0 3px 1px -2px rgb(0 0 0 / 12%)',
            border: 'none'
        }"
    >
        <q-card
            class="column no-wrap items-stretch full-height non-selectable"
            style="background: transparent;box-shadow: none;"
        >
                <div class="row q-mb-sm q-px-md">
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
                                    label="Display Name"
                                    :color="validateDisplayName(scope.value) ? 'primary' : 'negative'"
                                    @keyup.enter="scope.set"
                                />
                            </q-popup-edit>
                        </div>
                        <div class="row q-ml-md q-pl-xs" style="border: 1px solid #8888;border-radius: 7px;">
                            <div
                                class="q-my-auto q-ml-sm text-subtitle2 text-no-wrap ellipsis"
                                :class="{ 'cursor-pointer': userStore.avatar.activeModel !== fallbackModelId }"
                                title="Avatar name"
                            >
                                {{ activeModelNameStore }}
                                <q-popup-edit
                                    v-if="userStore.avatar.activeModel !== fallbackModelId"
                                    v-model="activeModelNameStore"
                                    auto-save
                                    v-slot="scope"
                                    :validate="validateModelName"
                                >
                                    <q-input
                                        v-model="scope.value"
                                        dense
                                        autofocus
                                        counter
                                        label="Avatar name"
                                        :color="validateModelName(scope.value) ? 'primary' : 'negative'"
                                        @keyup.enter="scope.set"
                                    />
                                </q-popup-edit>
                            </div>
                            <div class="q-my-xs q-mr-sm q-ml-auto">
                                <q-btn
                                    flat
                                    round
                                    dense
                                    ripple
                                    :icon="AvatarStoreInterface.getActiveModelData('starred') ? 'star' : 'star_outline'"
                                    :text-color="AvatarStoreInterface.getActiveModelData('starred') ?
                                        'yellow' : $q.dark.isActive ? 'white' : 'dark'"
                                    title="Favorite"
                                    class="text-caption"
                                    @click.stop="() => {
                                        AvatarStoreInterface.setActiveModelData(
                                            'starred',
                                            !AvatarStoreInterface.getActiveModelData('starred')
                                        );
                                        loadAvatarList();
                                    }"
                                />
                                <q-btn
                                    flat
                                    round
                                    dense
                                    ripple
                                    icon="refresh"
                                    title="Reload"
                                    class="text-caption"
                                    @click.stop="selectAvatar(userStore.avatar.activeModel, true)"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <q-separator inset spaced />
                <div class="row q-gutter-x-md text-subtitle1 text-left q-px-md q-mt-sm q-mb-xs" style="flex-flow: row nowrap;">
                    <p class="q-my-auto">My Avatars</p>
                    <q-btn
                        dense
                        round
                        color="primary"
                        icon="add"
                        title="Add a new avatar"
                        class="q-mt-xs"
                        style="width: 2.4em;height: 2.4em;"
                    >
                        <q-popup-edit
                            v-model="modelCreateDialog"
                            v-slot="scope"
                        >
                            New Avatar
                            <q-input
                                v-model="customModel.image"
                                label="Image URL (optional)"
                                dense
                                :color="
                                    validateModelImage(customModel.image) || customModel.image.length < 1 ?
                                    'primary' : 'negative'
                                "
                            />
                            <q-input
                                v-model="customModel.url"
                                label="Model URL"
                                dense
                                :color="
                                    validateModelFile(customModel.url) || customModel.url.length < 1 ?
                                    'primary' : 'negative'
                                "
                            />
                            <q-input
                                v-model="customModel.name"
                                label="Name"
                                dense
                                counter
                                :color="validateModelName(scope.value) ? 'primary' : 'negative'"
                            />
                            <div class="row q-gutter-x-md">
                                <q-btn @click="() => { scope.cancel(); }">Cancel</q-btn>
                                <q-btn color="primary" @click="() => { scope.set();saveCustomAvatar(); }">Ok</q-btn>
                            </div>
                        </q-popup-edit>
                    </q-btn>
                    <q-input
                        standout
                        dense
                        rounded
                        class="avatar-search"
                        style="max-width: 40%;margin-left: auto;"
                        label="Search"
                        v-model="listFilterValue"
                        clearable
                        @keyup="loadAvatarList()"
                        @change="loadAvatarList()"
                        @clear="loadAvatarList()"
                    />
                </div>
                <div style="height: 100%;" class="column no-wrap items-stretch full-height">
                    <q-scroll-area
                        class="col"
                        style="height: 100%;"
                    >
                        <template v-if="Object.entries(avatarList).length > 0">
                            <q-list>
                                <q-item
                                    v-for="(avatar, id) in avatarList"
                                    :key="id"
                                    :active="id === userStore.avatar.activeModel"
                                    class="q-mb-sm"
                                    clickable
                                    v-ripple
                                    @click="selectAvatar(id)"
                                >
                                    <q-item-section avatar>
                                        <q-img
                                            v-if="!!avatar.avatar.image"
                                            :src="avatar.avatar.image"
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
                                    <TransitionGroup name="slide-left">
                                        <q-item-section v-if="!avatar.showMoreOptions" key="front">
                                            {{ avatar.avatar.name }}
                                        </q-item-section>
                                        <!--Back side of the item.-->
                                        <q-item-section
                                            v-else
                                            key="back"
                                            style="top: 8px !important;flex-flow: row nowrap;justify-content: flex-start;
                                            height: 60%;margin-top: 3px;"
                                        >
                                            <template v-if="id !== fallbackModelId">
                                                <q-btn
                                                    flat
                                                    round
                                                    dense
                                                    ripple
                                                    icon="edit"
                                                    :text-color="$q.dark.isActive ? 'white' : 'dark'"
                                                    title="Rename"
                                                    @click.stop=""
                                                >
                                                    <q-popup-edit
                                                        :model-value="avatar.avatar.name"
                                                        @update:model-value="(value: string) => {
                                                            AvatarStoreInterface.setModelData(id, 'name', value);
                                                        }"
                                                        auto-save
                                                        v-slot="scope"
                                                        :validate="validateModelName"
                                                        buttons
                                                    >
                                                        <q-input
                                                            v-model="scope.value"
                                                            dense
                                                            autofocus
                                                            counter
                                                            label="Avatar Name"
                                                            :color="validateModelName(scope.value) ? 'primary' : 'negative'"
                                                            @keyup.enter="scope.set"
                                                        />
                                                    </q-popup-edit>
                                                </q-btn>
                                                <q-btn
                                                    flat
                                                    round
                                                    dense
                                                    ripple
                                                    icon="image"
                                                    :text-color="$q.dark.isActive ? 'white' : 'dark'"
                                                    title="Change avatar image"
                                                    @click.stop=""
                                                >
                                                    <q-popup-edit
                                                        :model-value="avatar.avatar.image"
                                                        @update:model-value="(value: string) => {
                                                            AvatarStoreInterface.setModelData(id, 'image', value);
                                                        }"
                                                        auto-save
                                                        v-slot="scope"
                                                        :validate="validateModelImage"
                                                        buttons
                                                    >
                                                        <q-input
                                                            v-model="scope.value"
                                                            dense
                                                            autofocus
                                                            counter
                                                            label="Image URL"
                                                            :color="validateModelImage(scope.value) ? 'primary' : 'negative'"
                                                            @keyup.enter="scope.set"
                                                        />
                                                    </q-popup-edit>
                                                </q-btn>
                                                <q-btn
                                                    flat
                                                    round
                                                    dense
                                                    ripple
                                                    icon="link"
                                                    :text-color="$q.dark.isActive ? 'white' : 'dark'"
                                                    title="Change avatar file"
                                                    @click.stop=""
                                                >
                                                    <q-popup-edit
                                                        :model-value="avatar.avatar.file"
                                                        @update:model-value="(value: string) => {
                                                            AvatarStoreInterface.setModelData(id, 'file', value);
                                                        }"
                                                        auto-save
                                                        v-slot="scope"
                                                        :validate="validateModelFile"
                                                        buttons
                                                    >
                                                        <q-input
                                                            v-model="scope.value"
                                                            dense
                                                            autofocus
                                                            counter
                                                            label="Model URL"
                                                            :color="validateModelFile(scope.value) ? 'primary' : 'negative'"
                                                            @keyup.enter="scope.set"
                                                        />
                                                    </q-popup-edit>
                                                </q-btn>
                                                <q-btn
                                                    flat
                                                    round
                                                    dense
                                                    ripple
                                                    icon="delete"
                                                    text-color="red"
                                                    title="Remove avatar"
                                                    @click.stop="AvatarStoreInterface.removeModel(id);loadAvatarList();"
                                                />
                                            </template>
                                        </q-item-section>
                                    </TransitionGroup>
                                    <q-item-section
                                        style="flex-flow: row nowrap;flex: none;
                                        height: 100%;margin-top: 3px;"
                                    >
                                        <q-btn
                                            v-if="id !== fallbackModelId"
                                            flat
                                            round
                                            dense
                                            ripple
                                            icon="more_horiz"
                                            :text-color="$q.dark.isActive ? 'white' : 'dark'"
                                            title="More options"
                                            @click.stop="avatar.showMoreOptions = !avatar.showMoreOptions"
                                        />
                                        <q-btn
                                            flat
                                            round
                                            dense
                                            ripple
                                            :icon="avatar.avatar.starred ? 'star' : 'star_outline'"
                                            :text-color="avatar.avatar.starred ? 'yellow' : $q.dark.isActive ? 'white' : 'dark'"
                                            title="Favorite"
                                            @click.stop="
                                                AvatarStoreInterface.setModelData(id, 'starred', !avatar.avatar.starred)
                                            "
                                        />
                                    </q-item-section>
                                </q-item>
                            </q-list>
                        </template>
                        <p v-else class="text-subtitle1 text-grey text-center q-mt-md">You have no saved avatars.</p>
                    </q-scroll-area>
                </div>
                <q-separator inset spaced />
                <p class="text-subtitle1 text-center q-mt-xs q-mb-xs">
                    {{ Object.entries(userStore.avatar.models).length > 0 ? 'Or c' : 'C' }}reate your own avatar with:
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
        </q-card>
    </OverlayShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { userStore } from "@Stores/index";
import { Renderer } from "@Modules/scene";
import { MyAvatarController } from "@Modules/avatar";
import { type AvatarModel, fallbackAvatarId } from "@Modules/avatar/DefaultModels";
import { AvatarStoreInterface } from "@Modules/avatar/StoreInterface";
import OverlayShell from "../OverlayShell.vue";
import Log from "@Modules/debugging/log";

// This interface allows us to add UI-only properties to each avatar entry.
interface AvatarModelListItemMap {
    [key: string]: {
        avatar: AvatarModel,
        showMoreOptions: boolean
    }
}

export default defineComponent({
    name: "AvatarOverlay",

    props: {
        // Primary
        propsToPass: { type: Object, default: () => ({}) }
    },

    components: {
        OverlayShell
    },

    setup() {
        return {
            userStore
        };
    },

    data() {
        return {
            AvatarStoreInterface,
            avatarList: {} as AvatarModelListItemMap,
            listFilterValue: "",
            modelCreateDialog: false,
            customModel: {
                name: "",
                image: "",
                url: ""
            },
            loadingAvatar: false,
            fallbackModelId: fallbackAvatarId()
        };
    },

    computed: {
        displayNameStore: {
            get: function(): string {
                return this.userStore.avatar.displayName;
            },
            set: function(pVal: string): void {
                Log.debug(Log.types.AVATAR, `Avatar.vue: set displayNameStore. inputInfo=${pVal}`);
                const scene = Renderer.getScene();
                const avatarController = scene._myAvatar?.getComponent(MyAvatarController.typeName);
                if (avatarController instanceof MyAvatarController) {
                    avatarController.displayName = pVal;
                }
                this.userStore.avatar.displayName = pVal;
            }
        },
        activeModelNameStore: {
            get: function(): string {
                return AvatarStoreInterface.getActiveModelData("name");
            },
            set: function(pVal: string): void {
                AvatarStoreInterface.setActiveModelData("name", pVal);
            }
        },
        activeModelFileStore: {
            get: function(): string {
                return AvatarStoreInterface.getActiveModelData("file");
            },
            set: function(pVal: string): void {
                AvatarStoreInterface.setActiveModelData("file", pVal);
            }
        }
    },

    methods: {
        loadAvatarList(): void {
            this.avatarList = {} as AvatarModelListItemMap;
            const storeModelsList = this.sortAvatarList(this.listFilterValue);
            for (let i = 0; i < storeModelsList.length; i++) {
                const key = storeModelsList[i][0];
                const value = storeModelsList[i][1];
                this.avatarList[key] = { avatar: value, showMoreOptions: false };
            }
        },
        async selectAvatar(modelId: string | number, reload?: boolean): Promise<void> {
            if (!this.loadingAvatar && modelId in this.userStore.avatar.models) {
                this.loadingAvatar = true;
                AvatarStoreInterface.setActiveModel(modelId);
                const scene = Renderer.getScene();
                await scene.loadMyAvatar(AvatarStoreInterface.getModelData(modelId, "file"), reload);
                this.loadingAvatar = false;
            }
        },
        validateDisplayName(value: string): boolean {
            // Validates against:
            // 1. Only contains alphanumeric characters, space, underscore, hyphen, and dot.
            // 2. Space, underscore, hyphen, and dot can't be at the start or end of a username.
            // 3. Space, underscore, hyphen, and dot can't be next to each other (e.g user_.name).
            // 4. Space, underscore, hyphen, or dot can't be used multiple times in a row (e.g user__name, user..name).
            // 5. Number of characters must be between 2 and 20.
            // eslint-disable-next-line require-unicode-regexp
            return (/^(?=[a-z0-9._-\s]{2,20}$)(?!.*[-_.\s]{2})[^-_.\s].*[^-_.\s]$/i).test(value);
        },
        validateModelName(value: string): boolean {
            // Validates against:
            // 1. Only contains alphanumeric characters, space, underscore, hyphen, and dot.
            // 2. Space, underscore, hyphen, and dot can't be at the start or end of a username.
            // 3. Space, underscore, hyphen, and dot can't be next to each other (e.g user_.name).
            // 4. Space, underscore, hyphen, or dot can't be used multiple times in a row (e.g user__name, user..name).
            // 5. Number of characters must be between 2 and 20.
            // eslint-disable-next-line require-unicode-regexp
            return (/^(?=[a-z0-9._-\s]{2,20}$)(?!.*[-_.\s]{2})[^-_.\s].*[^-_.\s]$/i).test(value);
        },
        // FIXME This check needs to be more robust.
        validateModelFile(value: string): boolean {
            // Validates against:
            // 1. File URL has ".glb" or ".gltf" at the end.
            return (/(?:\.glb|\.gltf)$/iu).test(value);
        },
        // FIXME This check needs to be more robust.
        validateModelImage(value: string): boolean {
            // Validates against:
            // 1. File URL has ".png", ".jpg", ".jpeg", or ".webp" at the end.
            return (/(?:\.png|\.jpg|\.jpeg|\.webp)$/iu).test(value);
        },
        filterAvatarList(filterValue?: string) {
            if (!filterValue || filterValue === "") {
                return this.userStore.avatar.models;
            }
            const filteredList = {} as { [key: string]: AvatarModel };
            Object.entries(this.userStore.avatar.models).forEach((avatar) => {
                if (avatar[1].name.toLowerCase().includes(filterValue.toLowerCase())) {
                    filteredList[avatar[0]] = avatar[1];
                }
            });
            return filteredList;
        },
        sortAvatarList(filterValue?: string) {
            const sortedList = Object.entries(this.filterAvatarList(filterValue));
            sortedList.sort((x, y) => {
                let output = 0;
                const xStarred = x[1].starred;
                const yStarred = y[1].starred;
                if (xStarred && xStarred !== yStarred) {
                    output = -1;
                } else {
                    output = 1;
                }
                return output;
            });
            return sortedList;
        },
        saveCustomAvatar(): void {
            if (this.validateModelName(this.customModel.name) && this.validateModelFile(this.customModel.url)) {
                // Add the new model to the store.
                AvatarStoreInterface.createNewModel(
                    {
                        name: this.customModel.name,
                        image: this.customModel.image,
                        file: this.customModel.url,
                        scale: 1,
                        starred: true
                    },
                    true
                );
                // Clear the custom model dialog data.
                this.customModel.name = "";
                this.customModel.image = "";
                this.customModel.url = "";
                // Refresh the avatar list.
                this.loadAvatarList();
            }
        }
    },

    beforeMount() {
        this.loadAvatarList();
    }
});
</script>
