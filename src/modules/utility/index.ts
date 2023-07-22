//
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { MetaverseManager } from "@Modules/metaverse";
import type { Metaverse, MetaverseState } from "@Modules/metaverse/metaverse";
import { DomainManager } from "@Modules/domain";
import type { Domain } from "@Modules/domain/domain";
import { Location } from "@Modules/domain/location";
import { applicationStore } from "@Stores/index";
import { Config, TrueValue, FalseValue, RECONNECT_ON_STARTUP, LAST_DOMAIN_SERVER, LOG_LEVEL } from "@Base/config";
import { Renderer } from "@Modules/scene";
import Log from "@Modules/debugging/log";

export class Utility {
    /**
     * Initialize the configuration system and restore the config from persistent storage.
     */
    public static initializeConfig(): void {
        Config.initialize();
        Log.setLogLevel(Config.getItem(LOG_LEVEL, "debug"));
    }

    /**
     * Connect to the Domain on startup.
     */
    public static async initialConnectionSetup(): Promise<void> {
        // Check if RECONNECT_ON_STARTUP is configured.
        const reconnectOnStartup = Config.getItem(RECONNECT_ON_STARTUP, FalseValue);
        if (reconnectOnStartup !== TrueValue) {
            // If not, connect to the default URL.
            Log.info(Log.types.METAVERSE, `Not performing reconnect-on-startup.`);
            await this.metaverseConnectionSetup(applicationStore.defaultConnectionConfig.DEFAULT_METAVERSE_URL);
            return;
        }

        // Check if a previous Domain server URL exists in persistent storage.
        const lastDomainServer = Config.getItem(LAST_DOMAIN_SERVER, undefined);
        if (!lastDomainServer) {
            // If not, connect to the default URL.
            Log.info(Log.types.METAVERSE, "Not performing reconnect-on-startup. URL for previous Domain server wasn't found.");
            await this.metaverseConnectionSetup(applicationStore.defaultConnectionConfig.DEFAULT_METAVERSE_URL);
            return;
        }

        // Perform reconnect-on-startup.
        Log.info(Log.types.METAVERSE, `Performing reconnect-on-startup...`);
        await this.connectionSetup(lastDomainServer);
    }

    /**
     * Start a connection to a Domain server.
     *
     * If the Domain connection is successful, a connection to the corresponding Metaverse server is also made.
     *
     * @param domainUrl The URL for the Domain server. Either just the hostname (default protocol and ports are added) or a fully qualified URL.
     * @param domainStateChangeCallback `(Optional)` A routine to be called whenever Domain connection state changes.
     * @param metaverseStateChangeCallback `(Optional)` A routine to be called whenever Metaverse connection state changes.
     */
    public static async connectionSetup(
        domainUrl: string,
        domainStateChangeCallback?: (domain: Domain, state: string, info: string) => void,
        metaverseStateChangeCallback?: (metaverse: Metaverse, state: MetaverseState) => void
    ): Promise<void> {
        if (!domainUrl) {
            return;
        }
        try {
            const location = new Location(domainUrl);
            if (location.host.length === 0) {
                Renderer.getScene().teleportMyAvatar(location);
            } else {
                Renderer.getScene().stopMyAvatar();

                // First ensure we disconnect from any currently active Domain.
                this.disconnectActiveDomain();

                // Connect to the new Domain server.
                Log.debug(Log.types.NETWORK, `connectionSetup: connecting to domain ${domainUrl}`);
                const domain = DomainManager.domainFactory(location.href, true);
                if (domainStateChangeCallback) {
                    domain.onStateChange.connect(domainStateChangeCallback);
                }

                // Connect to the Metaverse server.
                const metaverseUrl = domain.getMetaverseUrl();
                await Utility.metaverseConnectionSetup(metaverseUrl, metaverseStateChangeCallback);
            }
        } catch (error) {
            Log.error(Log.types.NETWORK, `Exception connecting: ${(error as Error).message}`);
        }
    }

    /**
     * Start a connection to a Metaverse server.
     * @param metaverseUrl The URL for the Metaverse server. Either just the hostname (default protocol and ports are added) or a fully qualified URL.
     * @param stateChangeCallback `(Optional)` A routine to be called whenever Metaverse connection state changes.
     */
    public static async metaverseConnectionSetup(
        metaverseUrl: string,
        stateChangeCallback?: (metaverse: Metaverse, state: MetaverseState) => void
    ): Promise<void> {
        if (!metaverseUrl) {
            return;
        }
        try {
            Log.debug(Log.types.NETWORK, `metaverseConnectionSetup: connecting to metaverse ${metaverseUrl}`);
            const metaverse = await MetaverseManager.metaverseFactory(metaverseUrl, true);
            if (stateChangeCallback) {
                metaverse.onStateChange.connect(stateChangeCallback);
            }
        } catch (error) {
            Log.error(Log.types.NETWORK, `Exception connecting to metaverse: ${(error as Error).message}`);
        }
    }

    /**
     * End the connection to the active Domain server.
     */
    public static disconnectActiveDomain(): void {
        DomainManager.ActiveDomain?.disconnect();
        DomainManager.ActiveDomain = undefined;
    }
}
