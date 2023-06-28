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
// TODO: Get most of these variables from the store instead of this file (so it can be overridden with environment variables correctly)

export interface AvatarEntry {
    name: string,
    image: string,
    file: string,
    scale: number,
    starred: boolean
}

export interface AvatarEntryMap {
    [key: string]: AvatarEntry
}

/**
 * The URL of the default avatar model.
 */
export function defaultActiveAvatarUrl(): string {
    return "https://staging.vircadia.com/O12OR634/UA92/sara.glb";
}

/**
 * The ID of the default avatar model.
 */
export function defaultActiveAvatarId(): string {
    return "HTP45FSQ";
}

/**
 * The fallback avatar model.
 */
export function fallbackAvatar(): AvatarEntry {
    return {
        name: "Maria",
        image: "https://staging.vircadia.com/O12OR634/Avatars/Maria-small.webp",
        file: "https://staging.vircadia.com/O12OR634/Avatars/default_avatar.glb",
        scale: 1,
        starred: false
    };
}

/**
 * The URL of the fallback avatar model.
 */
export function fallbackAvatarUrl(): string {
    return fallbackAvatar().file;
}

/**
 * The ID of the fallback avatar model.
 */
export function fallbackAvatarId(): string {
    return "FALLBACK";
}

/**
 * The default collection of avatar models.
 */
export function defaultAvatars(): AvatarEntryMap {
    return {
        HTP45FSQ: {
            name: "Sara",
            image: "https://staging.vircadia.com/O12OR634/UA92/sara-cropped-small.webp",
            file: "https://staging.vircadia.com/O12OR634/UA92/sara.glb",
            scale: 1,
            starred: true
        } as AvatarEntry,
        ZPNSHHIJ: {
            name: "Mark",
            image: "https://staging.vircadia.com/O12OR634/Avatars/Mark-small.webp",
            file: "https://staging.vircadia.com/O12OR634/Avatars/Mark.glb",
            scale: 1,
            starred: false
        } as AvatarEntry,
        C5E0NT3P: {
            name: "Megan",
            image: "https://staging.vircadia.com/O12OR634/Avatars/Megan-small.webp",
            file: "https://staging.vircadia.com/O12OR634/Avatars/Megan.glb",
            scale: 1,
            starred: false
        } as AvatarEntry,
        HYGME2O8: {
            name: "Jack",
            image: "https://staging.vircadia.com/O12OR634/Avatars/Jack-small.webp",
            file: "https://staging.vircadia.com/O12OR634/Avatars/Jack.glb",
            scale: 1,
            starred: false
        } as AvatarEntry,
        AIOUPXVY: {
            name: "Martha",
            image: "https://staging.vircadia.com/O12OR634/Avatars/Martha-small.webp",
            file: "https://staging.vircadia.com/O12OR634/Avatars/Martha.glb",
            scale: 1,
            starred: false
        } as AvatarEntry,
        LRX76LNL: {
            name: "Miles",
            image: "https://staging.vircadia.com/O12OR634/Avatars/Miles-small.webp",
            file: "https://staging.vircadia.com/O12OR634/Avatars/Miles.glb",
            scale: 1,
            starred: false
        } as AvatarEntry,
        HTLZ3SVU: {
            name: "Taylor",
            image: "https://staging.vircadia.com/O12OR634/Avatars/Taylor-small.webp",
            file: "https://staging.vircadia.com/O12OR634/Avatars/Taylor.glb",
            scale: 1,
            starred: false
        } as AvatarEntry,
        EPS62RC9: {
            name: "Tiffany",
            image: "https://staging.vircadia.com/O12OR634/Avatars/Tiffany-small.webp",
            file: "https://staging.vircadia.com/O12OR634/Avatars/Tiffany.glb",
            scale: 1,
            starred: false
        } as AvatarEntry,
        QIA9XG4G: {
            name: "Victor",
            image: "https://staging.vircadia.com/O12OR634/Avatars/Victor-small.webp",
            file: "https://staging.vircadia.com/O12OR634/Avatars/Victor.glb",
            scale: 1,
            starred: false
        } as AvatarEntry,
        N5PBHE7C: {
            name: "Audrey",
            image: "https://staging.vircadia.com/O12OR634/Avatars/Audrey-small.webp",
            file: "https://staging.vircadia.com/O12OR634/Avatars/Audrey.glb",
            scale: 1,
            starred: false
        } as AvatarEntry,
        E7RCM559: {
            name: "Kristine",
            image: "https://staging.vircadia.com/O12OR634/Avatars/Kristine-small.webp",
            file: "https://staging.vircadia.com/O12OR634/Avatars/Kristine.glb",
            scale: 1,
            starred: false
        } as AvatarEntry,
        SG35OH2Y: {
            name: "William",
            image: "https://staging.vircadia.com/O12OR634/Avatars/William-small.webp",
            file: "https://staging.vircadia.com/O12OR634/Avatars/William.glb",
            scale: 1,
            starred: false
        } as AvatarEntry,
        JKV34GST: {
            name: "Erica",
            image: "https://staging.vircadia.com/O12OR634/Avatars/Erica-small.webp",
            file: "https://staging.vircadia.com/O12OR634/Avatars/Erica.glb",
            scale: 1,
            starred: false
        } as AvatarEntry,
        X5AII7GT: {
            name: "Samantha",
            image: "https://staging.vircadia.com/O12OR634/Avatars/Samantha-small.webp",
            file: "https://staging.vircadia.com/O12OR634/Avatars/Samantha.glb",
            scale: 1,
            starred: false
        } as AvatarEntry,
        ZGK9IGRB: {
            name: "Roman",
            image: "https://staging.vircadia.com/O12OR634/Avatars/Roman-small.webp",
            file: "https://staging.vircadia.com/O12OR634/Avatars/Roman.glb",
            scale: 1,
            starred: false
        } as AvatarEntry,
        DBYRNKR8: {
            name: "Cathy",
            image: "https://staging.vircadia.com/O12OR634/Avatars/Cathy-small.webp",
            file: "https://staging.vircadia.com/O12OR634/Avatars/Cathy.glb",
            scale: 1,
            starred: false
        } as AvatarEntry,
        EG1XOUR4: {
            name: "Lucas",
            image: "https://staging.vircadia.com/O12OR634/Avatars/Lucas-small.webp",
            file: "https://staging.vircadia.com/O12OR634/Avatars/Lucas.glb",
            scale: 1,
            starred: false
        } as AvatarEntry,
        OPX471R4: {
            name: "Michaella",
            image: "https://staging.vircadia.com/O12OR634/Avatars/Michaella-small.webp",
            file: "https://staging.vircadia.com/O12OR634/Avatars/Michaella.glb",
            scale: 1,
            starred: false
        } as AvatarEntry,
        V5DYP68J: {
            name: "David",
            image: "https://staging.vircadia.com/O12OR634/Avatars/David-small.webp",
            file: "https://staging.vircadia.com/O12OR634/Avatars/David.glb",
            scale: 1,
            starred: false
        } as AvatarEntry,
        M9G7AFFC: {
            name: "Rochella",
            image: "https://staging.vircadia.com/O12OR634/Avatars/Rochella-small.webp",
            file: "https://staging.vircadia.com/O12OR634/Avatars/Rochella.glb",
            scale: 1,
            starred: false
        } as AvatarEntry,
        LHUVJ7RA: {
            name: "Susan",
            image: "https://staging.vircadia.com/O12OR634/Avatars/Susan-small.webp",
            file: "https://staging.vircadia.com/O12OR634/Avatars/Susan.glb",
            scale: 1,
            starred: false
        } as AvatarEntry,
        EQQC5125: {
            name: "Diego",
            image: "https://staging.vircadia.com/O12OR634/Avatars/Diego-small.webp",
            file: "https://staging.vircadia.com/O12OR634/Avatars/Diego.glb",
            scale: 1,
            starred: false
        } as AvatarEntry,
        GYC8OLSF: {
            name: "Jameson",
            image: "https://staging.vircadia.com/O12OR634/Avatars/Jameson-small.webp",
            file: "https://staging.vircadia.com/O12OR634/Avatars/Jameson.glb",
            scale: 1,
            starred: false
        } as AvatarEntry,
        OFTR0UR0: {
            name: "Kevin",
            image: "https://staging.vircadia.com/O12OR634/Avatars/Kevin-small.webp",
            file: "https://staging.vircadia.com/O12OR634/Avatars/Kevin.glb",
            scale: 1,
            starred: false
        } as AvatarEntry,
        VO3YR5QC: {
            name: "Lila",
            image: "https://staging.vircadia.com/O12OR634/Avatars/Lila-small.webp",
            file: "https://staging.vircadia.com/O12OR634/Avatars/Lila.glb",
            scale: 1,
            starred: false
        } as AvatarEntry,
        S4Q8O9CE: {
            name: "Vikki",
            image: "https://staging.vircadia.com/O12OR634/Avatars/Vikki-small.webp",
            file: "https://staging.vircadia.com/O12OR634/Avatars/Vikki.glb",
            scale: 1,
            starred: false
        } as AvatarEntry,
        ETQZ8G3W: {
            name: "Jonas",
            image: "https://staging.vircadia.com/O12OR634/Avatars/Jonas-small.webp",
            file: "https://staging.vircadia.com/O12OR634/Avatars/Jonas.glb",
            scale: 1,
            starred: false
        } as AvatarEntry,
        D8WRU1KS: {
            name: "Kelly",
            image: "https://staging.vircadia.com/O12OR634/Avatars/Kelly-small.webp",
            file: "https://staging.vircadia.com/O12OR634/Avatars/Kelly.glb",
            scale: 1,
            starred: false
        } as AvatarEntry,
        FALLBACK: fallbackAvatar()
    } as AvatarEntryMap;
}
