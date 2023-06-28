/*
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

import { MetaverseMgr } from "@Modules/metaverse";
import { Account } from "../account";

// Standard response from metavers-server API requests
export interface APIResponse {
    status: "success" | "fail";
    data?: unknown;
    error?: string;
}

/**
 * Return cleaned up URL to the Metaverse server.
 *
 * Mostly makes sure there is no trailing slash so, when added to the REST access
 * point, there are not two slashes.
 *
 * @param pNewUrl Url as passed by the caller
 * @returns cleaned up Url
 */
export function cleanMetaverseUrl(pNewUrl: string): string {
    let url = pNewUrl;
    while (url.endsWith("/")) {
        url = url.slice(0, -1);
    }
    return url;
}

/**
 * Construct a complete URL from a metaverse-server REST access portion.
 *
 * @param pAPIUrl API URL portion (e.g., "/api/v1/users")
 * @param pMetaverseUrl optional URL to the metaverse. Current metaverse if not passed
 * @returns constructed URL to access the metaverse-server REST function
 */
export function buildUrl(pAPIUrl: string, pMetaverseUrl?: string): string {
    return (pMetaverseUrl ?? MetaverseMgr.ActiveMetaverse.MetaverseUrl) + pAPIUrl;
}

/**
 * Build configuration parameters for sending with REST requests to the metaverse-server.
 * @param method The REST method of the request.
 * @returns A configuration object for a GET or POST request.
 */
function buildRequestConfig(method = "GET"): KeyedCollection {
    const config: KeyedCollection = {
        method
    };
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    if (Account.accessToken && Account.accessToken.length > 10) {
        config.headers = {
            "Authorization": (Account.accessTokenType ?? "Bearer") + " " + Account.accessToken
        };
    }
    return config;
}

/**
 * Do REST GET Vircadia API request at the passed API address.
 *
 * The API address is added to the metaverse address and the request is made.
 * This expects the usual API response "{"status": "success", "data": Object }"
 * and the object returned in the "data" property is what is returned.
 *
 * @param pAPIUrl Complete URL to do fetch from
 * @param PMetaverseUrl optional URL to use for accessing the metaverse-server
 * @returns the "data" section of the returned response as an "unknown"
 * @throws {Error} if there are any problems
 */
export async function doAPIGet(pAPIUrl: string, pMetaverseUrl?: string): Promise<unknown> {
    const accessUrl = buildUrl(pAPIUrl, pMetaverseUrl);
    const response = await fetch(accessUrl, buildRequestConfig());
    const data = await response.json() as APIResponse;
    if (response && data && data.status === "success") {
        return data.data;
    }
    throw new Error(`Vircadia API GET request to ${pAPIUrl} failed: ${response.statusText}`);
}

export async function doAPIPost(pAPIUrl: string, pBody: KeyedCollection, pMetaverseUrl?: string): Promise<unknown> {
    const accessUrl = buildUrl(pAPIUrl, pMetaverseUrl);
    const requestConfig = buildRequestConfig("POST");
    requestConfig.body = pBody;
    const response = await fetch(accessUrl, requestConfig);
    const data = await response.json() as APIResponse;
    if (response && data && data.status === "success") {
        return data.data;
    }
    throw new Error(`Vircadia API POST request to ${pAPIUrl} failed: ${response.statusText}`);
}
