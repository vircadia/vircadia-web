/*
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

import { MetaverseMgr } from "@Modules/metaverse";

import { DomainMgr } from "@Modules/domain";

import { Slot } from "@Modules/utility/Signal";

import { Config, TrueValue, RECONNECT_ON_STARTUP } from "@Base/config";

/* eslint-disable require-atomic-updates */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Log from "@Modules/debugging/log";

export const Utility = {
    /**
     * Configuration information is persisted so restore what information
     * we can.
     */
    initializeConfig(): void {
        Config.initialize();
    },

    /**
     * Connect to the domain on startup.
     *
     * If we are supposed to connect at startup, do all the connection
     * setup stuff so the user is online.
     */
    async initialConnectionSetup(pDomainOps?: Slot, pMetaverseOps?: Slot): Promise<void> {
        if (Config.getItem(RECONNECT_ON_STARTUP) === TrueValue) {
            const domainUrl = DomainMgr.DefaultDomainUrl;
            if (domainUrl) {
                try {
                    const domain = await DomainMgr.domainFactory(domainUrl, pDomainOps);
                    DomainMgr.ActiveDomain = domain;
                    const metaverseUrl = await domain.getMetaverseUrl();
                    if (metaverseUrl) {
                        const metaverse = await MetaverseMgr.metaverseFactory(metaverseUrl, pMetaverseOps);
                        MetaverseMgr.ActiveMetaverse = metaverse;
                    }
                } catch (err) {
                    const errr = <Error>err;
                    Log.error(Log.types.METAVERSE, `Exception connecting: ${errr.message}`);
                }
            }
        }
    }
};
