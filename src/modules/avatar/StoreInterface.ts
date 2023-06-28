//
//  StoreInterface.ts
//
//  Created by Giga on 1 Sep 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { fallbackAvatar, fallbackAvatarId, type AvatarEntry } from "./DefaultModels";
import { userStore } from "@Stores/index";
import { Renderer } from "@Modules/scene";

function generateID(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const idLength = 8;
    let ID = "";
    for (let i = 0; i < idLength; i += 1) {
        ID += chars[Math.floor(Math.random() * chars.length)];
    }
    return ID;
}

function getModelData(modelId: string | number): AvatarEntry;
function getModelData<T extends keyof AvatarEntry>(modelId: string | number, key: T): AvatarEntry[T];
function getModelData<T extends keyof AvatarEntry>(modelId: string | number, key?: T): AvatarEntry | AvatarEntry[T] {
    const models = userStore.avatar.models as { [key: string]: AvatarEntry };
    if (key && key in (models[modelId] || fallbackAvatar())) {
        return models[modelId][key];
    }
    return models[modelId] || fallbackAvatar();
}

function getActiveModelData(): AvatarEntry;
function getActiveModelData<T extends keyof AvatarEntry>(key: T): AvatarEntry[T];
function getActiveModelData<T extends keyof AvatarEntry>(key?: T): AvatarEntry | AvatarEntry[T] {
    const activeModel = userStore.avatar.activeModel;
    if (key) {
        return getModelData(activeModel, key);
    }
    return getModelData(activeModel);
}

export const AvatarStoreInterface = {
    getModelData,

    getActiveModelData,

    getAllModelsJSON(): string {
        return JSON.stringify(userStore.avatar.models);
    },

    setModelData<T extends keyof AvatarEntry>(modelId: string | number, key: T, value: AvatarEntry[T]): void {
        if (modelId in userStore.avatar.models) {
            userStore.avatar.models[modelId][key] = value;

            if (key === "file") {
                this.setActiveModel(modelId);
            }
        }
    },

    setActiveModelData(key: keyof AvatarEntry, value: string | number | boolean): void {
        const activeModel = userStore.avatar.activeModel;
        this.setModelData(activeModel, key, value);
    },

    createNewModel(modelData: AvatarEntry, setToActive = true): string {
        let ID = generateID();
        // Ensure that the model ID doesn't already exist.
        while (ID in userStore.avatar.models) {
            ID = generateID();
        }

        userStore.avatar.models[ID] = modelData;

        if (setToActive) {
            this.setActiveModel(ID);
        }

        return ID;
    },

    removeModel(modelId: string | number): void {
        // Prevent the fallback model from being deleted.
        if (modelId === fallbackAvatarId()) {
            return;
        }

        // Switch to the fallback model if the removed model is currently equipped.
        if (modelId === userStore.avatar.activeModel) {
            this.setActiveModel(fallbackAvatarId());
        }

        // Remove the requested model from the Store.
        if (modelId in userStore.avatar.models) {
            delete userStore.avatar.models[modelId];
        }
    },

    setActiveModel(modelId: string | number): void {
        if (modelId in userStore.avatar.models) {
            userStore.avatar.activeModel = typeof modelId === "number" ? modelId.toString() : modelId;
        }
        try {
            const scene = Renderer.getScene();
            scene.loadMyAvatar(AvatarStoreInterface.getModelData(modelId, "file")).catch((err) => console.warn("Failed to load avatar:", err));
        } catch (error) {
            console.warn("Cannot render active avatar model before the scene has been loaded.", error);
        }
    }
};
