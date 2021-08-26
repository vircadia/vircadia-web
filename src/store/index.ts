//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

import { store } from "quasar/wrappers";
import { Entities } from "src/modules/entities/entities";
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

/* declaration moved to store.d.ts so TypeScript finds it properly
// provide typings for `this.$store`
declare module "@vue/runtime-core" {
    interface ComponentCustomProperties {
        $store: VuexStore<StateInterface>
    }
}
*/

export interface IRootState {
    globalConsts: {
        APP_NAME: string,
        APP_VERSION: string,
        SAFETY_BEFORE_SESSION_TIMEOUT: number // If a token has 6 or less hours left on its life, refresh it.
    },
    debugging: KeyedCollection,
    notifications: KeyedCollection,
    renderer: {
        canvases: [
            {
                canvas: string
            }
        ]
    },
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
    audio: IAudioState,
    metaverse: IMetaverseState,
    entities: Entities,
    account: IAccountState
}

export default store(function(/* { ssrContext } */) {
    const Store = createStore<IRootState>({
        state: () => ({
            globalConsts: {
                APP_NAME: packageInfo.productName,
                APP_VERSION: packageInfo.version,
                SAFETY_BEFORE_SESSION_TIMEOUT: 21600 // If a token has 6 or less hours left on its life, refresh it.
            },
            debugging: {},
            notifications: {},
            renderer: {
                canvases: [
                    {
                        canvas: ""
                    }
                ]
            },
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
            audio: {} as IAudioState,
            entities: new Entities(),
            metaverse: {} as IMetaverseState,
            account: {} as IAccountState
        }),
        // by adding the modules here, Vuex will initalize them, link them
        //     into the event tree, and load the module name variable.
        modules: {
            account: AccountModule,
            metaverse: MetaverseModule,
            audio: AudioModule
        },
        // enable strict mode (adds overhead!)
        // for dev mode and --debug builds only
        strict: Boolean(process.env.DEBUGGING)
    });

    return Store;
});

// provide typings for `useStore` helper
export const storeKey: InjectionKey<VuexStore<IRootState>> = Symbol("vuex-key");

export function useStore(): VuexStore<IRootState> {
    return vuexUseStore(storeKey);
}
