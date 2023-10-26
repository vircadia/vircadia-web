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

const modelRoot = "/assets/models/avatars/";

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
    return {
        name: "Maria",
        image: `${modelRoot}Maria-small.webp`,
        file: `${modelRoot}default_avatar.glb`,
        scale: 1,
        starred: false
    };
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
    return {
        HTP45FSQ: {
            name: "Sara",
            image: "https://staging.vircadia.com/O12OR634/UA92/sara-cropped-small.webp",
            file: "https://staging.vircadia.com/O12OR634/UA92/sara.glb",
            scale: 1,
            starred: true
        } as AvatarModel,
        ZPNSHHIJ: {
            name: "Mark",
            image: `${modelRoot}Mark-small.webp`,
            file: `${modelRoot}Mark.glb`,
            scale: 1,
            starred: false
        } as AvatarModel,
        C5E0NT3P: {
            name: "Megan",
            image: `${modelRoot}Megan-small.webp`,
            file: `${modelRoot}Megan.glb`,
            scale: 1,
            starred: false
        } as AvatarModel,
        HYGME2O8: {
            name: "Jack",
            image: `${modelRoot}Jack-small.webp`,
            file: `${modelRoot}Jack.glb`,
            scale: 1,
            starred: false
        } as AvatarModel,
        AIOUPXVY: {
            name: "Martha",
            image: `${modelRoot}Martha-small.webp`,
            file: `${modelRoot}Martha.glb`,
            scale: 1,
            starred: false
        } as AvatarModel,
        LRX76LNL: {
            name: "Miles",
            image: `${modelRoot}Miles-small.webp`,
            file: `${modelRoot}Miles.glb`,
            scale: 1,
            starred: false
        } as AvatarModel,
        HTLZ3SVU: {
            name: "Taylor",
            image: `${modelRoot}Taylor-small.webp`,
            file: `${modelRoot}Taylor.glb`,
            scale: 1,
            starred: false
        } as AvatarModel,
        EPS62RC9: {
            name: "Tiffany",
            image: `${modelRoot}Tiffany-small.webp`,
            file: `${modelRoot}Tiffany.glb`,
            scale: 1,
            starred: false
        } as AvatarModel,
        QIA9XG4G: {
            name: "Victor",
            image: `${modelRoot}Victor-small.webp`,
            file: `${modelRoot}Victor.glb`,
            scale: 1,
            starred: false
        } as AvatarModel,
        N5PBHE7C: {
            name: "Audrey",
            image: `${modelRoot}Audrey-small.webp`,
            file: `${modelRoot}Audrey.glb`,
            scale: 1,
            starred: false
        } as AvatarModel,
        E7RCM559: {
            name: "Kristine",
            image: `${modelRoot}Kristine-small.webp`,
            file: `${modelRoot}Kristine.glb`,
            scale: 1,
            starred: false
        } as AvatarModel,
        SG35OH2Y: {
            name: "William",
            image: `${modelRoot}William-small.webp`,
            file: `${modelRoot}William.glb`,
            scale: 1,
            starred: false
        } as AvatarModel,
        JKV34GST: {
            name: "Erica",
            image: `${modelRoot}Erica-small.webp`,
            file: `${modelRoot}Erica.glb`,
            scale: 1,
            starred: false
        } as AvatarModel,
        X5AII7GT: {
            name: "Samantha",
            image: `${modelRoot}Samantha-small.webp`,
            file: `${modelRoot}Samantha.glb`,
            scale: 1,
            starred: false
        } as AvatarModel,
        ZGK9IGRB: {
            name: "Roman",
            image: `${modelRoot}Roman-small.webp`,
            file: `${modelRoot}Roman.glb`,
            scale: 1,
            starred: false
        } as AvatarModel,
        DBYRNKR8: {
            name: "Cathy",
            image: `${modelRoot}Cathy-small.webp`,
            file: `${modelRoot}Cathy.glb`,
            scale: 1,
            starred: false
        } as AvatarModel,
        EG1XOUR4: {
            name: "Lucas",
            image: `${modelRoot}Lucas-small.webp`,
            file: `${modelRoot}Lucas.glb`,
            scale: 1,
            starred: false
        } as AvatarModel,
        OPX471R4: {
            name: "Michaella",
            image: `${modelRoot}Michaella-small.webp`,
            file: `${modelRoot}Michaella.glb`,
            scale: 1,
            starred: false
        } as AvatarModel,
        V5DYP68J: {
            name: "David",
            image: `${modelRoot}David-small.webp`,
            file: `${modelRoot}David.glb`,
            scale: 1,
            starred: false
        } as AvatarModel,
        M9G7AFFC: {
            name: "Rochella",
            image: `${modelRoot}Rochella-small.webp`,
            file: `${modelRoot}Rochella.glb`,
            scale: 1,
            starred: false
        } as AvatarModel,
        LHUVJ7RA: {
            name: "Susan",
            image: `${modelRoot}Susan-small.webp`,
            file: `${modelRoot}Susan.glb`,
            scale: 1,
            starred: false
        } as AvatarModel,
        EQQC5125: {
            name: "Diego",
            image: `${modelRoot}Diego-small.webp`,
            file: `${modelRoot}Diego.glb`,
            scale: 1,
            starred: false
        } as AvatarModel,
        GYC8OLSF: {
            name: "Jameson",
            image: `${modelRoot}Jameson-small.webp`,
            file: `${modelRoot}Jameson.glb`,
            scale: 1,
            starred: false
        } as AvatarModel,
        OFTR0UR0: {
            name: "Kevin",
            image: `${modelRoot}Kevin-small.webp`,
            file: `${modelRoot}Kevin.glb`,
            scale: 1,
            starred: false
        } as AvatarModel,
        VO3YR5QC: {
            name: "Lila",
            image: `${modelRoot}Lila-small.webp`,
            file: `${modelRoot}Lila.glb`,
            scale: 1,
            starred: false
        } as AvatarModel,
        S4Q8O9CE: {
            name: "Vikki",
            image: `${modelRoot}Vikki-small.webp`,
            file: `${modelRoot}Vikki.glb`,
            scale: 1,
            starred: false
        } as AvatarModel,
        ETQZ8G3W: {
            name: "Jonas",
            image: `${modelRoot}Jonas-small.webp`,
            file: `${modelRoot}Jonas.glb`,
            scale: 1,
            starred: false
        } as AvatarModel,
        D8WRU1KS: {
            name: "Kelly",
            image: `${modelRoot}Kelly-small.webp`,
            file: `${modelRoot}Kelly.glb`,
            scale: 1,
            starred: false
        } as AvatarModel,
        FALLBACK: fallbackAvatar()
    } as AvatarModelMap;
}
