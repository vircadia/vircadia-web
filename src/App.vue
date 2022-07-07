<!--
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
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
        // eslint-disable-next-line @typescript-eslint/unbound-method
        await Utility.initialConnectionSetup();
    }
});
</script>
