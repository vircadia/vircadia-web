/*
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

import { MetaverseMgr } from "@Modules/metaverse";

import { DomainMgr } from "@Modules/domain";

import { Slot, ConnectionState } from "@vircadia/web-sdk";

import { Store, Actions as StoreActions } from "@Store/index";
import { Metaverse } from "@Modules/metaverse/metaverse";
import { Domain } from "@Modules/domain/domain";

import {
    Config, TrueValue, FalseValue, RECONNECT_ON_STARTUP, LAST_DOMAIN_SERVER,
    LOG_LEVEL, DEFAULT_METAVERSE_URL
} from "@Base/config";

/* eslint-disable require-atomic-updates */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Log from "@Modules/debugging/log";

export const Utility = {
/**
 * Default processing for domain-server state change.
 *
 * This routine is the default Signal processor added to a domain-server's changed state Signal.
 * It updates the domain-server's state in Vue's Store which will update the UI.
 */
    defaultDomainOps(pDomain: Domain, pConnState: ConnectionState, pInfo: string): void {
        Log.debug(Log.types.OTHER, `UTILITY: new domain state: ${pConnState}/${pInfo}`);
        // eslint-disable-next-line no-void
        void Store.dispatch(StoreActions.UPDATE_DOMAIN, {
            domain: pDomain,
            newState: pDomain.DomainStateAsString,
            info: pInfo
        });
    },
    /**
     * Default processing for metaverse-server state change.
     *
     * This routine is the default Signal processor added to a metaverse-server's changed state Signal.
     * It updates the metaverse-server's state in Vue's Store which will update the UI.
     */
    defaultMetaverseOps(pMV: Metaverse, pNewState: string): void {
        Log.debug(Log.types.OTHER, `UTILITY: new metaverse state: ${pNewState}`);
        // eslint-disable-next-line no-void
        void Store.dispatch(StoreActions.UPDATE_METAVERSE, {
            metaverse: pMV,
            newState: pNewState
        });
    },

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

        // if we haven't connected to a metaverse already from a domain reconnect at startup
        if (!MetaverseMgr.ActiveMetaverse) {
            const metaverseUrl = Config.getItem(DEFAULT_METAVERSE_URL, "");
            await Utility.metaverseConnectionSetup(metaverseUrl, pMetaverseOps);
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
                await Utility.metaverseConnectionSetup(metaverseUrl, pMetaverseOps);
            } catch (err) {
                const errr = <Error>err;
                Log.error(Log.types.COMM, `Exception connecting: ${errr.message}`);
            }
        }
    },

    /**
     * Start a connection to a metaverse-server.
     *
     * The state change routines are usually used to start interaction operations.
     *
     * @param pMetaverseUrl either just the hostname (default protocol and ports are added) or a fully qualified URL
     * @param {OnMetaverseStateChangeCallback} pMetaverseOps routine to be called when metaverse connection state changes
     */
    async metaverseConnectionSetup(pMetaverseUrl: string, pMetaverseOps?: Slot): Promise<void> {
        try {
            if (pMetaverseUrl) {
                Log.debug(Log.types.COMM, `metaverseConnectionSetup: connecting to metaverse ${pMetaverseUrl}`);
                const metaverse = await MetaverseMgr.metaverseFactory(pMetaverseUrl, pMetaverseOps);
                MetaverseMgr.ActiveMetaverse = metaverse;
            }
        } catch (err) {
            const errr = <Error>err;
            Log.error(Log.types.COMM, `Exception connecting to metaverse: ${errr.message}`);
        }
    }
};
