import { store } from "quasar/wrappers";
import Vue, { InjectionKey } from "vue";
import Vuex, {
    createStore,
    StoreOptions,
    Store as VuexStore,
    useStore as vuexUseStore
} from "vuex";

import packageInfo from "../../package.json";

import AccountState from "./account";

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
    error: {
        title: string,
        code: string,
        full: string
    },
    location: {
        current: string,
        state: string
    }
}

export default store(function (/* { ssrContext } */) {
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
            location: {
                current: "",
                state: "Not Connected"
            }
        }),
        modules: {
            account: AccountState
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
