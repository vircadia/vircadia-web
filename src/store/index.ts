//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
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
import { defaultActiveAvatarModel, defaultAvatarModels } from "@Modules/avatar/DefaultModels";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Log from "@Modules/debugging/log";
import { AvatarEntryMap } from "@Modules/avatar/StoreInterface";
import { DataMapper } from "@Modules/domain/dataMapper";
import { WebEntity } from "@Modules/entity/entities";
// import { toJSON } from "@Modules/debugging";
import { saveLocalValue, loadLocalValue } from "@Modules/localStorage/index";

/**
 * Checks if a root Store property is safe to keep in persistent storage.
 * @param key The IRootState key of the property to check.
 * @returns `true` if it is safe to store that property, `false` if unsafe.
 */
function isSafeInPersistentStorage(key: keyof IRootState): boolean {
    // Only save/load these root properties to/from persistent storage.
    // Any other properties may be incompatible with persistent storage,
    // or contain non-user-configurable properties,
    // or be expected to cause other errors if loaded.
    const safeProperties = [
        "storeVersion",
        "avatar",
        "graphics",
        "account",
        "bookmarks",
        "controls"
    ];
    return safeProperties.includes(key);
}

/**
 * Load the Store's state from persistent storage.
 * @returns The Store state, as it persists in storage, or `undefined` if the state doesn't exist.
 */
function loadFromPersistentStorage(): IRootState | undefined {
    // This function currently uses localStorage as the persistent location.
    // In the future, a location such as Firebase, Amplify, etc, could be used instead.
    const state = loadLocalValue("store");
    let stateJson = undefined as IRootState | undefined;
    if (!state) {
        return undefined;
    }
    try {
        stateJson = JSON.parse(state) as IRootState | undefined;
        return stateJson;
    } catch (error) {
        return undefined;
    }
}

/**
 * Save the state of the Store to persistent storage.
 * @param value The current state of the Store.
 */
function saveToPersistentStorage(value: IRootState): void {
    // This function currently uses localStorage as the persistent location.
    // In the future, a location such as Firebase, Amplify, etc, could be used instead.

    function stateReplacer(key: string, entry: unknown): unknown {
        // Convert BigInt values to strings, since there is no default serializer for them.
        if (entry instanceof BigInt) {
            return entry.toString();
        }
        return entry;
    }

    // Only store properties that are safe to keep in persistent storage.
    const subStore = {} as { [key: string]: unknown };
    Object.entries(value).forEach(([key, entry]) => {
        if (isSafeInPersistentStorage(key as keyof IRootState)) {
            subStore[key] = entry;
        }
    });

    saveLocalValue(
        "store",
        JSON.stringify(subStore, (key, entry) => stateReplacer(key, entry))
    );
}

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
    UPDATE_AVATAR_VALUE = "UPDATE_AVATAR_VALUE",
    ADD_CONFERENCE_ROOM = "ADD_CONFERENCE_ROOM",
    REMOVE_CONFERENCE_ROOM = "REMOVE_CONFERENCE_ROOM",
    JOIN_CONFERENCE_ROOM = "JOIN_CONFERENCE_ROOM"
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

export interface JitsiRoomInfo {
    name: string;
    id: string;
    entity: WebEntity;
}

export interface ControlKeybind {
    name: string,
    keybind: string
}

/**
 * Properties in the root storage object
 * TODO: Eventually move these into modules
 */
export interface IRootState {
    storeVersion: {
        major: number,
        minor: number,
        patch: number
    },
    globalConsts: {
        APP_NAME: string,
        APP_VERSION: string,
        APP_VERSION_TAG: string,
        SDK_VERSION_TAG: string,
        SAFETY_BEFORE_SESSION_TIMEOUT: number // If a token has 6 or less hours left on its life, refresh it.
    },
    defaultConnectionConfig: {
        DEFAULT_METAVERSE_URL: string,
        DEFAULT_DOMAIN_PROTOCOL: string,
        DEFAULT_DOMAIN_PORT: string,
        DEFAULT_DOMAIN_URL: string
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
        showNametags: boolean,
        position: vec3,
        location: string,   // displayable, string form of position coordinates
        models: AvatarEntryMap,
        activeModel: string
    },
    // Chat information. Updated when the MessageClient connection state changes
    messages: {
        messages: AMessage[],
        nextMessageId: number,
    },
    // The audio connection
    audio: {
        inputsList: MediaDeviceInfo[],  // A list of the input devices from the browser.
        outputsList: MediaDeviceInfo[]  // A list of the input devices from the browser.
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
    // Graphics configuration.
    graphics: {
        fieldOfView: number,
        bloom: boolean,
        fxaaEnabled: boolean,
        msaa: number,
        sharpen: boolean
    },
    // Information about the metaverse-server. Updated when connection state changes.
    metaverse: {
        connectionState: string;
        name: string;
        nickname: string;
        server: string;
        iceServer: Nullable<string>;
        jitsiServer: Nullable<string>;
        serverVersion: Nullable<string>;
    },
    // Information about metaverse account that is logged in.
    account: {
        username: string;
        isLoggedIn: boolean;
        // Token data.
        accessToken: string;
        tokenType: string;
        scope: string;
        // Options.
        isAdmin: boolean;
        useAsAdmin: boolean;
        // Profile.
        images: {
            hero?: string;
            tiny?: string;
            thumbnail?: string;
        }
    },
    // Information from the underlying rendering system.
    renderer: {
        focusSceneId: number,
        fps: number,
        cameraLocation: Nullable<VVector3>,
        cameraRotation: Nullable<VVector4>,
        contentIsLoading: boolean,
        contentLoadingInfo: string,
        contentLoadingSpeed: number
    },
    // Theme configuration.
    theme: {
        brandName: string,
        productName: string,
        tagline: string,
        logo: string,
        globalServiceTerm: string,
        versionWatermark: string,
        colors: {
            primary: string,
            secondary: string,
            accent: string,
        },
        defaultMode: "light" | "dark",
        globalStyle: "none" | "aero" | "mica",
        headerStyle: "none" | "gradient-left" | "gradient-right",
        windowStyle: "none" | "gradient-top" | "gradient-right" | "gradient-bottom" | "gradient-left",
        helpLinks: unknown | {
            icon: string,
            label: string,
            link: string
        }[]
    },
    // First Time Wizard configuration.
    firstTimeWizard: {
        title: string,
        welcomeText: string,
        tagline: string,
        buttonText: string
    },
    // Conference data.
    conference: {
        activeRooms: JitsiRoomInfo[],
        currentRoom: JitsiRoomInfo
    },
    // Saved bookmarks.
    bookmarks: {
        locations: { name: string, color: string, url: string }[]
    },
    // Control keybinds.
    controls: {
        movement: {
            [key: string]: ControlKeybind
        },
        camera: {
            [key: string]: ControlKeybind
        },
        audio: {
            [key: string]: ControlKeybind
        },
        other: {
            [key: string]: ControlKeybind
        }
    }
}

// This store interface wrapper exists to add TS definitions of getters and mutators
// TODO: complete TS additions
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface VStore extends VuexStore<IRootState> {
}

const storeDefaults = {
    storeVersion: {
        major: 3,
        minor: 2,
        patch: 0
    },
    globalConsts: {
        APP_NAME: process.env.VRCA_PRODUCT_NAME ?? packageInfo.productName,
        APP_VERSION: packageInfo.version,
        APP_VERSION_TAG: versionInfo["version-tag"],
        SDK_VERSION_TAG: Vircadia.verboseVersion ?? "probably 0.0.4",
        SAFETY_BEFORE_SESSION_TIMEOUT: 21600 // If a token has 6 or less hours left on its life, refresh it.
    },
    defaultConnectionConfig: {
        DEFAULT_METAVERSE_URL: process.env.VRCA_DEFAULT_METAVERSE_URL ?? "https://metaverse.vircadia.com/live",
        DEFAULT_DOMAIN_PROTOCOL: process.env.VRCA_DEFAULT_DOMAIN_PROTOCOL ?? "wss:",
        DEFAULT_DOMAIN_PORT: process.env.VRCA_DEFAULT_DOMAIN_PORT ?? "40102",
        DEFAULT_DOMAIN_URL: process.env.VRCA_DEFAULT_DOMAIN_URL ?? "wss://antares.digisomni.com/0,0,0/0,0,0,1"
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
        displayName: "anonymous",
        showNametags: true,
        position: Vec3.ZERO,
        location: "0,0,0",
        models: defaultAvatarModels(),
        activeModel: defaultActiveAvatarModel()
    },
    messages: {
        messages: [],
        nextMessageId: 22
    },
    // Information about the audio system.
    audio: {
        inputsList: [],
        outputsList: [],
        user: {
            connected: false,
            hasInputAccess: false,
            muted: true,
            awaitingCapturePermissions: false,
            currentInputDevice: undefined,
            currentOutputDevice: undefined,
            userInputStream: undefined
        }
    },
    // Graphics configuration.
    graphics: {
        fieldOfView: 80,
        bloom: false,
        fxaaEnabled: true,
        msaa: 2,
        sharpen: false
    },
    // Information about the metaverse-server we're connected to.
    metaverse: {
        connectionState: "",
        name: "",
        nickname: "",
        server: "",
        iceServer: undefined,
        jitsiServer: undefined,
        serverVersion: undefined
    },
    // Information about the logged in account. Refer to Account module.
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
    // Information about the rendering system.
    renderer: {
        focusSceneId: 0,
        fps: 1,
        cameraLocation: undefined,
        cameraRotation: undefined,
        contentIsLoading: false,
        contentLoadingInfo: "",
        contentLoadingSpeed: 0
    },
    // Theme configuration.
    theme: {
        brandName: process.env.VRCA_BRAND_NAME,
        productName: process.env.VRCA_PRODUCT_NAME,
        tagline: process.env.VRCA_TAGLINE,
        logo: process.env.VRCA_LOGO,
        globalServiceTerm: process.env.VRCA_GLOBAL_SERVICE_TERM,
        versionWatermark: process.env.VRCA_VERSION_WATERMARK,
        colors: {
            primary: process.env.VRCA_COLORS_PRIMARY,
            secondary: process.env.VRCA_COLORS_SECONDARY,
            accent: process.env.VRCA_COLORS_ACCENT
        },
        defaultMode: process.env.VRCA_DEFAULT_MODE,
        globalStyle: process.env.VRCA_GLOBAL_STYLE,
        headerStyle: process.env.VRCA_HEADER_STYLE,
        windowStyle: process.env.VRCA_WINDOW_STYLE,
        // TODO: Move links to their own object (it's not theme related).
        helpLinks: process.env.VRCA_HELP_LINKS
    },
    // First Time Wizard configuration.
    firstTimeWizard: {
        title: process.env.VRCA_WIZARD_TITLE ?? "Vircadia",
        welcomeText: process.env.VRCA_WIZARD_WELCOME_TEXT ?? "Welcome to",
        tagline: process.env.VRCA_WIZARD_TAGLINE ?? "Your portal to the metaverse.",
        buttonText: process.env.VRCA_WIZARD_BUTTON_TEXT ?? "Get Started"
    },
    // Conference data.
    conference: {
        activeRooms: [],
        currentRoom: {} as JitsiRoomInfo
    },
    // Saved bookmarks.
    bookmarks: {
        locations: []
    },
    // Control keybinds.
    controls: {
        movement: {
            walkForwards: { name: "Walk Forwards", keybind: "KeyW" },
            walkBackwards: { name: "Walk Backwards", keybind: "KeyS" },
            walkLeft: { name: "Walk Left", keybind: "KeyA" },
            walkRight: { name: "Walk Right", keybind: "KeyD" },
            run: { name: "Run", keybind: "ShiftLeft" },
            jump: { name: "Jump", keybind: "Space" },
            crouch: { name: "Crouch", keybind: "KeyC" },
            fly: { name: "Fly", keybind: "KeyF" }
        },
        camera: {
            pitchUp: { name: "Pitch Up", keybind: "ArrowUp" },
            pitchDown: { name: "Pitch Down", keybind: "ArrowDown" },
            yawLeft: { name: "Yaw Left", keybind: "ArrowLeft" },
            yawRight: { name: "Yaw Right", keybind: "ArrowRight" },
            firstPerson: { name: "First-Person", keybind: "Digit1" },
            thirdPerson: { name: "Third-Person", keybind: "Digit3" },
            collisions: { name: "Toggle Collisions", keybind: "Digit4" }
        },
        audio: {
            mute: { name: "Toggle Mic Mute", keybind: "KeyV" },
            pushToTalk: { name: "Push-To-Talk", keybind: "KeyB" }
        },
        other: {
            resetPosition: { name: "Reset Position", keybind: "KeyK" },
            toggleMenu: { name: "Toggle Menu", keybind: "KeyM" },
            openChat: { name: "Open Chat", keybind: "KeyT" }
        }
    }
} as IRootState;

export const Store = createStore<IRootState>({
    state: (): IRootState => {
        const outputState = {} as IRootState;
        // Load the persistent state from storage.
        const persistentState = loadFromPersistentStorage();
        if (!persistentState || typeof persistentState !== "object") {
            return storeDefaults;
        }
        // Load the store defaults if the persistent storage doesn't have a version number.
        if (!("storeVersion" in persistentState)) {
            return storeDefaults;
        }
        // Load the store defaults if the persistent storage's major version is lower.
        if (persistentState.storeVersion.major < storeDefaults.storeVersion.major) {
            return storeDefaults;
        }
        // Verify the persistent state by comparing all of its keys to those of the default state.
        Object.entries(storeDefaults).forEach(([defaultKey, defaultValue]) => {
            // Assign types to the default key and value.
            const typedDefaultKey = defaultKey as keyof IRootState;
            const typedDefaultValue = defaultValue as typeof storeDefaults[typeof typedDefaultKey];

            // Get the explicit type of the default value.
            const typeOfDefaultValue = typeof typedDefaultValue;

            // If the explicit type of the persistent value does not match that of the default value,
            // or the default key doesn't exist within the persistent state,
            // or the value of the key is known to cause errors,
            // or the value of the key is an empty object,
            // set the value of the output state at this particular key to default.
            if (
                !(typedDefaultKey in persistentState)
                || typeof persistentState[typedDefaultKey] !== typeOfDefaultValue
                || !isSafeInPersistentStorage(typedDefaultKey)
                || persistentState[typedDefaultKey] && typeof persistentState[typedDefaultKey] === "object"
                && Object.entries(persistentState[typedDefaultKey]).length <= 0
            ) {
                // @ts-expect-error: TS may be failing to associate `typedDefaultKey` with `typedDefaultValue`.
                outputState[typedDefaultKey] = typedDefaultValue;
                return;
            }

            // Otherwise, use the value from the persistent state.
            // @ts-expect-error: TS may be failing to associate `typedDefaultKey` with
            // the value at `persistentState[typedDefaultKey]`.
            outputState[typedDefaultKey] = persistentState[typedDefaultKey];

            // Then, repeat the above process for the second layer of default properties.
            // Note: We are only verifying the first two layers of the state to limit the amount of
            // data we need to process and to avoid being overly critical.
            if (typeOfDefaultValue === "object") {
                Object.entries(typedDefaultValue).forEach(([defaultSubKey, defaultSubValue]) => {
                    const typedSubKey = defaultSubKey as keyof typeof typedDefaultValue;
                    const typedSubValue = defaultSubValue as typeof typedDefaultValue[typeof typedSubKey];
                    // Only check if the subkey exists in the persistent state,
                    // and if the value is of the same type as the default state.
                    if (
                        !(typedSubKey in persistentState[typedDefaultKey])
                        || typeof persistentState[typedDefaultKey][typedSubKey] !== typeof typedSubValue
                    ) {
                        outputState[typedDefaultKey][typedSubKey] = typedSubValue;
                    }
                    outputState[typedDefaultKey][typedSubKey] = persistentState[typedDefaultKey][typedSubKey];
                });
            }
        });
        // Note: We are using an intermediary variable (`outputState`) to store the returned state
        // so that extraneous properties within the persistent state are not retained.
        return outputState;
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
            /*
            if (payload && payload.property && payload.property !== "renderer") {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                Log.debug(Log.types.OTHER, `MUTATE: ${toJSON(payload)}`);
            } */
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
                saveToPersistentStorage(target as unknown as IRootState);
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
        // Remove old messages if the limit has passed.
        [Mutations.ADD_MESSAGE](state: IRootState, payload: AddMessagePayload) {
            const msg = payload.message;
            // If the message doesn't have some unique identification, add it.
            if (typeof msg.id === "undefined") {
                msg.id = state.messages.nextMessageId;
                state.messages.nextMessageId += 1;
            }

            state.messages.messages.push(payload.message);

            // If a maximum is specified, remove old messages from the list.
            if (typeof payload.maxMessages === "number" && state.messages.messages.length > payload.maxMessages) {
                state.messages.messages = state.messages.messages.slice(state.messages.messages.length - payload.maxMessages);
            }

            saveToPersistentStorage(state);
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

                saveToPersistentStorage(state);
            }
        },

        // Add a conference room info based on given web entity.
        [Mutations.ADD_CONFERENCE_ROOM](state: IRootState, entity: WebEntity) {
            const conferenceName = entity.name || "";
            const roomName = conferenceName + "-" + (entity.id || "");

            if (undefined === state.conference.activeRooms.find((x) => x.name === conferenceName)) {
                state.conference.activeRooms.push({
                    name: conferenceName,
                    id: roomName,
                    entity
                });
            }
        },

        // Add a conference room by conference name
        [Mutations.REMOVE_CONFERENCE_ROOM](state: IRootState, name: string) {
            const found = state.conference.activeRooms.findIndex((x) => x.name === name);
            if (found !== -1) {
                state.conference.activeRooms.splice(found, 1);
            }
        },

        // Join a conference room by conference name
        [Mutations.JOIN_CONFERENCE_ROOM](state: IRootState, room: JitsiRoomInfo) {
            state.conference.currentRoom = room;
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
                    jitsiServer: metaverse.JitsiServer,
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
                    // url: pPayload.domain.DomainUrl
                    url: pPayload.domain.Location.href
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

            // Log.debug(Log.types.OTHER, `StoreAction.UpdateAvatarInfo`);

            // const domainLoc = pPayload.domain.DomainClient?.location ?? "Disconnected";
            const domainLoc = pPayload.domain.DomainClient
                ? pPayload.domain.Location.protocol + "//" + pPayload.domain.Location.host
                : "Disconnected";

            // If we have information on my avatar, update same
            if (pPayload.domainAvatar) {
                const myAvaInfo = pPayload.domainAvatar.MyAvatar;
                if (myAvaInfo) {
                    pContext.commit(Mutations.MUTATE, {
                        property: "avatar",
                        with: {
                            displayName: myAvaInfo.displayName ? myAvaInfo.displayName : myAvaInfo.sessionDisplayName,
                            position: myAvaInfo?.position,
                            // eslint-disable-next-line max-len
                            location: `${domainLoc}/${DataMapper.mapVec3ToString(myAvaInfo?.position)}/${DataMapper.mapQuaternionToString(myAvaInfo?.orientation)}`
                        }
                    });

                } else {
                    // If no information on my avatar, display defaults
                    pContext.commit(Mutations.MUTATE, {
                        property: "avatar",
                        with: {
                            displayName: "none",
                            position: Vec3.ZERO,
                            // eslint-disable-next-line max-len
                            location: `${domainLoc}/${DataMapper.mapVec3ToString(null)}/${DataMapper.mapQuaternionToString(null)}`
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
                        location: `${domainLoc}/${DataMapper.mapVec3ToString(null)}/${DataMapper.mapQuaternionToString(null)}`
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
                            // FIXME: Define this in a constant somewhere, editable later by setting.
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
                // FIXME: Define this in a constant somewhere, editable later by setting.
                maxMessages: 150
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
