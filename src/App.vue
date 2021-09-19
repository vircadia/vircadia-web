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

import { Utility } from "@Modules/utility";
import { Metaverse } from "@Modules/metaverse/metaverse";
import { ConnectionState } from "@Libs/vircadia-web-sdk";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Log from "@Modules/debugging/log";

export default defineComponent({
    name: "App",
    setup: function() {
        // Fetch and initialize configuration info
        Utility.initializeConfig();
    },
    mounted: async function() {
        // Start connections if we are restoring the session
        await Utility.initialConnectionSetup(
            function(pConnState: ConnectionState, pInfo: string) {
                Log.debug(Log.types.OTHER, `APP: new domain state: ${pConnState}/${pInfo}`);
            },
            function(pMV: Metaverse, pNewState: string) {
                Log.debug(Log.types.OTHER, `APP: new metaverse state: ${pNewState}`);
            }
        );
    }
});
</script>
