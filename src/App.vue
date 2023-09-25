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
import { applicationStore } from "@Stores/index";
import { Utility } from "@Modules/utility";
import Log from "@Modules/debugging/log";

// FIXME: Apps - This should be handled properly.
window.useIgloo = window.location.toString().includes("?igloo=1");

export default defineComponent({
    name: "App",
    setup() {
        // Fetch and initialize configuration info
        Log.debug(Log.types.OTHER, `APP: Initialize`);
        Utility.initializeConfig();
    },
    mounted() {
        // Log the SDK version.
        console.log("Starting Vircadia Web using SDK version:", applicationStore.globalConsts.SDK_VERSION_TAG);
        // Called after the APP is visible. This starts the engines doing things.
        // Start connections if we are restoring the session
        void Utility.initialConnectionSetup();
    }
});
</script>
