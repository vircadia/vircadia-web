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

import { AvatarEntry, AvatarEntryMap } from "@Modules/avatar/StoreInterface";
import { loadLocalValue } from "@Modules/localStorage";

// Load the last-used avatar model list from local storage (if it exists).
const localAvatarModelList = loadLocalValue("avatarModels");
const localAvatarID = loadLocalValue("activeModel");

export function defaultActiveAvatarUrl(): string {
    let output = "https://staging.vircadia.com/O12OR634/UA92/sara.glb";
    if (localAvatarModelList && localAvatarID) {
        const parsedLocalAvatarModelList = JSON.parse(localAvatarModelList) as AvatarEntryMap;
        if (localAvatarID in parsedLocalAvatarModelList) {
            output = parsedLocalAvatarModelList[localAvatarID].file;
        }
    }
    return output;
}

export function defaultActiveAvatarModel(): string {
    let output = "HTP45FSQ";
    if (localAvatarModelList && localAvatarID) {
        const parsedLocalAvatarModelList = JSON.parse(localAvatarModelList) as AvatarEntryMap;
        if (localAvatarID in parsedLocalAvatarModelList) {
            output = localAvatarID;
        }
    }
    return output;
}

export function defaultAvatarModels(): AvatarEntryMap {
    let output = {
        HTP45FSQ: {
            name: "Sara",
            image: "https://staging.vircadia.com/O12OR634/UA92/sara-cropped-small.webp",
            file: "https://staging.vircadia.com/O12OR634/UA92/sara.glb",
            scale: 1,
            starred: true
        } as AvatarEntry,
        EPS62RC9: {
            name: "Tiffany",
            image: "https://staging.vircadia.com/O12OR634/Avatars/Tiffany-small.webp",
            file: "https://staging.vircadia.com/O12OR634/Avatars/Tiffany.glb",
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
        QIA9XG4G: {
            name: "Victor",
            image: "https://staging.vircadia.com/O12OR634/Avatars/Victor-small.webp",
            file: "https://staging.vircadia.com/O12OR634/Avatars/Victor.glb",
            scale: 1,
            starred: false
        } as AvatarEntry,
        N5PBHE7C: {
            name: "Audrey",
            image: "",
            file: "https://staging.vircadia.com/O12OR634/Avatars/Audrey.glb",
            scale: 1,
            starred: false
        } as AvatarEntry,
        HYGME2O8: {
            name: "Jack",
            image: "",
            file: "https://staging.vircadia.com/O12OR634/Avatars/Jack.glb",
            scale: 1,
            starred: false
        } as AvatarEntry,
        ZPNSHHIJ: {
            name: "Mark",
            image: "",
            file: "https://staging.vircadia.com/O12OR634/Avatars/Mark.glb",
            scale: 1,
            starred: false
        } as AvatarEntry,
        E7RCM559: {
            name: "Kristine",
            image: "",
            file: "https://staging.vircadia.com/O12OR634/Avatars/Kristine.glb",
            scale: 1,
            starred: false
        } as AvatarEntry,
        SG35OH2Y: {
            name: "William",
            image: "",
            file: "https://staging.vircadia.com/O12OR634/Avatars/William.glb",
            scale: 1,
            starred: false
        } as AvatarEntry,
        JKV34GST: {
            name: "Erica",
            image: "",
            file: "https://staging.vircadia.com/O12OR634/Avatars/Erica.glb",
            scale: 1,
            starred: false
        } as AvatarEntry,
        X5AII7GT: {
            name: "Samantha",
            image: "",
            file: "https://staging.vircadia.com/O12OR634/Avatars/Samantha.glb",
            scale: 1,
            starred: false
        } as AvatarEntry
    } as AvatarEntryMap;

    if (localAvatarModelList && localAvatarID) {
        const parsedLocalAvatarModelList = JSON.parse(localAvatarModelList) as AvatarEntryMap;
        if (localAvatarID in parsedLocalAvatarModelList) {
            output = parsedLocalAvatarModelList;
        }
    }
    return output;
}
