/*
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

import { Config } from "@Base/config";
import { Domain, DomainPersist } from "@Modules/domain/domain";

import { Slot } from "@Modules/utility/Signal";

// Allow 'get' statements to be compact
/* eslint-disable @typescript-eslint/brace-style */

export const DomainMgr = {
    _activeDomain: undefined as unknown as Domain,

    get ActiveDomain(): Domain { return DomainMgr._activeDomain; },
    set ActiveDomain(pDomain: Domain) { DomainMgr._activeDomain = pDomain; },

    get DefaultDomainUrl(): Nullable<string> {
        return Config.getItem(DomainPersist.DOMAIN_URL, undefined);
    },

    async domainFactory(pUrl: string, pDomainOps?: Slot): Promise<Domain> {
        const aDomain = new Domain();
        if (pDomainOps) {
            aDomain.onStateChange.connect(pDomainOps);
        }
        await aDomain.connect(pUrl);
        return aDomain;
    }
};
