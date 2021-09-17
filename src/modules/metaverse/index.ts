/*
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

import { doAPIGet, cleanMetaverseUrl } from "@Modules/metaverse/metaverseOps";
import { MetaverseInfoResp, MetaverseInfoAPI } from "@Modules/metaverse/APIAccount";

import { Store, Mutations as StoreMutations } from "@Base/store";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Config } from "@Base/config";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Log from "@Modules/debugging/log";

// ESLint thinks there are race conditions which don't exist (:fingers-crossed:)
/* eslint-disable require-atomic-updates */

/** Connection states for talking to the metaverse-server */
export const MetaverseState = {
    UNITIALIZED: "Uninitialized",
    CONNECTING: "Connecting",
    CONNECTED: "Connected",
    ERROR: "Error"
};

export const Metaverse = {
    metaverseUrl: "https://metaverse.vircadia.com/live",
    connectionState: MetaverseState.UNITIALIZED,
    metaverseName: "UNKNOWN",
    metaverseNickname: "UNKN",
    iceServer: undefined as Nullable<string>,
    serverVersion: undefined as Nullable<string>,

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
        Metaverse.setMetaverseConnectionState(MetaverseState.CONNECTING);

        // Remove any trailing slash as the API requests always have them
        const newUrl = cleanMetaverseUrl(pNewUrl);

        // Access the metaverser-server and get its configuration info
        const data = await doAPIGet(MetaverseInfoAPI, newUrl) as MetaverseInfoResp;
        Metaverse.metaverseUrl = cleanMetaverseUrl(data.metavserse_url);
        Metaverse.metaverseName = data.metaverse_name;
        Metaverse.metaverseNickname = data.metaverse_nick_name ?? data.metaverse_name;
        Metaverse.iceServer = data.ice_server_url;
        Metaverse.serverVersion = data.metaverse_server_version["version-tag"];

        Metaverse.connectionState = MetaverseState.CONNECTED;

        Log.info(Log.types.METAVERSE, `Set new metaverse URL=${Metaverse.metaverseUrl}, name=${Metaverse.metaverseName}`);

        Store.commit(StoreMutations.MUTATE, {
            property: "metaverse",
            with: {
                name: Metaverse.metaverseName,
                nickname: Metaverse.metaverseNickname,
                server: Metaverse.metaverseUrl,
                iceServer: Metaverse.iceServer,
                serverVersion: Metaverse.serverVersion
            }
        });

        Metaverse.setMetaverseConnectionState(MetaverseState.CONNECTED);
    },
    /**
     * Set the metaverse state. Updates the UI knowledge of the state
     */
    setMetaverseConnectionState(pNewState: string): void {
        Metaverse.connectionState = pNewState;
        Store.commit(StoreMutations.MUTATE, {
            property: "metaverse/connectionState",
            value: pNewState
        });
    }
};
