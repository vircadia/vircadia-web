/*
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

import { Config } from "@Base/config";

/** Names of configuration variables used for persistant storage in Config */
export const DomainPersist = {
    "DOMAIN_URL": "Domain.Url"
};

export const Domain = {
    domainUrl: "UNKNOWN",

    initialize(): void {
        this.restorePersistentVariables();
    },

    /**
     * Store values that are remembered across sessions.
     *
     * Some values persist across sessions so, the next time the user opens the app, the
     * previous known values are restored and connection is automatically made.
     */
    storePersistentVariables(): void {
        Config.setItem(DomainPersist.DOMAIN_URL, Domain.domainUrl);
    },
    /**
     * Fetch and set persistantly stored variables.
     *
     * Note that this does not do any reactive pushing so this is best used to initialize.
     */
    restorePersistentVariables(): void {
        Domain.domainUrl = Config.getItem(DomainPersist.DOMAIN_URL, "UNKNOWN");
    }
};
