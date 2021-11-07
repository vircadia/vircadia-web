/*
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Config, LAST_DOMAIN_SERVER } from "@Base/config";
import { ConnectionState, SignalEmitter, Slot } from "@vircadia/web-sdk";

import { Domain } from "@Modules/domain/domain";

import Log from "../debugging/log";

// Allow 'get' statements to be compact
/* eslint-disable @typescript-eslint/brace-style */

export const DomainMgr = {
    _activeDomain: undefined as unknown as Domain,
    // Collection of the domain-server connections
    _domains: new Map<string, Domain>(),

    // There is one main domain we're working with
    get ActiveDomain(): Domain { return DomainMgr._activeDomain; },
    set ActiveDomain(pDomain: Domain) {
        if (DomainMgr._activeDomain) {
            // If already have an active domain, disconnect from the state change event
            // eslint-disable-next-line @typescript-eslint/unbound-method
            DomainMgr._activeDomain.onStateChange.disconnect(DomainMgr._handleActiveDomainStateChange);
        }
        DomainMgr._activeDomain = pDomain;
        // eslint-disable-next-line @typescript-eslint/unbound-method
        pDomain.onStateChange.connect(DomainMgr._handleActiveDomainStateChange);
    },

    // Event fired when the active domain state changes.
    // This is used by subsystems to know when to setup connection to the domain.
    onActiveDomainStateChange: new SignalEmitter(),

    /**
     * Create connection to a domain-server and return a Domain object with the connection.
     *
     * @param pUrl network address of domain
     * @param pDomainOps optional stateChange event receiver
     * @returns Domain object with the connection initialized
     * @throws if there are connection errors
     */
    async domainFactory(pUrl: string, pDomainOps?: Slot): Promise<Domain> {
        Log.debug(Log.types.COMM, `DomainMgr.domainFactory: creating domain ${pUrl}`);
        const aDomain = new Domain();
        if (pDomainOps) {
            aDomain.onStateChange.connect(pDomainOps);
        }
        try {
            await aDomain.connect(pUrl);
            DomainMgr._domains.set(aDomain.DomainUrl, aDomain);
            // Remember the last connected domain for potential restarts
            Config.setItem(LAST_DOMAIN_SERVER, aDomain.DomainUrl);
        } catch (err) {
            Log.error(Log.types.COMM, `Exception connecting to domain ${pUrl}`);
            throw err;
        }
        return aDomain;
    },

    // Pass the state change event from the active domain
    _handleActiveDomainStateChange(pDomain: Domain, pState: ConnectionState, pInfo: string): void {
        DomainMgr.onActiveDomainStateChange.emit(pDomain, pState, pInfo);
    },

    // eslint-disable-next-line @typescript-eslint/require-await
    async shutdown(): Promise<void> {
        Log.info(Log.types.COMM, `DomainMgr: shutdown`);
    }
};
