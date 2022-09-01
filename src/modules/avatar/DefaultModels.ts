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
            image: "",
            file: "https://staging.vircadia.com/O12OR634/Avatars/Tiffany.glb",
            scale: 1,
            starred: true
        } as AvatarEntry,
        AIOUPXVY: {
            name: "Martha",
            image: "",
            file: "https://staging.vircadia.com/O12OR634/Avatars/Martha.glb",
            scale: 1,
            starred: true
        } as AvatarEntry,
        LRX76LNL: {
            name: "Miles",
            image: "",
            file: "https://staging.vircadia.com/O12OR634/Avatars/Miles.glb",
            scale: 1,
            starred: true
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
