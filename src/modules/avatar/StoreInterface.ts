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

import { fallbackAvatar, fallbackAvatarId, type AvatarModel } from "./DefaultModels";
import { userStore } from "@Stores/index";
import { Renderer } from "@Modules/scene";

/**
 * Static methods for interacting with the list of avatar models in the Store.
 */
export class AvatarStoreInterface {
    /**
     * Generate a random, alpha-numeric, 8 character long ID string that is unique within the avatar Store.
     * @returns An ID string.
     */
    private static _generateID(): string {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        const idLength = 8;
        function generate(): string {
            let id = "";
            for (let i = 0; i < idLength; i += 1) {
                id += chars[Math.floor(Math.random() * chars.length)];
            }
            return id;
        }
        let uniqueId = generate();
        // Ensure that the ID doesn't already exist in the Store.
        while (uniqueId in userStore.avatar.models) {
            uniqueId = generate();
        }
        return uniqueId;
    }

    /**
     * Retrieve the data (name, thumbnail, scale, etc) for a given avatar model.
     * @param modelId The ID of the model to retrieve.
     * @param key `(Optional)` A specific property of the model to retrieve.
     * @returns The data for the requested avatar model, or the fallback model if the requested one doesn't exist.
     * If a key was specified, only the value of that property is returned.
     */
    public static getModelData(modelId: string | number): AvatarModel;
    public static getModelData<T extends keyof AvatarModel>(modelId: string | number, key: T): AvatarModel[T];
    public static getModelData<T extends keyof AvatarModel>(modelId: string | number, key?: T): AvatarModel | AvatarModel[T] {
        const models = userStore.avatar.models;
        if (key && key in (models[modelId] || fallbackAvatar())) {
            return models[modelId][key];
        }
        return models[modelId] || fallbackAvatar();
    }

    /**
     * Retrieve the data (name, thumbnail, scale, etc) for the avatar model currently equipped by the user.
     * @param key `(Optional)` A specific property of the model to retrieve.
     * @returns The data for the currently equipped avatar model, or the fallback model if the currently equipped one doesn't exist.
     * If a key was specified, only the value of that property is returned.
     */
    public static getActiveModelData(): AvatarModel;
    public static getActiveModelData<T extends keyof AvatarModel>(key: T): AvatarModel[T];
    public static getActiveModelData<T extends keyof AvatarModel>(key?: T): AvatarModel | AvatarModel[T] {
        const activeModel = userStore.avatar.activeModel;
        if (key) {
            return this.getModelData(activeModel, key);
        }
        return this.getModelData(activeModel);
    }

    /**
     * @returns A stringified map of all the stored avatar models.
     */
    public static getAllModelsJSON(): string {
        return JSON.stringify(userStore.avatar.models);
    }

    /**
     * Set the value of a specific property of an avatar model.
     * @param modelId The ID of the model to update.
     * @param key The property to update.
     * @param value The new value for that property.
     */
    public static setModelData<T extends keyof AvatarModel>(modelId: string | number, key: T, value: AvatarModel[T]): void {
        if (modelId in userStore.avatar.models) {
            userStore.avatar.models[modelId][key] = value;
            // If the model's file was updated, make it the active model so there is immediate feedback on that change.
            if (key === "file") {
                this.setActiveModel(modelId);
            }
        }
    }

    /**
     * Set the value of a specific property of the avatar model currently equipped by the user.
     * @param key The property to update.
     * @param value The new value for that property.
     */
    public static setActiveModelData(key: keyof AvatarModel, value: string | number | boolean): void {
        const activeModel = userStore.avatar.activeModel;
        this.setModelData(activeModel, key, value);
    }

    /**
     * Create an entry for a new avatar model in the Store.
     * @param modelData The data (name, thumbnail, scale, etc) for the new avatar model.
     * @param setToActive `(Optional)` Set equip this model.
     * @returns The ID of the new model.
     */
    public static createNewModel(modelData: AvatarModel, setToActive = true): string {
        const ID = this._generateID();
        userStore.avatar.models[ID] = modelData;
        if (setToActive) {
            this.setActiveModel(ID);
        }
        return ID;
    }

    /**
     * Remove a model from the Store.
     * @param modelId The ID of the model to remove.
     */
    public static removeModel(modelId: string | number): void {
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
    }

    /**
     * Equip a particular model.
     * @param modelId The ID of the model to equip.
     */
    public static setActiveModel(modelId: string | number): void {
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
}
