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

const modelRoot = "/assets/models/avatars/"

export interface AvatarModel {
    name: string,
    image: string,
    file: string,
    scale: number,
    starred: boolean
}

export interface AvatarModelMap {
    [key: string]: AvatarModel
}

/**
 * @returns The URL of the default avatar model.
 */
export function defaultActiveAvatarUrl(): string {
    return `${modelRoot}sara.glb`;
}

/**
 * @returns The ID of the default avatar model.
 */
export function defaultActiveAvatarId(): string {
    return "HTP45FSQ";
}

/**
 * @returns The fallback avatar model.
 */
export function fallbackAvatar(): AvatarModel {
    const configFallbackAvatar = JSON.parse(process.env.VRCA_FALLBACK_AVATAR as string);

    return configFallbackAvatar as AvatarModel;
}

/**
 * @returns The URL of the fallback avatar model.
 */
export function fallbackAvatarUrl(): string {
    return fallbackAvatar().file;
}

/**
 * @returns The ID of the fallback avatar model.
 */
export function fallbackAvatarId(): string {
    return "FALLBACK";
}

/**
 * @returns The default collection of avatar models.
 */
export function defaultAvatars(): AvatarModelMap {
    const configDefaultAvatars = JSON.parse(process.env.VRCA_DEFAULT_AVATARS ?? JSON.stringify([fallbackAvatar()]));

    return configDefaultAvatars as AvatarModelMap;
}
