/*
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

import { MetaverseMgr } from "@Modules/metaverse";
import { DomainMgr } from "@Modules/domain";
import { Domain } from "@Modules/domain/domain";
import { Location } from "@Modules/domain/location";
import { useApplicationStore } from "@Base/stores/application-store";
import {
    Config, TrueValue, FalseValue, RECONNECT_ON_STARTUP, LAST_DOMAIN_SERVER,
    LOG_LEVEL
} from "@Base/config";

/* eslint-disable require-atomic-updates */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Log from "@Modules/debugging/log";
import { Renderer } from "@Modules/scene";

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
    async initialConnectionSetup(): Promise<void> {
        if (Config.getItem(RECONNECT_ON_STARTUP, FalseValue) === TrueValue) {
            Log.info(Log.types.METAVERSE, `Doing Reconnect on Startup`);
            const lastDomainServer = Config.getItem(LAST_DOMAIN_SERVER, undefined);
            if (lastDomainServer) {
                await Utility.connectionSetup(lastDomainServer);
            }
        } else {
            Log.info(Log.types.COMM, `Not performing Reconnect on Startup. See "config"`);
        }

        // if we haven't connected to a metaverse already from a domain reconnect at startup
        if (!MetaverseMgr.ActiveMetaverse) {
            const metaverseUrl = useApplicationStore().defaultConnectionConfig.DEFAULT_METAVERSE_URL;
            await Utility.metaverseConnectionSetup(metaverseUrl);
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
    async connectionSetup(pDomainUrl: string): Promise<void> {
        if (pDomainUrl) {
            try {
                const location = new Location(pDomainUrl);
                if (location.host.length === 0) {
                    Renderer.getScene().teleportMyAvatar(location);
                } else {
                    Renderer.getScene().stopMyAvatar();

                    // First ensure we disconnect from any currently active domain.
                    await this.disconnectActiveDomain();

                    Log.debug(Log.types.COMM, `connectionSetup: connecting to domain ${pDomainUrl}`);
                    const domain = await DomainMgr.domainFactory(location.href);
                    await this.connectActiveDomain(domain);

                    const metaverseUrl = await domain.getMetaverseUrl();
                    await Utility.metaverseConnectionSetup(metaverseUrl);
                }
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
    async metaverseConnectionSetup(pMetaverseUrl: string): Promise<void> {
        try {
            if (pMetaverseUrl) {
                Log.debug(Log.types.COMM, `metaverseConnectionSetup: connecting to metaverse ${pMetaverseUrl}`);
                const metaverse = await MetaverseMgr.metaverseFactory(pMetaverseUrl);
                MetaverseMgr.ActiveMetaverse = metaverse;
            }
        } catch (err) {
            const errr = <Error>err;
            Log.error(Log.types.COMM, `Exception connecting to metaverse: ${errr.message}`);
        }
    },

    /**
     * Set the specified domain as the active domain.
     *
     * This creates all the Signal subscriptions that will cause state to be updated.
     */
    // eslint-disable-next-line @typescript-eslint/require-await
    async connectActiveDomain(pDomain: Domain): Promise<void> {
        DomainMgr.ActiveDomain = pDomain;
    },

    /**
     * End a connection to a domain-server.
     *
     * If there is currently an active domain setup, this fires the disconnect method on that domain.
     */
    async disconnectActiveDomain(): Promise<void> {
        if (DomainMgr.ActiveDomain) {
            await DomainMgr.ActiveDomain.disconnect();
            DomainMgr.ActiveDomain = undefined;
        }
    }
};
