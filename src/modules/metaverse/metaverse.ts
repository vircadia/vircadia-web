/*
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

import { doAPIGet, cleanMetaverseUrl } from "@Modules/metaverse/metaverseOps";
import { MetaverseInfoResp, MetaverseInfoAPI } from "@Modules/metaverse/APIAccount";

// import { Store, Mutations as StoreMutations } from "@Base/store";

import Signal from "@Modules/utility/Signal";

import { Config } from "@Base/config";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Log from "@Modules/debugging/log";

// Allow 'get' lines to be compact
/* eslint-disable @typescript-eslint/brace-style */

/** Connection states for talking to the metaverse-server */
export enum MetaverseState {
    UNITIALIZED = "Uninitialized",
    CONNECTING = "Connecting",
    CONNECTED = "Connected",
    ERROR = "Error"
}

/** Names of configuration variables used for persistant storage in Config */
export const MetaversePersist = {
    "METAVERSE_URL": "Metaverse.Url",
    "METAVERSE_NAME": "Metaverse.Name",
    "METAVERSE_NICK_NAME": "Metaverse.NickName"
};

/**
 * Class instance for a connection to a metaverse-server.
 *
 * The creation of this class is two step in that an instance is created,
 * watchers are added to the Signal places, and then the URL is set.
 * This latter operation causes communication with the metaverse-server
 * and will generate state changes.
 *
 * ```
 *      aMetaverse = new Metaverse();
 *      aMetaverse.onStateChange.connect((pMetaverse: Metaverse, pNewState: MetaverseState) => {
 *          // do stuff
 *      });
 *      aMetaverse.setMetaverseUrl(theUrl);
 * ```
 */
export class Metaverse {
    #_metaverseUrl = "https://metaverse.vircadia.com/live";
    public get MetaverseUrl(): string { return this.#_metaverseUrl; }

    #_connectionState: MetaverseState = MetaverseState.UNITIALIZED;
    public get ConnectionState(): MetaverseState { return this.#_connectionState; }

    #_metaverseName = "UNKNOWN";
    public get MetaverseName(): string { return this.#_metaverseName; }

    #_metaverseNickname = "UNKN";
    public get MetaverseNickname(): string { return this.#_metaverseNickname; }

    #_iceServer: Nullable<string> = undefined;
    public get IceServer(): Nullable<string> { return this.#_iceServer; }

    #_serverVersion = "V0.0.0";
    public get ServerVersion(): string { return this.#_serverVersion; }

    public onStateChange: Signal;

    constructor() {
        this.#_connectionState = MetaverseState.UNITIALIZED;
        this.onStateChange = new Signal();

        this._restorePersistentVariables();
    }

    /** Return 'true' if the communication with the metaverse is active */
    get isConnected(): boolean {
        return this.#_connectionState === MetaverseState.CONNECTED;
    }

    /**
     * Update the URL to the metaverse.
     *
     * This causes accessing the metaverse_info access point of the metaverse-server
     * and updating the locally stored information and the metaverse info in $store.
     *
     * @param pNewUrl Url to the new metaverse
     * @throws {Error} if the metaverse access gives and error (not found or response error)
     */
    async setMetaverseUrl(pNewUrl: string): Promise<void> {
        this._setMetaverseConnectionState(MetaverseState.CONNECTING);

        // Remove any trailing slash as the API requests always have them
        const newUrl = cleanMetaverseUrl(pNewUrl);

        // Access the metaverser-server and get its configuration info
        const data = await doAPIGet(MetaverseInfoAPI, newUrl) as MetaverseInfoResp;
        this.#_metaverseUrl = cleanMetaverseUrl(data.metavserse_url);
        this.#_metaverseName = data.metaverse_name;
        this.#_metaverseNickname = data.metaverse_nick_name ?? data.metaverse_name;
        this.#_iceServer = data.ice_server_url;
        this.#_serverVersion = data.metaverse_server_version["version-tag"];

        this.#_connectionState = MetaverseState.CONNECTED;

        Log.info(Log.types.METAVERSE, `Set new metaverse URL=${this.#_metaverseUrl}, name=${this.#_metaverseName}`);

        // REMOVE code when Signal handler added to caller
        // Store.commit(StoreMutations.MUTATE, {
        //     property: "metaverse",
        //     with: {
        //         name: Metaverse.metaverseName,
        //         nickname: Metaverse.metaverseNickname,
        //         server: Metaverse.metaverseUrl,
        //         iceServer: Metaverse.iceServer,
        //         serverVersion: Metaverse.serverVersion
        //     }
        // });

        this._setMetaverseConnectionState(MetaverseState.CONNECTED);
    }

    /**
     * Set the metaverse state. Updates the UI knowledge of the state
     */
    _setMetaverseConnectionState(pNewState: MetaverseState): void {
        this.#_connectionState = pNewState;
        this.onStateChange.emit(this, pNewState);
        // REMOVE code when Signal handler added to caller
        // Store.commit(StoreMutations.MUTATE, {
        //     property: "metaverse/connectionState",
        //     value: pNewState
        // });
    }

    /**
     * Store values that are remembered across sessions.
     *
     * Some values persist across sessions so, the next time the user opens the app, the
     * previous known values are restored and connection is automatically made.
     */
    _storePersistentVariables(): void {
        Config.setItem(MetaversePersist.METAVERSE_URL, this.#_metaverseUrl);
        Config.setItem(MetaversePersist.METAVERSE_NAME, this.#_metaverseName);
        Config.setItem(MetaversePersist.METAVERSE_NICK_NAME, this.#_metaverseNickname);
    }

    /**
     * Fetch and set persistantly stored variables.
     *
     * Note that this does not do any reactive pushing so this is best used to initialize.
     */
    _restorePersistentVariables(): void {
        this.#_metaverseUrl = Config.getItem(MetaversePersist.METAVERSE_URL, "https://metaverse.vircadia.com/live");
        this.#_metaverseName = Config.getItem(MetaversePersist.METAVERSE_NAME, "UNKNOWN");
        this.#_metaverseNickname = Config.getItem(MetaversePersist.METAVERSE_NICK_NAME, "UNKN");
    }
}
