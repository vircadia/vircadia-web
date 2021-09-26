/*
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

import { MetaverseMgr } from "@Modules/metaverse";

import { DomainMgr } from "@Modules/domain";

import { Slot } from "@Modules/utility/Signal";

import { Config, TrueValue, FalseValue, RECONNECT_ON_STARTUP, LAST_DOMAIN_SERVER, LOG_LEVEL } from "@Base/config";

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
        // Copy the configured log level into the logging subroutines
        Log.setLogLevel(Config.getItem(LOG_LEVEL, "debug"));
    },

    /**
     * Connect to the domain on startup.
     *
     * If we are supposed to connect at startup, do all the connection
     * setup stuff so the user is online.
     */
    async initialConnectionSetup(pDomainOps?: Slot, pMetaverseOps?: Slot): Promise<void> {
        if (Config.getItem(RECONNECT_ON_STARTUP, FalseValue) === TrueValue) {
            Log.info(Log.types.METAVERSE, `Doing Reconnect on Startup`);
            const lastDomainServer = Config.getItem(LAST_DOMAIN_SERVER, undefined);
            if (lastDomainServer) {
                await Utility.connectionSetup(lastDomainServer, pDomainOps, pMetaverseOps);
            }
        } else {
            Log.info(Log.types.COMM, `Not performing Reconnect on Startup. See "config"`);
        }
    },

    /**
     * Start a connection to a domain-server.
     *
     * The connection to the domain is started and, if successful, a connection to the back-end
     * metaverse-server is setup and initialized.
     *
     * The state change routines are usually used to start interaction operations.
     *
     * @param pDomainUrl either just the hostname (default protocol and ports are added) or a fully qualified URL
     * @param {OnDomainStateChangeCallback} pDomainOps routine to be called when domain connection state changes
     * @param {OnMetaverseStateChangeCallback} pMetaverseOps routine to be called when metaverse connection state changes
     */
    async connectionSetup(pDomainUrl: string, pDomainOps?: Slot, pMetaverseOps?: Slot): Promise<void> {
        if (pDomainUrl) {
            try {
                Log.debug(Log.types.COMM, `connectionSetup: connecting to domain ${pDomainUrl}`);
                const domain = await DomainMgr.domainFactory(pDomainUrl, pDomainOps);
                DomainMgr.ActiveDomain = domain;
                const metaverseUrl = await domain.getMetaverseUrl();
                if (metaverseUrl) {
                    Log.debug(Log.types.COMM, `connectionSetup: connecting to metaverse ${metaverseUrl}`);
                    const metaverse = await MetaverseMgr.metaverseFactory(metaverseUrl, pMetaverseOps);
                    MetaverseMgr.ActiveMetaverse = metaverse;
                }
            } catch (err) {
                const errr = <Error>err;
                Log.error(Log.types.COMM, `Exception connecting: ${errr.message}`);
            }
        }
    }
};
