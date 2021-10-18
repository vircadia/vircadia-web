/*
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

import { Metaverse } from "@Modules/metaverse/metaverse";

import { Slot } from "@vircadia/web-sdk";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Log from "@Modules/debugging/log";

// Allow 'get' statements to be compact
/* eslint-disable @typescript-eslint/brace-style */

export const MetaverseMgr = {

    // The current metaverse-server being communicated with
    _activeMetaverse: undefined as unknown as Metaverse,

    get ActiveMetaverse(): Metaverse { return MetaverseMgr._activeMetaverse; },
    set ActiveMetaverse(pMV: Metaverse) { MetaverseMgr._activeMetaverse = pMV; },

    async metaverseFactory(pUrl?: string, pMetaverseOps?: Slot): Promise<Metaverse> {
        const aMetaverse = new Metaverse();
        if (pMetaverseOps) {
            aMetaverse.onStateChange.connect(pMetaverseOps);
        }
        if (typeof pUrl === "string" && pUrl.length > 0) {
            await aMetaverse.setMetaverseUrl(pUrl);
        }
        return aMetaverse;
    }
};
