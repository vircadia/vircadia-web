<!--
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
-->

<template>
    <div class="fullscreen bg-primary text-white text-center q-pa-md flex flex-center">
        <div>
            <div style="font-size: 30vh;">
                404
            </div>

            <div class="text-h2" style="opacity: 0.4;">
                Oops. Nothing here...
            </div>

            <q-btn
                class="q-mt-xl"
                color="white"
                text-color="primary"
                unelevated
                to="/"
                label="Go Home"
                no-caps
            />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "ErrorNotFound"
});
</script>
