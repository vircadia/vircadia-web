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

<script setup lang="ts">
import { onMounted } from "vue";
import { applicationStore } from "@Stores/index";
import { Utility } from "@Modules/utility";
import Log from "@Modules/debugging/log";

// Fetch and initialize configuration info
Log.debug(Log.types.OTHER, `APP: Initialize`);
Utility.initializeConfig();

onMounted(() => {
    // Log the SDK version.
    console.log("Starting Vircadia Web using SDK version:", applicationStore.globalConsts.SDK_VERSION_TAG);
    // Called after the APP is visible. This starts the engines doing things.
    // Start connections if we are restoring the session
    void Utility.initialConnectionSetup();
    // Hide the preloader.
    const preloader = document.getElementById("preloader");
    if (preloader) {
        preloader.classList.add("hide");
    }
});
</script>
