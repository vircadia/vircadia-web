/*
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Config, LAST_DOMAIN_SERVER } from "@Base/config";
import { SignalEmitter } from "@vircadia/web-sdk";

import { Client } from "@Modules/domain/client";
import { Domain, ConnectionState } from "@Modules/domain/domain";

import Log from "../debugging/log";

export type OnActiveDomainStateChangeSlot = (pDomain: Domain, pState: ConnectionState, pInfo: string) => void;

// Allow 'get' statements to be compact
/* eslint-disable @typescript-eslint/brace-style */

export const DomainMgr = {
    _activeDomain: undefined as unknown as Domain,
    // Collection of the domain-server connections
    _domains: new Map<string, Domain>(),
    _boundUpdateFunction: <Nullable<()=>void>>null,
    _intervalID: <Nullable<NodeJS.Timeout>>null,

    // There is one main domain we're working with
    get ActiveDomain(): Nullable<Domain> { return DomainMgr._activeDomain; },
    set ActiveDomain(pDomain: Nullable<Domain>) {
        if (DomainMgr._activeDomain) {
            Log.debug(Log.types.OTHER, `DomainMgr: setting active domain. Disconnecting old`);
            // If already have an active domain, disconnect from the state change event
            // eslint-disable-next-line @typescript-eslint/unbound-method
            DomainMgr._activeDomain.onStateChange.disconnect(DomainMgr._handleActiveDomainStateChange);
        }
        DomainMgr._activeDomain = pDomain as Domain;
        if (pDomain) {
            Log.debug(Log.types.OTHER, `DomainMgr: setting active domain`);
            // eslint-disable-next-line @typescript-eslint/unbound-method
            pDomain.onStateChange.connect(DomainMgr._handleActiveDomainStateChange);
            if (pDomain.DomainClient?.state === ConnectionState.CONNECTED) {
                Log.debug(Log.types.OTHER, `DomainMgr: setting active domain. Domain already CONNECTED`);
                DomainMgr._handleActiveDomainStateChange(pDomain, pDomain.DomainClient.state, "init");
            }
        }
    },

    // Event fired when the active domain state changes.
    // This is used by subsystems to know when to setup connection to the domain.
    onActiveDomainStateChange: new SignalEmitter(),

    async waitForActiveDomainConnected(): Promise<Domain> {
        while (typeof DomainMgr._activeDomain === "undefined") {
            // eslint-disable-next-line no-await-in-loop,@typescript-eslint/no-magic-numbers
            await Client.waitABit(200);
        }
        await DomainMgr._activeDomain.waitForConnected();
        return DomainMgr._activeDomain;
    },

    /**
     * Create connection to a domain-server and return a Domain object with the connection.
     *
     * @param pUrl network address of domain
     * @returns Domain object with the connection initialized
     * @throws if there are connection errors
     */
    async domainFactory(pUrl: string): Promise<Domain> {
        Log.debug(Log.types.COMM, `DomainMgr.domainFactory: creating domain ${pUrl}`);
        const aDomain = new Domain();
        try {
            await aDomain.connect(pUrl);
            // DomainMgr._domains.set(aDomain.DomainUrl, aDomain);
            DomainMgr._domains.set(aDomain.Location.href, aDomain);
            // Remember the last connected domain for potential restarts
            // Config.setItem(LAST_DOMAIN_SERVER, aDomain.DomainUrl);
            Config.setItem(LAST_DOMAIN_SERVER, aDomain.Location.href);
        } catch (err) {
            Log.error(Log.types.COMM, `Exception connecting to domain ${pUrl}`);
            throw err;
        }
        return aDomain;
    },

    // Pass  the events for the active domain
    _handleActiveDomainStateChange(pDomain: Domain, pState: ConnectionState, pInfo: string): void {
        Log.debug(Log.types.OTHER, `DomainMgr: onActiveDomainStateChange.emit. state=${Domain.stateToString(pState)}`);
        DomainMgr.onActiveDomainStateChange.emit(pDomain, pState, pInfo);
    },

    // eslint-disable-next-line @typescript-eslint/require-await
    async shutdown(): Promise<void> {
        Log.info(Log.types.COMM, `DomainMgr: shutdown`);
    },

    update():void {
        if (DomainMgr._activeDomain) {
            DomainMgr._activeDomain.update();
        }
    },

    /**
     * Start the update loop of domain.
     */
    startGameLoop(): void {
        if (!this._intervalID) {
            this._boundUpdateFunction = this.update.bind(this);
            const TICK_TIME = 33;
            this._intervalID = setInterval(this._boundUpdateFunction, TICK_TIME); }
    },

    stopGameLoop(): void {
        if (this._intervalID) {
            clearInterval(this._intervalID);
            this._intervalID = null;
        }
    }
};
