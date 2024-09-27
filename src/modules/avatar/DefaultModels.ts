//
//  DefaultModels.ts
//
//  Created by Giga on 1 Sep 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
// TODO: Get most of these variables from the config instead of this file (so it can be overridden with environment variables correctly).

export interface AvatarModel {
    name: string,
    image: string,
    file: string,
    scale: number,
    starred: boolean
}

/**
 * @returns The URL of the default avatar model.
 */
export function defaultActiveAvatarUrl(): string {
    return defaultAvatars()[0].file;
}

/**
 * @returns The name of the default avatar model.
 */
export function defaultActiveAvatarName(): string {
    return defaultAvatars()[0].name;
}

/**
 * @returns The default collection of avatar models.
 * @throws {Error} If parsing VRCA_DEFAULT_AVATARS fails or the list is empty.
 */
export function defaultAvatars(): AvatarModel[] {
    if (!process.env.VRCA_DEFAULT_AVATARS) {
        throw new Error("VRCA_DEFAULT_AVATARS is not defined in the environment");
    }

    const avatars = JSON.parse(process.env.VRCA_DEFAULT_AVATARS);
    if (!Array.isArray(avatars) || avatars.length === 0) {
        throw new Error("VRCA_DEFAULT_AVATARS is not a valid array or is empty");
    }

    return avatars;
}
