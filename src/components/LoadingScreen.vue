<!--
//  LoadingScreen.vue
//
//  Created by Giga on 27 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
-->

<style lang="scss" scoped>
#loadingScreen {
    position: absolute;
    z-index: 100;
    inset: 0px;
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    align-items: center;
    gap: 10px;
    background-color: #000;
    user-select: none;

    & > .inner {
        display: flex;
        flex-flow: column nowrap;
        justify-content: center;
        align-items: center;
        width: 250px;
        height: 250px;
        aspect-ratio: 1;
    }

    img {
        display: block;
        width: 200px;
        height: 200px;
        aspect-ratio: 1;
    }

    .q-spinner {
        position: absolute;
        transform: scale(5);
    }
}
</style>

<template>
    <div
        id="loadingScreen"
        @click.stop=""
    >
        <div class="inner">
            <img :src="applicationStore.theme.logo" draggable="false" alt="" width="200" height="200">
            <q-spinner-tail
                size="xl"
            />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { applicationStore } from "@Stores/index";

export default defineComponent({
    name: "LoadingScreen",

    setup() {
        return {
            applicationStore
        };
    }
});
</script>
