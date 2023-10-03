<!--
//  AudioLevel.vue
//
//  Created by Giga on July 17th, 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
-->

<style scoped lang="scss">
.verticalAudioLevel {
    position: relative;
    display: block;
    width: 0.7ch;
    min-height: 40px;
    color: $primary;
    font-size: 1rem;
    background-color: #8884;
    border-radius: 0.7ch;
    overflow: hidden;

    > span {
        position: absolute;
        bottom: 0px;
        display: block;
        width: 100%;
        height: 0%;
        color: inherit;
        background-color: currentColor;
        border-radius: inherit;
        transition: 0.05s ease height;
    }
}
</style>

<template>
    <div
        class="verticalAudioLevel q-my-auto"
        :class="{ 'q-ml-sm': compact }"
    >
        <span
            :class="`text-${color ?? 'primary'}`"
            :style="{ height }"
        ></span>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { AudioIO } from "@Modules/ui/audioIO";

export default defineComponent({
    name: "AudioLevel",

    props: {
        color: { type: String, required: false },
        compact: { type: Boolean, required: false },
        level: { type: Number, required: false }
    },

    computed: {
        height(): string {
            return `${this.level ?? AudioIO.inputLevel.value}%`;
        }
    }
});
</script>
