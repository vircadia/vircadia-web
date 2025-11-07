//
//  user-store.ts
//
//  Created by Giga on 30 May 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";
import { Vec3 } from "@vircadia/web-sdk";
import type { onAttributeChangePayload } from "@Modules/account";
import { defaultActiveAvatarId, defaultAvatars } from "@Modules/avatar/DefaultModels";
import type { Domain } from "@Base/modules/domain/domain";
import type { DomainAvatarClient } from "@Base/modules/domain/avatar";
import { DataMapper } from "@Modules/domain/dataMapper";
import type { vec3 } from "@vircadia/web-sdk";

const persistentStorageMedium = localStorage;

// Robust mobile/touch-first detection (covers iPadOS and similar devices).
function isMobileLikeDevice(): boolean {
    try {
        const uaMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/iu
            .test(typeof navigator !== "undefined" ? navigator.userAgent : "");
        const hasTouch = (typeof navigator !== "undefined" && "maxTouchPoints" in navigator && (navigator as Navigator).maxTouchPoints > 0)
            || (typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
        return uaMobile || hasTouch;
    } catch {
        return false;
    }
}

function getDefaultGraphicsSettings() {
    const isMobile = isMobileLikeDevice();
    if (isMobile) {
        // Lower defaults for mobile/touch devices to improve performance and thermals.
        return {
            renderScale: 0.5,
            fieldOfView: 80,
            bloom: false,
            fxaaEnabled: true,
            msaa: 1, // Off
            sharpen: false,
            fpsCounter: false,
            cameraBobbing: false,
            // Performance/compatibility toggles
            enableSceneOptimizer: true,
            textureClampEnabled: true,
            textureMaxSize: 512,
            reduceSkyboxCubeSize: true,
            skyboxCubeSize: 256,
            envHdrCubeSize: 256,
            deferTextureDisposal: true,
            webgpuOnMobile: false,
            forceWebGL: false
        };
    }
    // Desktop defaults
    return {
        renderScale: 1.0,
        fieldOfView: 85,
        bloom: true,
        fxaaEnabled: true,
        msaa: 2,
        sharpen: false,
        fpsCounter: true,
        cameraBobbing: true,
        // Performance/compatibility toggles
        enableSceneOptimizer: false,
        textureClampEnabled: false,
        textureMaxSize: 1024,
        reduceSkyboxCubeSize: false,
        skyboxCubeSize: 1024,
        envHdrCubeSize: 512,
        deferTextureDisposal: true,
        webgpuOnMobile: false,
        forceWebGL: false
    };
}

// Function to generate a hash of an object
function generateHash(obj: object): string {
    const str = JSON.stringify(obj);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
}

// Function to get the current avatar settings with version hash
function getCurrentAvatarSettings() {
    const defaultModels = defaultAvatars();
    const modelVersion = generateHash(defaultModels);

    return {
        displayName: process.env.VRCA_DEFAULT_AVATAR_DISPLAY_NAME ?? "anonymous",
        showLabels: true,
        position: Vec3.ZERO,
        location: "0,0,0",
        models: defaultModels,
        activeModel: defaultActiveAvatarId(),
        modelVersion
    };
}

const defaultControls = {
    keyboard: {
        movement: {
            walkForwards: { name: "Walk Forwards", keycode: "KeyW" } as Keybind,
            walkBackwards: { name: "Walk Backwards", keycode: "KeyS" } as Keybind,
            walkLeft: { name: "Walk Left", keycode: "KeyA" } as Keybind,
            walkRight: { name: "Walk Right", keycode: "KeyD" } as Keybind,
            run: { name: "Run", keycode: "ShiftLeft" } as Keybind,
            jump: { name: "Jump", keycode: "Space" } as Keybind,
            crouch: { name: "Crouch", keycode: "KeyC" } as Keybind,
            fly: { name: "Fly", keycode: "KeyF" } as Keybind,
            sit: { name: "Sit", keycode: "KeyG" } as Keybind,
            clap: { name: "Clap", keycode: "KeyH" } as Keybind,
            salute: { name: "Salute", keycode: "KeyJ" } as Keybind
        },
        camera: {
            pitchUp: { name: "Pitch Up", keycode: "ArrowUp" } as Keybind,
            pitchDown: { name: "Pitch Down", keycode: "ArrowDown" } as Keybind,
            yawLeft: { name: "Yaw Left", keycode: "ArrowLeft" } as Keybind,
            yawRight: { name: "Yaw Right", keycode: "ArrowRight" } as Keybind,
            firstPerson: { name: "First-Person", keycode: "Digit1" } as Keybind,
            thirdPerson: { name: "Third-Person", keycode: "Digit3" } as Keybind,
            collisions: { name: "Toggle Collisions", keycode: "Digit4" } as Keybind
        },
        audio: {
            mute: { name: "Toggle Mic Mute", keycode: "KeyV" } as Keybind,
            pushToTalk: { name: "Push-To-Talk", keycode: "KeyB" } as Keybind
        },
        other: {
            resetPosition: { name: "Reset Position", keycode: "KeyK" } as Keybind,
            toggleMenu: { name: "Toggle Menu", keycode: "KeyM" } as Keybind,
            openChat: { name: "Open Chat", keycode: "KeyT" } as Keybind
        }
    },
    mouse: {
        acceleration: true,
        invert: false,
        sensitivity: 50
    }
};

export type KeyboardControlCategory = keyof typeof defaultControls.keyboard;
export type KeyboardControl<T extends KeyboardControlCategory> = keyof typeof defaultControls.keyboard[T];
export interface Keybind {
    name: string,
    keycode: string
}

export interface LocationBookmark {
    name: string,
    color: string,
    url: string
}

export const useUserStore = defineStore("user", {
    state: () => ({
        // Device characteristics (non-persistent)
        device: {
            isMobile: isMobileLikeDevice()
        },
        avatar: useStorage(
            "userAvatarSettings",
            getCurrentAvatarSettings(),
            persistentStorageMedium,
            {
                mergeDefaults: (storageValue, defaults) => {
                    if (!storageValue || storageValue.modelVersion !== defaults.modelVersion) {
                        // If the model version has changed, update models and reset active model
                        return {
                            ...storageValue,
                            models: defaults.models,
                            activeModel: defaults.activeModel,
                            modelVersion: defaults.modelVersion
                        };
                    }
                    return { ...defaults, ...storageValue };
                },
                listenToStorageChanges: false
            }
        ),
        // Graphics configuration.
        graphics: useStorage(
            "userGraphicsSettings",
            getDefaultGraphicsSettings(),
            persistentStorageMedium,
            { mergeDefaults: true, listenToStorageChanges: false }
        ),
        // Information about the logged in account. Refer to Account module.
        account: useStorage(
            "userAccountSettings",
            {
                id: "UNKNOWN",
                username: "Guest",
                isLoggedIn: false,
                accessToken: "UNKNOWN",
                refreshToken: null as string | null,
                tokenType: "Bearer",
                accessTokenExpiration: 0,
                scope: "UNKNOWN",
                isAdmin: false,
                useAsAdmin: false,
                images: {
                    hero: undefined as string | undefined,
                    tiny: undefined as string | undefined,
                    thumbnail: undefined as string | undefined
                }
            },
            persistentStorageMedium,
            { mergeDefaults: true, listenToStorageChanges: false }
        ),
        // Saved bookmarks.
        bookmarks: useStorage(
            "userBookmarks",
            {
                locations: [] as Array<LocationBookmark>
            },
            persistentStorageMedium,
            { mergeDefaults: true, listenToStorageChanges: true }
        ),
        // Controls.
        controls: useStorage("userControlSettings",
            defaultControls,
            persistentStorageMedium,
            { mergeDefaults: true, listenToStorageChanges: true }
        )
    }),

    actions: {
        /**
         * Reset the state of the store to default.
         */
        reset(): void {
            this.$reset();
        },
        /**
         * Update the stored account information for the current user.
         * @param data
         */
        updateAccountInfo(data: onAttributeChangePayload): void {
            this.account.accessToken = data.accessToken;
            this.account.isAdmin = data.isAdmin;
            this.account.isLoggedIn = data.isLoggedIn;
            this.account.scope = data.scope;
            this.account.tokenType = data.accessTokenType;
            this.account.username = data.accountInfo.username;
            this.account.id = data.id;
            this.account.refreshToken = data.refreshToken ?? null;
            if (data.accessTokenExpiration instanceof Date) {
                this.account.accessTokenExpiration = data.accessTokenExpiration.getTime();
            }
            Object.assign(this.account.images, data.accountInfo.images ?? {});
        },
        /**
         * Update the stored information for the local avatar.
         * @param domain A reference to the domain server connection instance.
         * @param domainAvatar `(Optional)` A reference to the local avatar instance.
         * @param position `(Optional)` The new position of the local avatar in the world.
         */
        updateLocalAvatarInfo(domain: Domain, domainAvatar?: DomainAvatarClient, position?: vec3): void {
            const domainLocation = domain.DomainClient
                ? domain.Location.protocol + "//" + domain.Location.host
                : "Disconnected";
            if (domainAvatar) {
                const myAvaInfo = domainAvatar.MyAvatar;
                this.avatar.displayName = myAvaInfo?.displayName ?? myAvaInfo?.sessionDisplayName ?? "anonymous";
                this.avatar.location
                    = `${domainLocation}/${DataMapper.vec3ToString(myAvaInfo?.position)}/${DataMapper.quaternionToString(myAvaInfo?.orientation)}`;
                this.avatar.position = myAvaInfo?.position ?? Vec3.ZERO;
            }
            // An optional update to just the avatar's position.
            if (position) {
                this.avatar.position = position;
                this.avatar.location = `${domainLocation}/${DataMapper.vec3ToString(position)}/${DataMapper.quaternionToString(null)}`;
            }
        }
    }
});
