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

import { Config } from "@Base/config";
import Log from "../debugging/log";

/** Names of configuration variables used for persistant storage in Config */
export const DomainPersist = {
    "DOMAIN_URL": "Domain.Url"
};

export class Domain {
    #_domainUrl = "UNKNOWN";
    public get DomainUrl(): string { return this.#_domainUrl; }

    #_domain: Nullable<DomainServer>;

    public onStateChange: Signal;

    constructor() {
        this.onStateChange = new Signal();
        this.restorePersistentVariables();
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async connect(pUrl: string): Promise<Domain> {
        if (this.#_domain) {
            Log.error(Log.types.OTHER, `Attempt to connect to domain when already connected`);
            throw new Error(`Attent to connect to domain when already connected`);
        }
        this.#_domain = new DomainServer();
        // this.#_domain.onStateChanged(Domain._onDomainStateChange.bind(this));
        this.#_domain.onStateChanged = Domain._onDomainStateChange.bind(this);
        this.#_domain.connect(pUrl);
        return this;
    }

    private static _onDomainStateChange(pState: ConnectionState, pInfo: string): void {
        Log.debug(Log.types.OTHER, `DomainStateChange: new state ${pState}, ${pInfo}`);
    }

    /** Return 'true' if the communication with the metaverse is active */
    get isConnected(): boolean {
        return this.#_domain?.state === ConnectionState.CONNECTED;
    }

    // eslint-disable-next-line class-methods-use-this,@typescript-eslint/require-await
    async getMetaverseUrl(): Promise<string> {
        // Eventually need to talk to the domain-server to get the URL
        return "https://metaverse.vircadia.com/live";
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
