//
//  metaverse.ts
//
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

// Allow getters to be compact.
/* eslint-disable @typescript-eslint/brace-style */

import { SignalEmitter } from "@vircadia/web-sdk";
import { Config, DEFAULT_METAVERSE_URL } from "@Base/config";
import { API } from "@Modules/metaverse/API";
import type { MetaverseInfoResponse } from "@Modules/metaverse/APIInfo";
import { applicationStore } from "@Stores/index";
import Log, { findErrorMessage } from "@Modules/debugging/log";

/**
 * Metaverse server connection state.
 */
export enum MetaverseState {
    UNITIALIZED = "Uninitialized",
    CONNECTING = "Connecting",
    CONNECTED = "Connected",
    ERROR = "Error"
}

/**
 * Names of configuration variables used for persistent storage in Config.
 */
export const MetaversePersist = {
    "METAVERSE_URL": "Metaverse.Url",
    "METAVERSE_NAME": "Metaverse.Name",
    "METAVERSE_NICK_NAME": "Metaverse.NickName"
};

/**
 * A Metaverse server connection instance.
 *
 * The creation of this class is a three step process:
 * - An instance is created,
 * - Watchers are added to the Signal places,
 * - Then the URL is set.
 * The final step opens communication with the Metaverse server and will generate state changes.
 *
 * @example ```
 *   aMetaverse = new Metaverse();
 *   aMetaverse.onStateChange.connect((metaverse: Metaverse, newState: MetaverseState) => {
 *       // Do stuff whenever the Metaverse connection's state changes.
 *   });
 *   aMetaverse.setMetaverseUrl(theUrl);
 * ```
 */
export class Metaverse {
    private _metaverseUrl = applicationStore.defaultConnectionConfig.DEFAULT_METAVERSE_URL;
    private _connectionState: MetaverseState = MetaverseState.UNITIALIZED;
    private _metaverseName = "UNKNOWN";
    private _metaverseNickname = "UNKN";
    private _iceServer: Nullable<string> = undefined;
    private _jitsiServer: Nullable<string> = undefined;
    private _serverVersion = "V0.0.0";

    public onStateChange: SignalEmitter;

    constructor() {
        this._connectionState = MetaverseState.UNITIALIZED;
        this.onStateChange = new SignalEmitter();
        this._restorePersistentVariables();
    }

    public get MetaverseUrl(): string { return this._metaverseUrl; }
    public get ConnectionState(): MetaverseState { return this._connectionState; }
    public get MetaverseName(): string { return this._metaverseName; }
    public get MetaverseNickname(): string { return this._metaverseNickname; }
    public get IceServer(): Nullable<string> { return this._iceServer; }
    public get JitsiServer(): Nullable<string> { return this._jitsiServer; }
    public get ServerVersion(): string { return this._serverVersion; }

    /**
     * `true` if the Metaverse connection is active, `false` if inactive.
     */
    get isConnected(): boolean {
        return this._connectionState === MetaverseState.CONNECTED;
    }

    /**
     * Update the URL to the metaverse.
     *
     * This calls the metaverse_info endpoint at the provided URL and updates the locally stored information.
     *
     * @param url The URL of the new Metaverse server.
     * @throws If the Metaverse is inaccessible or returns an error.
     */
    async setMetaverseUrl(url: string): Promise<void> {
        this._setMetaverseConnectionState(MetaverseState.CONNECTING);

        // Remove any trailing slashes from the URL.
        const newUrl = API.normalizeMetaverseUrl(url);

        // Access the Metaverse server and get its configuration info.
        try {
            const data = await API.get(API.endpoints.info, newUrl) as MetaverseInfoResponse;
            this._metaverseUrl = API.normalizeMetaverseUrl(data.metaverse_url);
            this._metaverseName = data.metaverse_name;
            this._metaverseNickname = data.metaverse_nick_name ?? data.metaverse_name;
            this._iceServer = data.ice_server_url;
            this._jitsiServer = data.jitsi_server_domain;
            this._serverVersion = data.metaverse_server_version["version-tag"];

            this._connectionState = MetaverseState.CONNECTED;

            Log.info(Log.types.METAVERSE, `Set new Metaverse URL to: ${this._metaverseUrl}`);
            Log.info(Log.types.METAVERSE, `Set new Metaverse name to: ${this._metaverseName}`);

            this._setMetaverseConnectionState(MetaverseState.CONNECTED);
            this._storePersistentVariables();
        } catch (error) {
            Log.error(Log.types.NETWORK, `Failed to fetch Metaverse info for URL: ${newUrl}`);
            Log.error(Log.types.NETWORK, findErrorMessage(error));
            this._setMetaverseConnectionState(MetaverseState.ERROR);
        }
    }

    /**
     * Set the stored Metaverse state.
     */
    private _setMetaverseConnectionState(newState: MetaverseState): void {
        this._connectionState = newState;
        this.onStateChange.emit(this, newState); // Signature: Metaverse, MetaverseState.
        applicationStore.updateMetaverseState(this, newState);
    }

    /**
     * Store values that are remembered across sessions.
     *
     * Some values persist across sessions, so the next time the user opens the app, the
     * previous known values are restored and the connection is automatically made.
     */
    private _storePersistentVariables(): void {
        Config.setItem(MetaversePersist.METAVERSE_URL, this._metaverseUrl);
        Config.setItem(MetaversePersist.METAVERSE_NAME, this._metaverseName);
        Config.setItem(MetaversePersist.METAVERSE_NICK_NAME, this._metaverseNickname);
    }

    /**
     * Fetch persistently stored variables.
     *
     * Note: This is not reactive, so it is best used when initializing.
     */
    private _restorePersistentVariables(): void {
        this._metaverseUrl = Config.getItem(
            MetaversePersist.METAVERSE_URL,
            Config.getItem(DEFAULT_METAVERSE_URL, applicationStore.defaultConnectionConfig.DEFAULT_METAVERSE_URL)
        );
        this._metaverseName = Config.getItem(MetaversePersist.METAVERSE_NAME, "UNKNOWN");
        this._metaverseNickname = Config.getItem(MetaversePersist.METAVERSE_NICK_NAME, "UNKN");
    }
}
