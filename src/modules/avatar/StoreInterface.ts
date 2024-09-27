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

import { userStore } from "@Stores/index";
import { Renderer } from "@Modules/scene";

export interface AvatarModel {
    name: string,
    image: string,
    file: string,
    scale: number,
    starred: boolean
}

/**
 * Static methods for interacting with the list of avatar models in the Store.
 */
export class AvatarStoreInterface {
    /**
     * @returns The default collection of avatar models.
     * @throws {Error} If parsing VRCA_DEFAULT_AVATARS fails or the list is empty.
     */
    private static defaultAvatars(): AvatarModel[] {
        if (!process.env.VRCA_DEFAULT_AVATARS) {
            throw new Error("VRCA_DEFAULT_AVATARS is not defined in the environment");
        }

        const avatars = JSON.parse(process.env.VRCA_DEFAULT_AVATARS);
        if (!Array.isArray(avatars) || avatars.length === 0) {
            throw new Error("VRCA_DEFAULT_AVATARS is not a valid array or is empty");
        }

        return avatars;
    }

    /**
     * @returns The URL of the default avatar model.
     */
    public static defaultActiveAvatarUrl(): string {
        return this.defaultAvatars()[0].file;
    }

    /**
     * @returns The name of the default avatar model.
     */
    public static defaultActiveAvatarName(): string {
        return this.defaultAvatars()[0].name;
    }

    /**
     * Retrieve the data for a given avatar model.
     * @param index The index of the model to retrieve.
     * @returns The data for the requested avatar model, or undefined if the index is out of bounds.
     */
    public static getModelData(index: number): AvatarModel | undefined {
        return userStore.avatar.models[index];
    }

    /**
     * Retrieve the data for the avatar model currently equipped by the user.
     * @returns The data for the currently equipped avatar model, or undefined if no model is equipped.
     */
    public static getActiveModelData(): AvatarModel | undefined {
        return this.getModelData(userStore.avatar.activeModelIndex);
    }

    /**
     * @returns A stringified array of all the stored avatar models.
     */
    public static getAllModelsJSON(): string {
        return JSON.stringify(userStore.avatar.models);
    }

    /**
     * Set the value of a specific property of an avatar model.
     * @param index The index of the model to update.
     * @param key The property to update.
     * @param value The new value for that property.
     */
    public static setModelData<T extends keyof AvatarModel>(index: number, key: T, value: AvatarModel[T]): void {
        if (index >= 0 && index < userStore.avatar.models.length) {
            userStore.avatar.models[index][key] = value;
            // If the model's file was updated, make it the active model so there is immediate feedback on that change.
            if (key === "file") {
                this.setActiveModel(index);
            }
        }
    }

    /**
     * Set the value of a specific property of the avatar model currently equipped by the user.
     * @param key The property to update.
     * @param value The new value for that property.
     */
    public static setActiveModelData<T extends keyof AvatarModel>(key: T, value: AvatarModel[T]): void {
        this.setModelData(userStore.avatar.activeModelIndex, key, value);
    }

    /**
     * Add a new avatar model to the Store.
     * @param modelData The data for the new avatar model.
     * @param setToActive `(Optional)` Set to equip this model.
     * @returns The index of the new model.
     */
    public static addNewModel(modelData: AvatarModel, setToActive = true): number {
        const newIndex = userStore.avatar.models.length;
        userStore.avatar.models.push(modelData);
        if (setToActive) {
            this.setActiveModel(newIndex);
        }
        return newIndex;
    }

    /**
     * Remove a model from the Store.
     * @param index The index of the model to remove.
     */
    public static removeModel(index: number): void {
        if (index >= 0 && index < userStore.avatar.models.length) {
            userStore.avatar.models.splice(index, 1);
            // If the removed model was active, set the first model as active
            if (index === userStore.avatar.activeModelIndex) {
                this.setActiveModel(0);
            } else if (index < userStore.avatar.activeModelIndex) {
                // Adjust the active model index if a model before it was removed
                userStore.avatar.activeModelIndex--;
            }
        }
    }

    /**
     * Equip a particular model.
     * @param index The index of the model to equip.
     */
    public static setActiveModel(index: number): void {
        if (index >= 0 && index < userStore.avatar.models.length) {
            userStore.avatar.activeModelIndex = index;
            try {
                const scene = Renderer.getScene();
                scene.loadMyAvatar(userStore.avatar.models[index].file).catch((err) => console.warn("Failed to load avatar:", err));
            } catch (error) {
                console.warn("Cannot render active avatar model before the scene has been loaded.", error);
            }
        }
    }
}
