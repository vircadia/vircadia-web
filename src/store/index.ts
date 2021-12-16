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
import versionInfo from "@Base/../VERSION.json";
import { ScriptAvatar, Vec3, vec3, Vircadia, Uuid } from "@vircadia/web-sdk";

import { VVector3, VVector4 } from "@Modules/scene";

import { MetaverseMgr } from "@Modules/metaverse";

import { Metaverse, MetaverseState } from "@Base/modules/metaverse/metaverse";
import { Domain, ConnectionState } from "@Modules/domain/domain";
import { AssignmentClientState } from "@Modules/domain/client";
import { DomainAvatar } from "@Modules/domain/avatar";
import { AMessage } from "@Modules/domain/message";
import { onAccessTokenChangePayload, onAttributeChangePayload } from "@Modules/account";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Log from "@Modules/debugging/log";
import { toJSON } from "@Modules/debugging";

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
    MUTATE = "STATE_MUTATE",
    ADD_MESSAGE = "ADD_MESSAGE",
    UPDATE_AVATAR_VALUE = "UPDATE_AVATAR_VALUE"
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
/**
 * Payload passed to ADD_MESSAGE
 * @typedef {Object} AddMessagePayload
 * @property {AMessage} the message to be added to the message list
 * @property {?number} the maximum messages to keep in the list. If zero, list cleared otherwise oldest removed
 */
export interface AddMessagePayload {
    message: AMessage,
    maxMessages?: number
}

/**
 * Payload passed to UPDATE_AVATAR_VALUE
 * @typedef {Object} UpdateAvatarValuePayload
 * @property {Uuid} Id of the avatar to update
 * @property {string} name of the field to update
 * @property {string} string value to use if the destination is a string
 * @property {number} numeric value to use if the destination is numeric
 */
export interface UpdateAvatarValuePayload {
    sessionId: Uuid,
    field: string,
    value: number | string | boolean
}

export enum Actions {
    SET_METAVERSE_URL = "SET_METAVERSE_URL",
    SET_DOMAIN_URL = "SET_DOMAIN_URL",
    UPDATE_METAVERSE = "UPDATE_METAVERSE",
    UPDATE_DOMAIN = "UPDATE_DOMAIN",
    UPDATE_ACCOUNT_TOKEN = "UPDATE_ACCOUNT_TOKEN",
    UPDATE_ACCOUNT_INFO = "UPDATE_ACCOUNT_INFO",
    UPDATE_AVATAR_INFO = "UPDATE_AVATAR_INFO",
    RECEIVE_CHAT_MESSAGE = "RECEIVE_CHAT_MESSAGE"
}
export type SetMetaverseUrlPayload = string;
export type SetDomainUrlPayload = string;
export interface UpdateMetaversePayload {
    metaverse: Metaverse,
    newState: MetaverseState
}
export interface UpdateDomainPayload {
    domain: Domain,
    newState: ConnectionState,
    info: string
}
// For convience, the payloads are the same
export type UpdateAccountTokenPayload = onAccessTokenChangePayload;
export type UpdateAccountInfoPayload = onAttributeChangePayload;

export interface UpdateAvatarInfoPayload {
    domain: Domain,                         // the containing domain
    domainAvatar?: Nullable<DomainAvatar>,  // handle to avatar client
    avatarsInfo?: Map<Uuid, ScriptAvatar>,  // list of other avatar info
    position?: vec3                         // optional update of our ava pos
}

// Infomation kept about avatars also include information about our control of that representation
export interface AvatarInfo {
    sessionId: Uuid,        // session Id
    volume: number,         // audio volume setting (0..100)
    muted: boolean,         // whether audio from this avatar is muted
    isAdmin: boolean,       // whether this avatar is an admin in this context
    // information from ScriptAvatar
    isValid: boolean,
    displayName: string,
    position: vec3
}

/**
 * Properties in the root storage object
 * TODO: Eventually move these into modules
 */
export interface IRootState {
    globalConsts: {
        APP_NAME: string,
        APP_VERSION: string,
        APP_VERSION_TAG: string,
        SDK_VERSION_TAG: string,
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
    // Domain info. Updated when the Domain connection state changes
    domain: {
        connectionState: string,
        url: string
    },
    // Avatars in the domain info. Updated when collection of avatars changes
    avatars: {
        connectionState: string,
        count: number,
        avatarsInfo: Map<Uuid, AvatarInfo>
    },
    // Information about my avatar. Updated when avatar attributes change
    avatar: {
        displayName: string,
        position: vec3,
        location: string    // displayable, string form of position coordinates
    },
    // Chat information. Updated when the MessageClient connection state changes
    messages: {
        messages: AMessage[],
        nextMessageId: number,
    },
    // The audio connection
    audio: {
        inputsList: MediaDeviceInfo[],  // a list of the input devices from the browser
        outputsList: MediaDeviceInfo[]  // a list of the input devices from the browser
        user: {
            connected: boolean;             // 'true' if have audio input device
            hasInputAccess: boolean;        // mic toggle, 'true' if input is on
            muted: boolean;                 // sound from user to domain is muted
            awaitingCapturePermissions: boolean;    // waiting for user to allow access to input device
            currentInputDevice: Nullable<MediaDeviceInfo>;  // info on current selected device
            currentOutputDevice: Nullable<MediaDeviceInfo>;  // info on current selected device
            userInputStream: Nullable<MediaStream>,  // the user audio input stream
        }
    },
    // Information about the metaverse-server. Updated when connection state changes
    metaverse: {
        connectionState: string;
        name: string;
        nickname: string;
        server: string;
        iceServer: Nullable<string>;
        serverVersion: Nullable<string>;
    },
    // Information about metaverse account that is logged in.
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
    // Information from the underlying rendering system
    renderer: {
        focusSceneId: number,
        fps: number,
        cameraLocation: Nullable<VVector3>,
        cameraRotation: Nullable<VVector4>
    }
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
            APP_VERSION_TAG: versionInfo["version-tag"],
            SDK_VERSION_TAG: Vircadia.verboseVersion ?? "probably 0.0.4",
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
        domain: {
            connectionState: Domain.stateToString(ConnectionState.DISCONNECTED),
            url: ""
        },
        avatars: {
            connectionState: DomainAvatar.stateToString(AssignmentClientState.DISCONNECTED),
            count: 0,
            avatarsInfo: new Map<Uuid, AvatarInfo>()
        },
        avatar: {
            displayName: "",
            position: Vec3.ZERO,
            location: "0,0,0"
        },
        messages: {
            messages: [],
            nextMessageId: 22
        },
        // Information about the audio system
        audio: {
            inputsList: [],
            outputsList: [],
            user: {
                connected: false,
                hasInputAccess: false,
                muted: false,
                awaitingCapturePermissions: false,
                currentInputDevice: undefined,
                currentOutputDevice: undefined,
                userInputStream: undefined
            }
        },
        // Information about the metaverse-server we're connected to
        metaverse: {
            connectionState: "",
            name: "",
            nickname: "",
            server: "",
            iceServer: undefined,
            serverVersion: undefined
        },
        // Information about the logged in account. Refer to Account module
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
        // Information about the rendering system
        renderer: {
            focusSceneId: 0,
            fps: 1,
            cameraLocation: undefined,
            cameraRotation: undefined
        }
    }),
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
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                Log.debug(Log.types.OTHER, `MUTATE: ${toJSON(payload)}`);
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
                } else {
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
        },

        // Add a message to the list of messages.
        // Remove old messages of a limit is passed.
        [Mutations.ADD_MESSAGE](state: IRootState, payload: AddMessagePayload) {
            const msg = payload.message;
            // If the message doesn't have some unique identification, add it
            if (typeof msg.id === "undefined") {
                msg.id = state.messages.nextMessageId;
                state.messages.nextMessageId += 1;
            }

            state.messages.messages.push(payload.message);

            // If a maximum is specified, remove the old from the list
            if (typeof payload.maxMessages === "number") {
                while (state.messages.messages.length > payload.maxMessages) {
                    state.messages.messages.pop();
                }
            }
        },

        // Update an individual value for an individual avatar in the avatars.avatarsInfo array.
        // This is done this way since any modification to $store has to happen in mutations.
        // Note that this does presume that AvatarInfo is a simple KeyedCollection.
        [Mutations.UPDATE_AVATAR_VALUE](state: IRootState, payload: UpdateAvatarValuePayload) {
            const avaInfo = state.avatars.avatarsInfo.get(payload.sessionId);
            if (avaInfo) {
                const conv = avaInfo as unknown as KeyedCollection;
                if (typeof conv[payload.field] !== typeof payload.value) {
                    Log.error(Log.types.OTHER, `UPDATE_AVATAR_VALUE: types don't match.`);
                    Log.error(Log.types.OTHER, `     id=${avaInfo.sessionId.stringify()}, field=${payload.field}`);
                }
                conv[payload.field] = payload.value;
            }
        }

    },
    actions: {
        /**
         * Called when metaverse-server information changes and the UI should be updated
         * @param {ActionContext} pContext
         * @param {UpdateMetaversePayload} pPayload metaverse-server attributes to update
         */
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
            pContext.commit(Mutations.MUTATE, {
                property: "domain",
                with: {
                    connectionState: Domain.stateToString(pPayload.newState),
                    url: pPayload.domain.DomainUrl
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
        // Update the information about the avatars in the scene.
        // This is passed a map of all the avatars and their information and this
        //     code updates the list if avatars in $store.
        // The payload can contain several optional pieces:
        //   domainAvatar: info about my avatar so update position, names, etc
        //   position: just update the position of my avatar
        //   avatarsInfo: information about all the avatars so update the list of avatars and their info
        // eslint-disable-next-line @typescript-eslint/require-await
        async [Actions.UPDATE_AVATAR_INFO](pContext: ActionContext<IRootState, IRootState>,
            pPayload: UpdateAvatarInfoPayload): Promise<void> {

            Log.debug(Log.types.OTHER, `StoreAction.UpdateAvatarInfo`);

            const domainLoc = pPayload.domain.DomainClient?.location ?? "Unconnected";
            // If we have information on my avatar, update same
            if (pPayload.domainAvatar) {
                const myAvaInfo = pPayload.domainAvatar.MyAvatar;
                if (myAvaInfo) {
                    pContext.commit(Mutations.MUTATE, {
                        property: "avatar",
                        with: {
                            displayName: myAvaInfo.displayName ? myAvaInfo.displayName : myAvaInfo.sessionDisplayName,
                            position: myAvaInfo?.position,
                            location: `${domainLoc}/${DomainAvatar.positionAsString(myAvaInfo?.position)}`
                        }
                    });

                } else {
                    // If no information on my avatar, display defaults
                    pContext.commit(Mutations.MUTATE, {
                        property: "avatar",
                        with: {
                            displayName: "none",
                            position: Vec3.ZERO,
                            location: `${domainLoc}/${DomainAvatar.positionAsString(Vec3.ZERO)}`
                        }
                    });
                }
            }
            // An optional update to just the avatar's position
            if (pPayload.position) {
                pContext.commit(Mutations.MUTATE, {
                    property: "avatar",
                    with: {
                        position: pPayload.position,
                        location: `${domainLoc}/${DomainAvatar.positionAsString(pPayload.position)}`
                    }
                });
            }
            // If information on all avatars, update info on the others.
            // This rebuilds the map of avatars to make sure the list is correct
            if (pPayload.avatarsInfo) {
                const prevList = this.state.avatars.avatarsInfo;
                const newList = new Map<Uuid, AvatarInfo>();
                pPayload.avatarsInfo.forEach((v, k) => {
                    const inPrev = prevList.get(k);
                    if (inPrev) {
                        // clone previous entry so setting pos and displayName isn't changing $store
                        const inPrevC = { ...inPrev };
                        // Update previous values since they might have changed
                        inPrevC.position = v.position;
                        inPrevC.displayName = v.displayName ? v.displayName : v.sessionDisplayName;
                        newList.set(k, inPrevC);
                    } else {
                        newList.set(k, {
                            sessionId: k,
                            volume: 50,
                            muted: false,
                            isAdmin: false,
                            isValid: v.isValid,
                            displayName: v.displayName ? v.displayName : v.sessionDisplayName,
                            position: v.position
                        });
                    }
                });
                pContext.commit(Mutations.MUTATE, {
                    property: "avatars",
                    with: {
                        connectionState: DomainAvatar.stateToString(
                            pPayload.domainAvatar?.Mixer?.state ?? AssignmentClientState.DISCONNECTED),
                        avatarsInfo: newList,
                        count: newList.size
                    }
                });
            }
        },
        // A message was received. Link it into the list of messages
        [Actions.RECEIVE_CHAT_MESSAGE](pContext: ActionContext<IRootState, IRootState>, pMsg: AMessage): void {
            pContext.commit(Mutations.ADD_MESSAGE, {
                message: pMsg,
                maxMessages: 100
            });
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
