/*
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

import { Metaverse } from "@Modules/metaverse";
import { Domain } from "@Modules/domain";
import { Config, TrueValue, RECONNECT_ON_STARTUP } from "@Base/config";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Log from "@Modules/debugging/log";

export const Utility = {
    /**
     * Configuration information is persisted so restore what information
     * we can.
     */
    initializeConfig(): void {
        Config.initialize();
        Metaverse.initialize();
        Domain.initialize();
    },

    /**
     * Connect to the domain on startup.
     *
     * If we are supposed to connect at startup, do all the connection
     * setup stuff so the user is online.
     */
    initialConnectionSetup(): void {
        if (Config.getItem(RECONNECT_ON_STARTUP) === TrueValue) {
            Domain.restorePersistentVariables();
        }
    }
};
