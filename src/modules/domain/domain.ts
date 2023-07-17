//
//  domain.ts
//
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

// Allow getters to be compact.
/* eslint-disable @typescript-eslint/brace-style */

import { DomainServer, SignalEmitter, Camera, EntityServer } from "@vircadia/web-sdk";
import { Account } from "@Modules/account";
import { DomainAudioClient } from "@Modules/domain/audio";
import { DomainMessageClient } from "@Modules/domain/message";
import { DomainAvatarClient } from "@Modules/domain/avatar";
import Log from "@Modules/debugging/log";
import { applicationStore } from "@Stores/index";
import { Client } from "./client";
import { Location } from "./location";
import assert from "@Modules/utility/assert";

// Routines connected to the onStateChange Signal, receive calls of this format:
export type OnDomainStateChangeCallback = (d: Domain, newState: string, info: string) => void;

// The web SDK doesn't export its ConnectionState member, so it is redefined here.
/**
 * The connection state of a Domain server.
 */
export enum ConnectionState {
    DISCONNECTED,
    CONNECTING,
    CONNECTED,
    REFUSED,
    ERROR
}

/**
 * Names of configuration variables used for persistant storage in Config.
 */
export const DomainPersist = {
    "DOMAIN_URL": "Domain.Url"
};

/**
 * Class instance for a connection to the Domain server.
 *
 * The creation of this class is a three step process:
 * - An instance is created,
 * - Watchers are added to the Signal places,
 * - Then the URL is set.
 * The final step opens communication with the Domain server and will generate state changes.
 *
 * @example ```
 *   const aDomain = new Domain();
 *   aDomain.onStateChange.connect((domain: Domain, newState: string, info: string) => {
 *       // Do stuff whenever the Domain connection's state changes.
 *   });
 *   aDomain.connect(theUrl);
 * ```
 */
export class Domain {
    private domain: Nullable<DomainServer>;
    private audioClient: Nullable<DomainAudioClient>;
    private messageClient: Nullable<DomainMessageClient>;
    private avatarClient: Nullable<DomainAvatarClient>;
    private entityClient: Nullable<EntityServer>;
    private camera:Nullable<Camera>;

    private location = new Location("");

    public onStateChange: SignalEmitter;

    constructor() {
        this.onStateChange = new SignalEmitter();
        Account.onAttributeChange.connect(this.updateDomainLogin.bind(this));
    }

    public get DomainClient(): Nullable<DomainServer> { return this.domain; }
    public get AudioClient(): Nullable<DomainAudioClient> { return this.audioClient; }
    public get MessageClient(): Nullable<DomainMessageClient> { return this.messageClient; }
    public get AvatarClient(): Nullable<DomainAvatarClient> { return this.avatarClient; }
    public get EntityClient(): Nullable<EntityServer> { return this.entityClient; }
    public get Camera(): Nullable<Camera> { return this.camera; }

    public get Location(): Location { return this.location; }

    public get ContextId(): number { return this.domain?.contextID ?? 0; }

    public get DomainState(): ConnectionState { return this.domain?.state ?? DomainServer.DISCONNECTED; }

    public get DomainStateAsString(): string { return DomainServer.stateToString(this.DomainState); }

    public static get DISCONNECTED(): string { return DomainServer.stateToString(DomainServer.DISCONNECTED); }
    public static get CONNECTING(): string { return DomainServer.stateToString(DomainServer.CONNECTING); }
    public static get CONNECTED(): string { return DomainServer.stateToString(DomainServer.CONNECTED); }
    public static get REFUSED(): string { return DomainServer.stateToString(DomainServer.REFUSED); }
    public static get ERROR(): string { return DomainServer.stateToString(DomainServer.ERROR); }

    /**
     * `true` if the Domain connection is active, `false` if inactive.
     */
    public get isConnected(): boolean {
        return this.domain?.state === DomainServer.CONNECTED;
    }

    /**
     * Convert the connection state of a Domain server to a string.
     * @param state The state to convert.
     * @returns The state as a string.
     */
    public static stateToString(state: ConnectionState): string {
        return DomainServer.stateToString(state);
    }

    /**
     * Connect to a Domain server at the given URL.
     * @param url The URL of the Domain server.
     * @returns A reference to this Domain instance for easy chaining.
     */
    public connect(url: string): Domain {
        if (this.domain) {
            const errorMessage = "Attempted to connect to a Domain when already connected.";
            Log.error(Log.types.NETWORK, errorMessage);
            throw new Error(errorMessage);
        }

        this.location = new Location(url);
        if (this.location.protocol === "") {
            this.location.protocol = applicationStore.defaultConnectionConfig.DEFAULT_DOMAIN_PROTOCOL;
        }
        if (this.location.port === "") {
            this.location.port = applicationStore.defaultConnectionConfig.DEFAULT_DOMAIN_PORT;
        }

        Log.debug(Log.types.NETWORK, `Creating a new DomainServer.`);
        this.domain = new DomainServer();
        this.domain.account.authRequired.connect(() => {
            console.debug("AUTH REQUIRED: Open login dialog");
            applicationStore.dialog.show = true;
            applicationStore.dialog.which = "Login";
        });
        this.updateDomainLogin();

        this.camera = new Camera(this.domain.contextID);
        this.camera.centerRadius = 1000;

        // Create new instances for all the clients.
        this.avatarClient = new DomainAvatarClient(this);
        this.messageClient = new DomainMessageClient(this);
        this.audioClient = new DomainAudioClient(this);
        this.entityClient = new EntityServer(this.ContextId);

        // Connect to the domain. The 'connected' event will say if the connection was made.
        Log.debug(Log.types.NETWORK, `Connecting to domain at ${this.location.href}`);
        this.domain.onStateChanged = (pState: ConnectionState, pInfo: string): void => {
            Log.debug(Log.types.NETWORK, `New Domain state: ${Domain.stateToString(pState)}, ${pInfo}`);
            this.onStateChange.emit(this, pState, pInfo);
            if (this.domain) {
                applicationStore.updateDomainState(this, this.domain.state, pInfo);
            }
        };

        this.domain.connect(this.location.href);
        return this;
    }

    /**
     * Disconnect from the Domain server.
     */
    public disconnect(): void {
        Log.info(Log.types.NETWORK, `Disconnected from Domain: ${this.location.href}`);
        this.domain?.disconnect();
        this.domain = undefined;
        this.entityClient = undefined;
    }

    /**
     * Wait for the Domain server to connect.
     * @returns A Promise that resolves with a reference to the Domain server once the connection has been established.
     */
    public async waitForConnected(): Promise<Domain> {
        const waitForConnectedMS = 200;
        while (typeof this.domain === "undefined") {
            // eslint-disable-next-line no-await-in-loop
            await Client.waitABit(waitForConnectedMS);
        }
        while (this.domain?.state !== ConnectionState.CONNECTED) {
            // eslint-disable-next-line no-await-in-loop
            await Client.waitABit(waitForConnectedMS);
        }
        return this;
    }

    // eslint-disable-next-line class-methods-use-this
    public getMetaverseUrl(): string {
        // TODO: Eventually need to talk to the Domain server to get the URL.
        return applicationStore.defaultConnectionConfig.DEFAULT_METAVERSE_URL;
    }

    /**
     * Checkout the passed URL and make sure it has the "ws:" at the beginning
     * and the port number at the end.
     *
     * @param url the url passed by the user
     */
    public static cleanDomainUrl(url: string): string {
        let filteredUrl = url.toLowerCase();
        // Strip off any http headers
        if (filteredUrl.startsWith("http://")) {
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            filteredUrl = filteredUrl.substring(7);
        }
        if (filteredUrl.startsWith("https://")) {
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            filteredUrl = filteredUrl.substring(8);
        }
        if (!(filteredUrl.startsWith("ws://") || filteredUrl.startsWith("wss://"))) {
            filteredUrl = applicationStore.defaultConnectionConfig.DEFAULT_DOMAIN_PROTOCOL + "//" + filteredUrl;
        }

        const fullUrl = new URL(filteredUrl);
        if (fullUrl.port === "") {
            fullUrl.port = applicationStore.defaultConnectionConfig.DEFAULT_DOMAIN_PORT;
        }

        filteredUrl = fullUrl.href;
        // Trim the last "/".
        if (filteredUrl[filteredUrl.length - 1] === "/") {
            filteredUrl = filteredUrl.slice(0, filteredUrl.length - 1);
        }

        return filteredUrl;
    }

    public update(): void {
        this.avatarClient?.update();
        this.entityClient?.update();
    }

    private updateDomainLogin(): void {
        if (!this.domain) {
            return;
        }

        if (Account.isLoggedIn) {
            const MS_PER_SECOND = 1000;
            /* eslint-disable camelcase */
            assert(Account.accessToken !== null && Account.accessTokenType !== null && Account.refreshToken !== null);
            this.domain.account.login(Account.accountName, {
                access_token: Account.accessToken,
                token_type: Account.accessTokenType,
                expires_in: Math.round((Account.accessTokenExpiration.getTime() - Date.now()) / MS_PER_SECOND),
                refresh_token: Account.refreshToken
            });
            /* eslint-enable camelcase */
        } else if (this.domain.account.isLoggedIn()) {
            this.domain.account.logout();
        }
    }
}
