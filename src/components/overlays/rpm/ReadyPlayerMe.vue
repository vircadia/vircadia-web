<!--
//  ReadyPlayerMe.vue
//
//  Created by Giga on 27 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
-->

<style lang="scss" scoped>
</style>

<template>
    <OverlayShell
        icon="face"
        title="Ready Player Me"
        :managerProps="propsToPass"
        :defaultHeight="600"
        :defaultWidth="800"
        :defaultLeft="300"
        :hoverShowBar="false"
        :style="{
            'box-shadow': '0 1px 5px rgb(0 0 0 / 20%), 0 2px 2px rgb(0 0 0 / 14%), 0 3px 1px -2px rgb(0 0 0 / 12%)',
            border: 'none'
        }"
    >
        <q-card
            class="column no-wrap items-stretch full-height"
            style="background: transparent; box-shadow: none;"
        >
            <iframe
                src="https://readyplayer.me/avatar"
                title="ReadyPlayerMe"
                name="ReadyPlayerMe"
                width="800"
                height="600"
                allowfullscreen="false"
                allowpaymentrequest="false"
                frameBorder="0"
                style="width: 100%;height: 100%;"
            ></iframe>
        </q-card>
    </OverlayShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import OverlayShell from "../OverlayShell.vue";

export default defineComponent({
    name: "ReadyPlayerMe",

    components: {
        OverlayShell
    }
});
</script>
