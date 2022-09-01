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

import { Store, Mutations as StoreMutations } from "@Store/index";

export interface AvatarEntry {
    name: string,
    image: string,
    file: string,
    scale: number,
    starred: boolean
}

function generateID(): string {
    // eslint-disable-next-line max-len
    const chars = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    const idLength = 8;
    let ID = "";
    for (let i = 0; i < idLength; i += 1) {
        ID += chars[Math.floor(Math.random() * chars.length)];
    }
    return ID;
}

export const AvatarStoreInterface = {
    getModelData(modelId: string, key?: keyof AvatarEntry): AvatarEntry | string | number | boolean {
        const models = Store.state.avatar.models as { [key: string]: AvatarEntry };
        if (key && key in models[modelId]) {
            return models[modelId][key];
        }
        return models[modelId];
    },

    getActiveModelData(key?: keyof AvatarEntry): AvatarEntry | string | number | boolean {
        const activeModel = Store.state.avatar.activeModel;
        return this.getModelData(activeModel, key);
    },

    setModelData(modelId: string, key: keyof AvatarEntry, value: string | number | boolean): void {
        if (modelId in Store.state.avatar.models) {
            Store.commit(StoreMutations.MUTATE, {
                property: `avatar.models.${modelId}.${key}`,
                value
            });
        }
    },

    setActiveModelData(key: keyof AvatarEntry, value: string | number | boolean): void {
        const activeModel = Store.state.avatar.activeModel;
        this.setModelData(activeModel, key, value);
    },

    createNewModel(modelData: AvatarEntry): string {
        let ID = generateID();
        // Ensure that the model ID doesn't already exist.
        while (ID in Store.state.avatar.models) {
            ID = generateID();
        }

        const currentModels = { ...Store.state.avatar.models };
        currentModels[ID] = modelData;

        Store.commit(StoreMutations.MUTATE, {
            property: `avatar.models`,
            value: currentModels
        });

        Store.commit(StoreMutations.MUTATE, {
            property: `avatar.activeModel`,
            value: ID
        });

        return ID;
    },

    setActiveModel(modelId: string): void {
        if (modelId in Store.state.avatar.models) {
            Store.commit(StoreMutations.MUTATE, {
                property: "avatar.activeModel",
                value: modelId
            });
        }
    }
};
