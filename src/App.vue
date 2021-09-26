<!--
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
-->
<template>
  <router-view />
</template>
<script lang="ts">
import { defineComponent } from "vue";

import { Store, Actions as StoreActions } from "@Store/index";
import { Utility } from "@Modules/utility";
import { Metaverse } from "@Modules/metaverse/metaverse";
import { Domain } from "@Modules/domain/domain";
import { ConnectionState } from "@Libs/vircadia-web-sdk";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Log from "@Modules/debugging/log";

export default defineComponent({
    name: "App",
    setup: function() {
        // Fetch and initialize configuration info
        Log.debug(Log.types.OTHER, `APP: Initialize`);
        Utility.initializeConfig();
    },
    mounted: async function() {
        // Called after the APP is visible. This starts the engines doing things.
        // Start connections if we are restoring the session
        await Utility.initialConnectionSetup(
            function(pDomain: Domain, pConnState: ConnectionState, pInfo: string) {
                Log.debug(Log.types.OTHER, `APP: new domain state: ${pConnState}/${pInfo}`);
                // eslint-disable-next-line no-void
                void Store.dispatch(StoreActions.UPDATE_DOMAIN, {
                    domain: pDomain,
                    newState: pDomain.DomainStateAsString,
                    info: pInfo
                });
            },
            function(pMV: Metaverse, pNewState: string) {
                Log.debug(Log.types.OTHER, `APP: new metaverse state: ${pNewState}`);
                // eslint-disable-next-line no-void
                void Store.dispatch(StoreActions.UPDATE_METAVERSE, {
                    metaverse: pMV,
                    newState: pNewState
                });
            }
        );
    }
});
</script>
