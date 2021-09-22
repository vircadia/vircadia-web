/*
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

// Allow 'get' lines to be compact
/* eslint-disable @typescript-eslint/brace-style */

import { DomainServer, ConnectionState } from "@Libs/vircadia-web-sdk";

import Signal from "@Modules/utility/Signal";

import { Config, DEFAULT_METAVERSE_URL, DEFAULT_DOMAIN_PROTOCOL, DEFAULT_DOMAIN_PORT } from "@Base/config";
import Log from "@Modules/debugging/log";

/** Names of configuration variables used for persistant storage in Config */
export const DomainPersist = {
    "DOMAIN_URL": "Domain.Url"
};

/**
 * Class instance for a connection to the domain-server.
 *
 * The creation of this class is two step in that an instance is created,
 * watchers are added to the Signal places, and then the URL is set.
 * This latter operation causes communication with the domain-server
 * and will generate state changes.
 *
 * ```
 *      aDomain = new Domain();
 *      aDomain.onStateChange.connect((pDomain: Domain, pNewState: ConnectionState, pInfo: string) => {
 *          // do stuff
 *      });
 *      await aDomain.connect(theUrl);
 * ```
 */
export class Domain {
    #_domainUrl = "UNKNOWN";
    public get DomainUrl(): string { return this.#_domainUrl; }

    #_domain: Nullable<DomainServer>;

    public onStateChange: Signal;

    public get DomainState(): ConnectionState { return this.#_domain?.state ?? ConnectionState.DISCONNECTED; }
    public get DomainStateAsString(): string {
        if (this.#_domain) {
            return DomainServer.stateToString(this.#_domain.state);
        }
        return DomainServer.stateToString(ConnectionState.DISCONNECTED);
    }

    constructor() {
        this.onStateChange = new Signal();
        this.restorePersistentVariables();
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async connect(pUrl: string): Promise<Domain> {
        if (this.#_domain) {
            Log.error(Log.types.COMM, `Attempt to connect to domain when already connected`);
            throw new Error(`Attempt to connect to domain when already connected`);
        }
        this.#_domainUrl = Domain.cleanDomainUrl(pUrl);
        this.#_domain = new DomainServer();
        // this.#_domain.onStateChanged(Domain._onDomainStateChange.bind(this));
        this.#_domain.onStateChanged = this._onDomainStateChange.bind(this);
        this.#_domain.connect(this.#_domainUrl);
        return this;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async disconnect(): Promise<void> {
        Log.info(Log.types.COMM, `Domain: disconnect of domain ${this.DomainUrl}`);
    }

    private _onDomainStateChange(pState: ConnectionState, pInfo: string): void {
        Log.debug(Log.types.COMM, `DomainStateChange: new state ${pState}, ${pInfo}`);
        this.onStateChange.emit(this, pState, pInfo);
    }

    /** Return 'true' if the communication with the metaverse is active */
    get isConnected(): boolean {
        return this.#_domain?.state === ConnectionState.CONNECTED;
    }

    // eslint-disable-next-line class-methods-use-this,@typescript-eslint/require-await
    async getMetaverseUrl(): Promise<string> {
        // Eventually need to talk to the domain-server to get the URL
        return Config.getItem(DEFAULT_METAVERSE_URL);
    }

    /**
     * Checkout the passed URL and make sure it has the "ws:" at the beginning
     * and the port number at the end.
     *
     * @param pUrl the url passed by the user
     */
    static cleanDomainUrl(pUrl: string): string {
        let url = pUrl.toLowerCase();
        // Strip off any http headers
        if (url.startsWith("http://")) {
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            url = url.substring(7);
        }
        if (url.startsWith("https://")) {
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            url = url.substring(8);
        }
        if (!url.startsWith("ws://")) {
            url = Config.getItem(DEFAULT_DOMAIN_PROTOCOL) + "//" + url;
        }
        // See if there is a :port on the end
        const ifPort = (/:\d*$/u).exec(url);
        if (!Array.isArray(ifPort)) {
            url = url + ":" + Config.getItem(DEFAULT_DOMAIN_PORT);
        }
        return url;
    }

    /**
     * Store values that are remembered across sessions.
     *
     * Some values persist across sessions so, the next time the user opens the app, the
     * previous known values are restored and connection is automatically made.
     */
    storePersistentVariables(): void {
        Config.setItem(DomainPersist.DOMAIN_URL, this.#_domainUrl);
    }

    /**
     * Fetch and set persistantly stored variables.
     *
     * Note that this does not do any reactive pushing so this is best used to initialize.
     */
    restorePersistentVariables(): void {
        this.#_domainUrl = Config.getItem(DomainPersist.DOMAIN_URL, "UNKNOWN");
    }

}
