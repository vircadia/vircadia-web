/*
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

import { Metaverse } from "@Modules/metaverse/metaverse";

export const MetaverseMgr = {
    // The current metaverse-server being communicated with
    _activeMetaverse: undefined as unknown as Metaverse,

    get ActiveMetaverse(): Metaverse {
        return MetaverseMgr._activeMetaverse;
    },
    set ActiveMetaverse(pMV: Metaverse) {
        MetaverseMgr._activeMetaverse = pMV;
    },

    async metaverseFactory(pUrl?: string): Promise<Metaverse> {
        const aMetaverse = new Metaverse();
        if (typeof pUrl === "string" && pUrl.length > 0) {
            await aMetaverse.setMetaverseUrl(pUrl);
        }
        return aMetaverse;
    }
};
