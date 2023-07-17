//
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { Config, LAST_DOMAIN_SERVER } from "@Base/config";
import { SignalEmitter } from "@vircadia/web-sdk";
import { Client } from "@Modules/domain/client";
import { ConnectionState, Domain } from "@Modules/domain/domain";
import Log from "@Modules/debugging/log";

/**
 * Static manager for all Domain server connections.
 */
export class DomainManager {
    /**
     * The ID of the game loop interval.
     */
    private static intervalID: Nullable<NodeJS.Timeout>;

    /**
     * Collection of Domain server connections.
     */
    private static domains = new Map<string, Domain>();

    /**
     * Event fired when the active domain state changes.
     *
     * This is used by subsystems to know when to setup connection to the domain.
     */
    public static onActiveDomainStateChange = new SignalEmitter();

    /**
     * The active Domain.
     */
    private static activeDomain: Nullable<Domain>;

    /**
     * The active Domain.
     */
    public static get ActiveDomain(): Nullable<Domain> {
        return this.activeDomain;
    }

    /**
     * The active Domain.
     */
    public static set ActiveDomain(domain: Nullable<Domain>) {
        Log.debug(Log.types.OTHER, `Domain Manager: Setting active Domain.`);
        if (this.activeDomain) {
            Log.debug(Log.types.OTHER, `Domain Manager: Disconnecting from old Domain.`);
            // If already have an active domain, disconnect from the state change event
            this.activeDomain.onStateChange.disconnect(this.handleActiveDomainStateChange.bind(this));
        }
        this.activeDomain = domain;
        if (domain) {
            Log.debug(Log.types.OTHER, `Domain Manager: Connecting to new Domain.`);
            domain.onStateChange.connect(this.handleActiveDomainStateChange.bind(this));
            if (domain.DomainClient?.state === ConnectionState.CONNECTED) {
                Log.debug(Log.types.OTHER, `Domain Manager: New Domain connected.`);
                this.handleActiveDomainStateChange(domain, domain.DomainClient.state, "init");
            }
        }
    }

    /**
     * Wait for the active Domain server to connect.
     * @returns A Promise that resolves with a reference to the Domain server once the connection has been established.
     */
    public static async waitForActiveDomainConnected(): Promise<Domain> {
        while (!this.activeDomain) {
            // eslint-disable-next-line no-await-in-loop, @typescript-eslint/no-magic-numbers
            await Client.waitABit(200);
        }
        await this.activeDomain.waitForConnected();
        return this.activeDomain;
    }

    /**
     * Create a new Domain server connection.
     *
     * @param url The URL of the Domain server.
     * @param setToActive `(Optional)` Set the new Metaverse connection to be the active connection for the application.
     * @returns A new Domain connection instance.
     * @throws If there are any connection errors.
     */
    public static domainFactory(url: string, setToActive = false): Domain {
        Log.debug(Log.types.NETWORK, `DomainManager.domainFactory: Creating Domain ${url}`);
        const domain = new Domain();
        try {
            domain.connect(url);
            // this._domains.set(aDomain.DomainUrl, aDomain);
            this.domains.set(domain.Location.href, domain);
            // Remember the last connected domain for potential restarts
            // Config.setItem(LAST_DOMAIN_SERVER, aDomain.DomainUrl);
            Config.setItem(LAST_DOMAIN_SERVER, domain.Location.href);
        } catch (error) {
            Log.error(Log.types.NETWORK, `Exception connecting to Domain at ${url}`);
            throw error;
        }
        if (setToActive) {
            this.ActiveDomain = domain;
        }
        return domain;
    }

    /**
     * Update the state of the active Domain.
     */
    public static update(): void {
        if (this.activeDomain) {
            this.activeDomain.update();
        }
    }

    /**
     * Start the active Domain's update loop.
     */
    public static startGameLoop(): void {
        if (!this.intervalID) {
            const TICK_TIME = 33;
            this.intervalID = setInterval(this.update.bind(this), TICK_TIME);
        }
    }

    /**
     * Stop the active Domain's update loop.
     */
    public static stopGameLoop(): void {
        if (this.intervalID) {
            clearInterval(this.intervalID);
            this.intervalID = null;
        }
    }

    private static handleActiveDomainStateChange(domain: Domain, state: ConnectionState, info: string): void {
        Log.debug(Log.types.OTHER, `Domain Manager: Active Domain state changed to ${Domain.stateToString(state)}.`);
        this.onActiveDomainStateChange.emit(domain, state, info); // Signature: Domain, ConnectionState, string.
    }
}
