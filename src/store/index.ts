//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

import { store } from "quasar/wrappers";
import { InjectionKey } from "vue";
import {
    createStore,
    Store as VuexStore,
    useStore as vuexUseStore
} from "vuex";

import packageInfo from "../../package.json";

import { AccountModule, IAccountState } from "./account";
import { AudioModule, IAudioState } from "./audio";
import { MetaverseModule, IMetaverseState } from "./metaverse";
import { RendererModule, IRendererState } from "./renderer";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Log from "src/modules/debugging/log";

// import example from "./module-example"
// import { ExampleStateInterface } from "./module-example/state";

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export enum Mutations {
    MUTATE = "STATE_MUTATE"
}

// Payload passed to MUTATE
export interface MutatePayload {
    property: string,
    update: boolean,
    with: number | string | KeyedCollection
}

export interface IRootState {
    globalConsts: {
        APP_NAME: string,
        APP_VERSION: string,
        SAFETY_BEFORE_SESSION_TIMEOUT: number // If a token has 6 or less hours left on its life, refresh it.
    },
    debugging: KeyedCollection,
    notifications: KeyedCollection,
    dialog: {
        which: string;
        show: boolean;
    },
    error: {
        title: string,
        code: string,
        full: string
    },
    location: {
        current: string,
        state: string
    },
    account: IAccountState,
    renderer: IRendererState,
    metaverse: IMetaverseState,
    audio: IAudioState
}

// This store interface wrapper exists to add TS definitions of getters and mutators
// TODO: complete TS additions
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface VStore extends VuexStore<IRootState> {
}

export const Store = createStore<IRootState>({
    state: () => ({
        globalConsts: {
            APP_NAME: packageInfo.productName,
            APP_VERSION: packageInfo.version,
            SAFETY_BEFORE_SESSION_TIMEOUT: 21600 // If a token has 6 or less hours left on its life, refresh it.
        },
        debugging: {},
        notifications: {},
        error: {
            title: "",
            code: "",
            full: ""
        },
        dialog: {
            which: "NONE",
            show: false
        },
        location: {
            current: "",
            state: "Not Connected"
        },
        // This makes TypeScript happy and is filled by Vuex when modules are initialized
        account: {} as IAccountState,
        renderer: {} as IRendererState,
        metaverse: {} as IMetaverseState,
        audio: {} as IAudioState
    }),
    // by adding the modules here, Vuex will initalize them, link them
    //     into the event tree, and load the module name variable.
    modules: {
        account: AccountModule,
        renderer: RendererModule,
        metaverse: MetaverseModule,
        audio: AudioModule
    },
    mutations: {
        /**
         * Changes the value of state variable.
         * This is completely type unsafe and will create new properties
         * if there are any misspellings in the passed information.
         * TODO: figure out if this properly generates Vue update events.
         * @param state - the state block being updated
         * @param {MutatePlayload} - specification of the property to update. See
         *     MutatePayload for explanation of the fields.
         */
        [Mutations.MUTATE](state: IRootState, payload: MutatePayload) {
            // Create the target location to store the mutation
            let target = state as unknown as KeyedCollection;
            const segments = payload.property.split(".");
            // If there are multiple property parts, walk down until final one found
            while (segments.length > 1) {
                const seg = segments.shift();
                if (typeof seg === "string" && seg in target) {
                    if (!(seg in target)) {
                        // Assume that value is a KeyedCollection if it doesn't yet exist
                        target[seg] = {};
                    }
                    target = target[seg] as KeyedCollection;
                }
            }
            const prop = segments[0];
            // At this point, "target[prop]" addresses the value to be mutated

            if (target && prop) {
                // 'update' says to set with the fields in payload.with
                if (payload.update) {
                    if (payload["with"]) {
                        const propertiesToSet = payload["with"] as KeyedCollection;
                        Object.keys(propertiesToSet).forEach((withprop) => {
                            (target[prop] as KeyedCollection)[withprop] = propertiesToSet[withprop];
                        });
                    }
                } else {
                    // if not 'update', just set the value into the state target
                    target[prop] = payload["with"];
                }
            }

            /* original code
            let base = state;
            const segments = payload.property.split(".");
            while (segments.length > 1) {
                const segment = segments.shift();
                if (segment && !(segment in base)) {
                    base[segment] = {};
                }
                base = base[segment];
            }
            const prop = segments[0];

            if (!payload.update || !(prop in base)) {
                base[prop] = payload.with;
            } else {
                for (const item in payload.with) {
                    if (Object.prototype.hasOwnProperty.call(payload.with, item)) {
                        base[prop][item] = payload.with[item];
                    }
                }
            }
            */
        }

    },
    // enable strict mode (adds overhead!)
    // for dev mode and --debug builds only
    strict: Boolean(process.env.DEBUGGING)
}) as VStore;

export default store(function(/* { ssrContext } */) {
    return Store;
});

// This adds the "$store" to all the Vue components
declare module "@vue/runtime-core" {
    // provide typings for this.$store
    interface ComponentCustomProperties {
        $store: VStore,

        // mixins added by primary.ts
        checkNeedsTokenRefresh: () => boolean,
        attemptRefreshToken: () => Promise<void>,
        parseFromStorage: (arg0: string) => KeyedCollection,
        initializeAxios: () => void
    }
}

// provide typings for `useStore` helper
export const storeKey: InjectionKey<VuexStore<IRootState>> = Symbol("vuex-key");

export function useStore(): VStore {
    return vuexUseStore(storeKey);
}
