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
    gap: 6rem;
    color: white;
    background-color: #000;
    user-select: none;

    &>.inner {
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

    .hint {
        --transition-duration: 0.8s;
        position: relative;
        display: flex;
        flex-flow: column nowrap;
        justify-content: center;
        align-items: center;
        gap: 0;
        width: 100%;
        padding: 0 2rem;
        font-size: 1em;
        line-height: 1.7em;
        text-align: center;

        &>div {
            position: absolute;
            padding: 0 2rem;
        }

        &>div::before {
            content: 'Hint: ';
            opacity: 0.8;
        }

        &>div:nth-child(1) {
            transform: translateY(0);
            opacity: 1;
        }

        &>div:nth-child(2) {
            transform: translateY(100%);
            opacity: 0;
        }

        &.showNext>div:nth-child(1) {
            transform: translateY(-100%);
            opacity: 0;
            transition: var(--transition-duration) ease-out transform, var(--transition-duration) ease-out opacity;
        }

        &.showNext>div:nth-child(2) {
            transform: translateY(0);
            opacity: 1;
            transition: var(--transition-duration) ease-out transform, var(--transition-duration) ease-out opacity;
        }
    }
}
</style>

<template>
    <div id="loadingScreen" @click.stop="">
        <div class="inner">
            <img :src="applicationStore.theme.logo" draggable="false" alt="" width="200" height="200">
            <q-spinner-tail size="xl" />
        </div>
        <div v-if="applicationStore.theme.showLoadingScreenHints !== 'false'" class="hint" :class="{ showNext }">
            <div v-html="hint"></div>
            <div v-html="nextHint"></div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { KeyboardSettings } from "@Modules/avatar/controller/inputs/keyboardSettings";
import { applicationStore, userStore } from "@Stores/index";

export default defineComponent({
    name: "LoadingScreen",

    setup() {
        /* eslint-disable max-len */
        /**
         * The list of hint messages. Add/remove messages from this list. TODO: Add ability to load list of strings from env variable and format them on load.
         */
        const hints = [
            `Press <kbd>${KeyboardSettings.formatKeyName(userStore.controls.keyboard.movement.fly.keycode)}</kbd> to fly.`,
            `If you get stuck somewhere, press <kbd>${KeyboardSettings.formatKeyName(userStore.controls.keyboard.other.resetPosition.keycode)}</kbd> to reset your position.`,
            `The "People" menu shows you everyone else present in your world.`,
            `Almonds are a member of the peach family.`,
            `You can press <kbd>${KeyboardSettings.formatKeyName(userStore.controls.keyboard.other.openChat.keycode)}</kbd> to quickly open the chat.`,
            `Sloths can hold their breath longer than dolphins.`,
            `Press <kbd>${KeyboardSettings.formatKeyName(userStore.controls.keyboard.movement.clap.keycode)}</kbd> to clap.`,
            `Australia is wider than the moon.`,
            `Press <kbd>${KeyboardSettings.formatKeyName(userStore.controls.keyboard.movement.salute.keycode)}</kbd> to salute.`,
            `Vircadia supports 400+ people connected to the same world at once!`,
            `Press <kbd>${KeyboardSettings.formatKeyName(userStore.controls.keyboard.movement.sit.keycode)}</kbd> to sit down anywhere.`,
            `You can change your avatar and display name in the "Avatar" menu.`,
            `You are amazing!`
        ];
        /* eslint-enable max-len */

        /**
         * Wrap an index to the range 0 -> hints.length - 1.
         * @param index The index to wrap.
         * @returns The wrapped index.
         */
        function wrap(index: number): number {
            return Math.max(index > hints.length - 1 ? 0 : index, 0);
        }

        const index = ref(Math.floor(Math.random() * hints.length));
        const hint = computed(() => hints[index.value]);
        const nextHint = computed(() => hints[wrap(index.value + 1)]);
        const delay = 9000;
        const transition = 1000;
        const showNext = ref(false);

        function changeHint(): void {
            showNext.value = true;
            window.setTimeout(() => {
                showNext.value = false;
                index.value = wrap(index.value += 1);
            }, transition);
        }

        if (applicationStore.theme.showLoadingScreenHints.toLowerCase() !== "false") {
            window.setInterval(changeHint, delay);
        }

        return {
            applicationStore,
            hint,
            nextHint,
            showNext
        };
    }
});
</script>
