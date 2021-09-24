//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

import { store } from "quasar/wrappers";
import { InjectionKey } from "vue";
import {
    ActionContext,
    createStore,
    Store as VuexStore,
    useStore as vuexUseStore
} from "vuex";

import packageInfo from "@Base/../package.json";

import { AudioModule, IAudioState } from "@Store/audio";

import { VVector3, VVector4 } from "@Modules/render";

import { MetaverseMgr } from "@Modules/metaverse";

import { Metaverse } from "@Base/modules/metaverse/metaverse";
import { Domain } from "@Modules/domain/domain";
import { onAccessTokenChangePayload, onAttributeChangePayload } from "@Modules/account";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Log from "@Modules/debugging/log";

/**
 * $store of shared state used by the Vue components. The Store that is created
 * here is available to the components as "$store" and to the scripts in the
 * components as "this.$store".
 *
 * All the primitive data variables made available in the "state:" section are
 * reactive in that they will cause update to the viewed DOM elements when
 * their values change. This means the values can be read but they MUST
 * be changed ONLY via a "mutations:" defined function.
 */

/**
 * Names of mutations to be used by callers
 */
export enum Mutations {
    MUTATE = "STATE_MUTATE"
}
/**
 * Payload passed to MUTATE
 * Either value is given for a property or a set of sub-values is specified to set
 * so either "value" or "with" is specified in a single call.
 * @typedef {Object} MutatePayload
 * @property {string} target property to mutate. May contain dots to specify sub-properties
 * @property {?(number|string|KeyedCollection)} value to set in property
 * @property {?KeyedCollection} with a collection of sub-properties to set in the target property
 */
export interface MutatePayload {
    property: string,
    value?: number | string | KeyedCollection,
    with?: KeyedCollection
}

export enum Actions {
    SET_METAVERSE_URL = "SET_METAVERSE_URL",
    SET_DOMAIN_URL = "SET_DOMAIN_URL",
    UPDATE_METAVERSE = "UPDATE_METAVERSE",
    UPDATE_DOMAIN = "UPDATE_DOMAIN",
    UPDATE_ACCOUNT_TOKEN = "UPDATE_ACCOUNT_TOKEN",
    UPDATE_ACCOUNT_INFO = "UPDATE_ACCOUNT_INFO"
}
export type SetMetaverseUrlPayload = string;
export type SetDomainUrlPayload = string;
export interface UpdateMetaversePayload {
    metaverse: Metaverse,
    newState: string
}
export interface UpdateDomainPayload {
    domain: Domain,
    newState: string,
    info: string
}
// For convience, the payloads are the same
export type UpdateAccountTokenPayload = onAccessTokenChangePayload;
export type UpdateAccountInfoPayload = onAttributeChangePayload;

/**
 * Properties in the root storage object
 * TODO: Eventually move these into modules
 */
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
    domain: {
        connectionState: string,
        url: string
    },
    metaverse: {
        name: string;
        nickname: string;
        server: string;
        connectionState: string;
        iceServer: string | undefined ;
        serverVersion: string | undefined ;
    },
    account: {
        username: string;
        isLoggedIn: boolean;
        // Token data
        accessToken: string;
        tokenType: string;
        scope: string;
        // Options
        isAdmin: boolean;
        useAsAdmin: boolean;
        // Profile
        images: {
            hero?: string;
            tiny?: string;
            thumbnail?: string;
        }
    },
    renderer: {
        focusSceneId: number,
        fps: number,
        cameraLocation: Nullable<VVector3>,
        cameraRotation: Nullable<VVector4>
    },
    // This makes TypeScript happy and is filled by Vuex when modules are initialized
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
        domain: {
            connectionState: "Disconnected",
            url: ""
        },
        metaverse: {
            name: "",
            nickname: "",
            server: "",
            connectionState: "",
            iceServer: undefined,
            serverVersion: undefined
        },
        account: {
            username: "Guest",
            isLoggedIn: false,
            accessToken: "UNKNOWN",
            tokenType: "Bearer",
            scope: "UNKNOWN",
            isAdmin: false,
            useAsAdmin: false,
            images: {}
        },
        renderer: {
            focusSceneId: 0,
            fps: 1,
            cameraLocation: undefined,
            cameraRotation: undefined
        },
        // This makes TypeScript happy and is filled by Vuex when modules are initialized
        audio: {} as IAudioState
    }),
    // by adding the modules here, Vuex will initalize them, link them
    //     into the event tree, and load the module name variable.
    modules: {
        audio: AudioModule
    },
    mutations: {
        /**
         * Changes the value of state variables.
         * @description
         * This expects the target state to be "well formed" in that it is
         * a tree of KeyedCollection's.
         *
         * This is completely type unsafe and expects the values passed to
         * be the correct type. The destination parameter must exist or an
         * error message is output.
         *
         * There are two forms: one that sets one parameter to a value and
         * another that sets several sub-parameters to values.
         * @example
         *       $store.commit(Mutation.MUTATE, {
         *          property: renderer.focusSceneId,
         *          value: 3
         *       });
         * @example
         *       $store.commit(Mutation.MUTATE, {
         *          property: renderer,
         *          with: {
         *              focusSceneId: 2,
         *              fps: 20
         *          }
         *       });
         *
         * As shown in the above example, the passed property name can contain dots
         * to allow sub-objects to be addressed.
         *
         * @param state - the state block being updated (supplied by Vuex)
         * @param {MutatePlayload} - specification of the property to update. See
         *     MutatePayload for explanation of the fields.
         */
        [Mutations.MUTATE](state: IRootState, payload: MutatePayload) {
            // DEBUG DEBUG DEBUG
            // This supresses the periodic renderer stat update from being output on the console
            if (payload && payload.property && payload.property !== "renderer") {
                Log.debug(Log.types.OTHER, `MUTATE: ${JSON.stringify(payload)}`);
            }
            // END DEBUG DEBUG DEBUG
            // Create the target location to store the mutation
            let target = state as unknown as KeyedCollection;
            const segments = payload.property.split(".");
            // If there are multiple property parts, walk down until final one found
            while (segments.length > 1) {
                const seg = segments.shift();
                if (seg) {
                    if (seg in target) {
                        // recast target as a collection the next level down
                        target = target[seg] as KeyedCollection;
                    } else {
                        // The property is not in the target. Someone referenced something that does not exist
                        Log.error(Log.types.OTHER, `State.MUTATE: non-existant target segment "${seg}"`);
                        Log.error(Log.types.OTHER, `State.MUTATE:     payload=${JSON.stringify(payload)}`);
                    }
                }
            }
            const prop = segments[0];
            // At this point, "target[prop]" addresses the value to be mutated

            if (target && prop) {
                // if given a "with", there are multiple sub-properties to set
                if (payload["with"]) {
                    const propertiesToSet = payload["with"];
                    Object.keys(propertiesToSet).forEach((withprop) => {
                        // Note that this does a straight assignment so the source type
                        //     had better be the type the destination wants.
                        // TODO: consider type checking if in development mode
                        (target[prop] as KeyedCollection)[withprop] = propertiesToSet[withprop];
                    });
                } else if (payload.value) {
                    // If a single value is given, just set that.
                    // Same note as above about type assignment and potential checking
                    target[prop] = payload.value;
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
    actions: {
        // eslint-disable-next-line @typescript-eslint/require-await
        async [Actions.UPDATE_METAVERSE](pContext: ActionContext<IRootState, IRootState>,
            pPayload: UpdateMetaversePayload): Promise<void> {
            const metaverse = pPayload.metaverse;
            pContext.commit(Mutations.MUTATE, {
                property: "metaverse",
                with: {
                    name: metaverse.MetaverseName,
                    nickname: metaverse.MetaverseNickname,
                    connectionState: pPayload.newState,
                    server: metaverse.MetaverseUrl,
                    iceServer: metaverse.IceServer,
                    serverVersion: metaverse.ServerVersion
                }
            });
        },
        // eslint-disable-next-line @typescript-eslint/require-await
        async [Actions.UPDATE_DOMAIN](pContext: ActionContext<IRootState, IRootState>,
            pPayload: UpdateDomainPayload): Promise<void> {
            const domain = pPayload.domain;
            pContext.commit(Mutations.MUTATE, {
                property: "domain",
                with: {
                    connectionState: pPayload.newState,
                    url: domain.DomainUrl
                }
            });
        },
        // Handle any state processing when account attributes change
        // eslint-disable-next-line @typescript-eslint/require-await
        async [Actions.UPDATE_ACCOUNT_INFO](pContext: ActionContext<IRootState, IRootState>,
            pPayload: UpdateAccountInfoPayload): Promise<void> {

            Log.debug(Log.types.OTHER, `StoreAction.UpdateAccountInfo`);
            const info = pPayload.accountInfo;
            pContext.commit(Mutations.MUTATE, {
                property: "account",
                with: {
                    username: info.username,
                    isLoggedIn: pPayload.isLoggedIn,
                    accessToken: pPayload.accessToken,
                    tokenType: pPayload.accessTokenType,
                    scope: pPayload.scope,
                    isAdmin: pPayload.isAdmin
                }
            });
            if (info.images) {
                Store.commit(Mutations.MUTATE, {
                    property: "account.images",
                    value: info.images
                });
            } else {
                Store.commit(Mutations.MUTATE, {
                    property: "account.images",
                    value: {}
                });
            }
        },
        // Example action. Any script should be calling the Metavsere component directly
        async [Actions.SET_METAVERSE_URL](pContext: ActionContext<IRootState, IRootState>, pUrl: string): Promise<void> {
            await MetaverseMgr.ActiveMetaverse.setMetaverseUrl(pUrl);
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
        $store: VStore
    }
}

// provide typings for `useStore` helper
export const storeKey: InjectionKey<VuexStore<IRootState>> = Symbol("vuex-key");

export function useStore(): VStore {
    return vuexUseStore(storeKey);
}
