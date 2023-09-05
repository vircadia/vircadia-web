<!--
//  FirstTimeSetup.vue
//
//  Created by Giga on Oct 15th, 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
-->

<style lang="scss" scoped>
#firstTimeSetup {
    overflow: hidden;

    .initialWelcome {
        display: flex;
        flex-flow: column nowrap;
        justify-content: center;
        align-items: center;
        width: min(100%, 800px);
        padding: 0px 10px;
        transition: 0.2s ease opacity;

        h1 {
            font-size: 4rem;
            text-align: center;

            span {
                display: inline;
                color: transparent;
                background-image: linear-gradient(90deg, var(--q-primary), var(--q-secondary), var(--q-primary));
                background-size: 200% 100%;
                -webkit-background-clip: text;
                background-clip: text;
                animation: backgroundRotate 5s linear infinite;

                @keyframes backgroundRotate {
                    0%   {background-position: 0% 0%;}
                    100% {background-position: -200% 0%;}
                }
            }
        }
    }

    .colorSplash {
        position: absolute;
        display: block;
        width: 200vmax;
        height: 10vh;
        background-color: currentColor;
        box-shadow: 0px 0px 20px -2px currentColor;
        opacity: 1;
        transition: 0.7s ease height, 0.5s ease opacity;
        user-select: none;
        pointer-events: none;
    }
    .colorSplash.top {
        top: 0;
        left: -50vmax;
        color: var(--q-primary);
        transform: rotate(-10deg);
        transform-origin: 50vmax 0%;
    }
    .colorSplash.bottom {
        right: -50vmax;
        bottom: 0;
        color: var(--q-secondary);
        transform: rotate(-10deg);
        transform-origin: calc(100% - 50vmax) 100%;
    }

    .backButton {
        top: 0;
        left: 0;
    }

    @media only screen and (max-width: 600px) {
        .backButton {
            display: none;
        }
    }

    main {
        display: flex;
        height: 100%;
        overflow-x: hidden;
        overflow-y: auto;
    }

    .wizardCard {
        width: clamp(200px, 100%, 650px);
        margin: auto;

        &::before {
            content: '';
            position: absolute;
            z-index: -1;
            inset: -3px;
            display: block;
            background: linear-gradient(135deg, var(--q-primary), var(--q-secondary));
            border-radius: 5px;
            mask-image: radial-gradient(circle at center, #000 10%, transparent 70%);
            mask-position: -50vmax -50vmax;
            mask-repeat: no-repeat;
            mask-size: 50vmax 50vmax;
            animation: ripple 1.5s linear forwards 0.1s;

            @keyframes ripple {
                0%   {mask-position: -50vmax -50vmax;}
                100% {mask-position: 50vmax 50vmax;}
            }
        }
    }

    /* Main mobile breakpoint */
    @media only screen and (max-width: 450px) {
        .wizardCard {
            min-height: 100%;
        }
        .stepInner {
            padding-bottom: 50px;
        }
        .stepNavigation {
            position: fixed; /* sticky doesn't work here because of some quasar classes. This is a workaround */
            bottom: 0px;
            left: 0px;
            width: calc(100% - 18px);
            padding: 10px 15px;
            background: inherit;
        }
    }

    .selectedAvatar {
        background-color: #fff1;
        border-radius: 5px;
    }

    .selectedPlace {
        background-color: #fff2;
        border-radius: 5px;
    }

    .exploreItem{
        background-size: cover;
        background-position: center;
        overflow: hidden;
    }
    .exploreItemBackground{
        position: absolute;
        left: 0px;
        top: 0px;
        width: 100%;
        height: 100%;
        backdrop-filter: blur(3px);
        z-index: 0;
    }
    .exploreLabel{
        width: fit-content;
        padding: 1px 6px;
        border-radius: 4px;
    }

    .fadeIn {
        animation: fadeIn 0.5s ease forwards;
    }

    @keyframes fadeIn {
        0%   {opacity: 0;}
        100% {opacity: 1;}
    }
}
</style>

<template>
    <div id="firstTimeSetup" class="full-height fullscreen" :style="{background: backgroundStyle}">
        <span
            class="colorSplash top"
            :style="{
                height: transition ? '100vh' : '10vh',
                opacity: transition ? '0' : '1'
            }"
        ></span>
        <span
            class="colorSplash bottom"
            :style="{
                height: transition ? '60vh' : '10vh',
                opacity: transition ? '0' : '1'
            }"
        ></span>
        <div v-if="showInitialWelcome" class="initialWelcome fixed-center" :style="{opacity: transition ? '0' : '1'}">
            <h1 class="q-mb-sm">
                {{ applicationStore.firstTimeWizard.welcomeText }} <span>{{ applicationStore.firstTimeWizard.title }}</span>
            </h1>
            <p class="text-subtitle1 text-italic q-mb-xl">{{ applicationStore.firstTimeWizard.tagline }}</p>
            <q-btn
                color="primary"
                @click="transitionToSteps()"
            >
                {{ applicationStore.firstTimeWizard.buttonText }}
            </q-btn>
            <q-btn
                flat
                color="primary"
                class="q-mt-sm"
                @click="completeSetup()"
            >Skip</q-btn>
        </div>
        <main class="fadeIn" v-else>
            <q-btn
                flat
                round
                fab
                icon="arrow_back"
                class="backButton absolute q-mt-sm q-ml-sm"
                @click="transitionToStart()"
            />
            <q-card class="wizardCard">
                <q-stepper
                    v-model="step"
                    header-nav
                    alternative-labels
                    ref="stepper"
                    color="primary"
                    animated
                >
                    <q-step
                        :name="1"
                        title="Your Avatar"
                        icon="person"
                        active-icon="person"
                        active-color="accent"
                        :done="step > 1"
                        done-color="primary"
                        :header-nav="step > 1"
                        class="stepInner"
                    >
                        <p class="text-h6">
                            Display Name<br/>
                        </p>
                        <q-input
                            v-model="userStore.avatar.displayName"
                            outlined
                        >
                            <template v-slot:append>
                                <q-btn
                                    flat
                                    dense
                                    round
                                    icon="shuffle"
                                    title="Randomize"
                                    @click.stop="generateRandomName()"
                                >
                                <q-tooltip>
                                    Randomize
                                </q-tooltip>
                                </q-btn>
                            </template>
                        </q-input>

                        <br>

                        <template v-if="Object.entries(userStore.avatar.models).length > 0">
                            <p class="text-h6">
                                Avatar<br/>
                            </p>
                            <q-scroll-area style="height: 12rem;">
                                <q-list>
                                    <q-item
                                        v-for="(avatar, id) in userStore.avatar.models"
                                        :key="id"
                                        class="q-mb-sm"
                                        clickable
                                        v-ripple
                                        :active="userStore.avatar.activeModel === id"
                                        active-class="selectedAvatar"
                                        @click="selectAvatar(id.toString())"
                                    >
                                        <q-item-section avatar>
                                            <q-img
                                                v-if="!!avatar.image"
                                                :src="avatar.image"
                                                :draggable="false"
                                                ratio="1"
                                                style="border-radius: 7px;"
                                            />
                                            <q-icon
                                                v-else
                                                name="mood"
                                                size="lg"
                                            ></q-icon>
                                        </q-item-section>
                                        <q-item-section>
                                            {{ avatar.name }}
                                        </q-item-section>
                                    </q-item>
                                </q-list>
                            </q-scroll-area>
                        </template>
                        <q-separator spaced />
                        <p class="text-caption">
                            Don't worry, you can change your name and avatar later.
                        </p>
                        <q-stepper-navigation
                            class="flex stepNavigation"
                            :style="{ background: $q.dark.isActive ? 'var(--q-dark)' : '#fff' }"
                        >
                            <q-space />
                            <q-btn
                                color="primary"
                                label="Continue"
                                @click="() => { ($refs as ComponentTemplateRefs).stepper?.next(); }"
                            />
                        </q-stepper-navigation>
                    </q-step>

                    <q-step
                        :name="2"
                        title="Audio"
                        icon="volume_up"
                        active-icon="volume_up"
                        active-color="accent"
                        :done="step > 2"
                        done-color="primary"
                        :header-nav="step > 2"
                        class="stepInner"
                    >
                        <div class="row">
                            <q-icon name="mic" size="sm" class="q-mr-md" />
                            <p>Input</p>
                        </div>
                        <q-separator class="q-mb-sm" />
                        <p
                            v-if="!applicationStore.audio.user.hasInputAccess"
                            class="text-subtitle1 text-grey text-center"
                        >
                            Please grant mic access to the app in order to speak.
                        </p>
                        <q-scroll-area v-else style="height: 10rem;">
                            <q-list>
                                <div v-for="input in applicationStore.audio.inputsList" :key="input.deviceId">
                                    <q-radio
                                        :label="input.label"
                                        :val="input.label"
                                        color="primary"
                                        v-model="AudioIO.selectedInput"
                                        @click="AudioIO.requestInputAccess(input.deviceId)"
                                    />
                                </div>
                            </q-list>
                        </q-scroll-area>
                        <br>
                        <br>

                        <div class="row">
                            <q-icon name="volume_up" size="sm" class="q-mr-md" />
                            <p>Output</p>
                        </div>
                        <q-separator class="q-mb-sm" />
                        <q-scroll-area style="height: 10rem;">
                            <q-list>
                                <div v-for="output in applicationStore.audio.outputsList" :key="output.deviceId">
                                    <q-radio
                                        :label="output.label"
                                        :val="output.label"
                                        color="primary"
                                        v-model="AudioIO.selectedOutput"
                                        @click="AudioIO.requestOutputAccess(output.deviceId)"
                                    />
                                </div>
                            </q-list>
                        </q-scroll-area>
                        <br>

                        <q-stepper-navigation
                            class="flex stepNavigation"
                            :style="{ background: $q.dark.isActive ? 'var(--q-dark)' : '#fff' }"
                        >
                            <q-btn flat @click="() => { ($refs as ComponentTemplateRefs).stepper?.previous() }" color="primary" label="Back" class="q-ml-sm" />
                            <q-space />
                            <q-btn @click="() => { ($refs as ComponentTemplateRefs).stepper?.next() }" color="primary" label="Continue" />
                        </q-stepper-navigation>
                    </q-step>

                    <q-step
                        :name="3"
                        title="Explore"
                        icon="travel_explore"
                        active-icon="travel_explore"
                        active-color="accent"
                        done-color="primary"
                        :header-nav="step > 3"
                        :disable="hasLocationPending"
                        class="stepInner"
                    >
                        <p v-if="placesList.length > 0">Select a world</p>
                        <p v-else class="text-center">Oops! We couldn't find any worlds at the moment.</p>
                        <q-scroll-area style="height: 12rem;">
                            <q-list v-if="placesList.length > 0">
                                <q-item
                                    v-for="place in sortedPlaces"
                                    :key="place.placeId"
                                    clickable
                                    v-ripple
                                    class="exploreItem"
                                    :style="{
                                        backgroundImage: place.thumbnail ? `url(${place.thumbnail})` : ''
                                    }"
                                    :active="selectedPlace.placeId === place.placeId"
                                    active-class="selectedPlace"
                                    @click="selectedPlace = place"
                                >
                                    <div class="exploreItemBackground"></div>
                                    <q-item-section top>
                                        <q-item-label
                                            class="exploreLabel text-no-wrap overflow-hidden"
                                            :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'"
                                        >
                                            {{ place.name }}
                                        </q-item-label>
                                        <q-item-label
                                            caption
                                            class="exploreLabel text-no-wrap overflow-hidden"
                                            :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'"
                                            :title="place.description"
                                        >
                                            {{ place.description.substring(0, 30) }}
                                            {{ place.description.length > 30 ? '...' : '' }}
                                        </q-item-label>
                                    </q-item-section>
                                    <q-item-section side top>
                                        <q-badge color="white" text-color="black">
                                            {{ place.currentAttendance }}
                                            <q-icon
                                                name="people"
                                                size="14px"
                                                class="q-ml-xs"
                                            />
                                        </q-badge>
                                    </q-item-section>
                                </q-item>
                            </q-list>
                        </q-scroll-area>

                        <q-stepper-navigation
                            class="flex stepNavigation"
                            :style="{ background: $q.dark.isActive ? 'var(--q-dark)' : '#fff' }"
                        >
                            <q-btn flat @click="() => { ($refs as ComponentTemplateRefs).stepper?.previous() }" color="primary" label="Back" class="q-ml-sm" />
                            <q-space />
                            <q-btn color="primary" @click="() => { ($refs as ComponentTemplateRefs).stepper?.next() }" label="Next" />
                        </q-stepper-navigation>
                    </q-step>
                    <q-step
                        :name="4"
                        title="Complete"
                        icon="done"
                        active-icon="done"
                        active-color="accent"
                        done-color="primary"
                        :header-nav="true"
                        class="stepInner"
                    >
                        <div class="text-center">
                            <h4 class="q-mb-sm">
                                Good to go!
                            </h4>
                            <p class="text-subtitle1 text-italic q-mb-xl">You can change these settings later.</p>
                        </div>

                        <q-stepper-navigation
                            class="flex stepNavigation"
                            :style="{ background: $q.dark.isActive ? 'var(--q-dark)' : '#fff' }"
                        >
                            <q-btn flat @click="() => { ($refs as ComponentTemplateRefs).stepper?.previous() }" color="primary" label="Back" class="q-ml-sm" />
                            <q-space />
                            <q-btn color="primary" @click="() => { completeSetup() }" label="Finish" />
                        </q-stepper-navigation>
                    </q-step>
                </q-stepper>
            </q-card>
        </main>
    </div>
</template>

<script lang="ts" setup>
import { applicationStore, userStore } from "@Stores/index";
import { AudioIO } from "@Modules/ui/audioIO";
import type { QStepper } from "quasar";

type ComponentTemplateRefs = {
    stepper: typeof QStepper.methods
};
</script>

<script lang="ts">
import { defineComponent } from "vue";
import { uniqueNamesGenerator, adjectives, colors, animals } from "unique-names-generator";
import { AvatarStoreInterface } from "@Modules/avatar/StoreInterface";
import { Utility } from "@Modules/utility";
import { API } from "@Modules/metaverse/API";
import type { PlaceEntry } from "@Modules/metaverse/APIPlaces";

export default defineComponent({
    name: "FirstTimeSetup",

    data() {
        return {
            showInitialWelcome: true,
            transition: false,
            step: 1,
            AvatarStoreInterface,
            placesList: new Array<PlaceEntry>(),
            selectedPlace: {} as PlaceEntry
        };
    },

    computed: {
        /**
         * Style the background of the page based on the Theme config.
         */
        backgroundStyle(): string {
            if (applicationStore.theme.globalStyle === "none" || this.showInitialWelcome) {
                return this.$q.dark.isActive ? "#121212" : "#ffffff";
            }
            const opacities = {
                "aero": "5c",
                "mica": "30"
            };
            if (applicationStore.theme.windowStyle === "none") {
                return "unset";
            }
            const gradients = {
                "gradient-top": "circle at 50% 0%",
                "gradient-right": "circle at 100% 50%",
                "gradient-bottom": "circle at 50% 100%",
                "gradient-left": "circle at 0% 50%"
            };
            const gradient = gradients[applicationStore.theme.windowStyle];
            const primary = applicationStore.theme.colors.primary;
            const secondary = applicationStore.theme.colors.secondary;
            const end = this.$q.dark.isActive ? "#121212" : "#ffffff";
            const opacity = opacities[applicationStore.theme.globalStyle];
            return `radial-gradient(${gradient}, ${secondary}${opacity} 15%, ${primary}${opacity} 40%, ${end}${opacity} 95%)`;
        },
        /**
         * Sort the list of places alphabetically and by attendance.
         */
        sortedPlaces(): PlaceEntry[] {
            return this.placesList.sort((a, b) => {
                if (a.currentAttendance > b.currentAttendance) {
                    return -1;
                }
                if (a.currentAttendance < b.currentAttendance) {
                    return 1;
                }
                if (a.name.toLowerCase() < b.name.toLowerCase()) {
                    return -1;
                }
                if (a.name.toLowerCase() > b.name.toLowerCase()) {
                    return 1;
                }
                return 0;
            });
        },
        /**
         * `true` if the wizard should redirec to a specific loaction once complete. `false` if no location was specified beforehand.
         */
        hasLocationPending(): boolean {
            return Boolean(applicationStore.firstTimeWizard.pendingLocation);
        }
    },
    watch: {
        step(newValue) {
            // Wait until the first step is complete before asking for mic permission.
            // This is less spooky than requesting mic access as soon at the webpage is loaded.
            if (newValue === 2) {
                void AudioIO.requestInputAccess();
            }
        }
    },
    methods: {
        /**
         * Play the animation transitioning from the landing to the setup wizard.
         */
        transitionToSteps(): void {
            const second = 1000;
            const transitionTime = parseFloat(
                window.getComputedStyle(document.querySelector("#firstTimeSetup .colorSplash") as HTMLDivElement)
                    .getPropertyValue("transition")
                    .split(" ")[1]
            ) / 2 * second;

            this.transition = true;

            window.setTimeout(() => {
                this.showInitialWelcome = false;
            }, transitionTime);
        },
        /**
         * Play the animation transitioning from the setup wizard back to the landing.
         */
        transitionToStart(): void {
            this.transition = false;
            this.showInitialWelcome = true;
            this.step = 1;
        },
        /**
         * Generate a random display name for the player if they do not want to use their own.
         */
        generateRandomName(): void {
            userStore.avatar.displayName = uniqueNamesGenerator({
                dictionaries: [adjectives, colors, animals],
                separator: " ",
                length: 3,
                style: "capital"
            });
        },
        /**
         * Select an avatar model to equip.
         * @param modelId The ID of the model to equip.
         */
        selectAvatar(modelId: string): void {
            if (modelId in userStore.avatar.models) {
                AvatarStoreInterface.setActiveModel(modelId);
            }
        },
        /**
         * Connect to the Metaverse server and fetch the list of available places.
         */
        async loadPlaces(): Promise<void> {
            await Utility.metaverseConnectionSetup(applicationStore.defaultConnectionConfig.DEFAULT_METAVERSE_URL ?? "");
            this.placesList = await API.getActivePlaceList();
        },
        /**
         * Register the first-time-setup process as complete, and redirect to any pending location.
         */
        completeSetup(): void {
            window.localStorage.setItem("hasCompletedSetup", "true");
            if (this.hasLocationPending) {
                void this.$router.push({ path: applicationStore.firstTimeWizard.pendingLocation });
            } else {
                void this.$router.push({ name: "Primary" });
            }
        }
    },
    created() {
        void this.loadPlaces();
    },
    beforeMount(): void {
        // Ensure that Quasar's global color variables are in sync with the Store's theme colors.
        document.documentElement.style.setProperty("--q-primary", applicationStore.theme.colors.primary ?? null);
        document.documentElement.style.setProperty("--q-secondary", applicationStore.theme.colors.secondary ?? null);
        document.documentElement.style.setProperty("--q-accent", applicationStore.theme.colors.accent ?? null);
    },
    mounted(): void {
        document.addEventListener("keydown", (event: KeyboardEvent) => {
            if (event.key === "Enter") {
                this.transitionToSteps();
            }
            if (event.key === "Escape") {
                this.transitionToStart();
            }
        });
    }
});
</script>
