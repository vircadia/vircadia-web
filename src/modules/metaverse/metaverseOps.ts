/*
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

import axios from "axios";

import { Metaverse } from "@Modules/metaverse";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Config } from "@Base/config";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Log from "@Modules/debugging/log";

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
 * Construct a complete URL from a metaverser-server REST access portion.
 *
 * @param pAPIUrl API URL portion (e.g., "/api/v1/users")
 * @param pMetaverseUrl optional URL to the metaverse. Current metaverse if not passed
 * @returns constructed URL to access the metaverser-server REST function
 */
export function buildUrl(pAPIUrl: string, pMetaverseUrl?: string): string {
    return (pMetaverseUrl ?? Metaverse.metaverseUrl) + pAPIUrl;
}

/**
 * Do REST GET Vircadia API request at the passed API address.
 *
 * The API address is added to the metaverse address and the request is made.
 * This expects the usual API response "{"status": "success", "data": Object }"
 * and the object returned in the "data" property is what is returned.
 *
 * @param pAPIUrl Complete URL to do fetch from
 * @param PMetaverseUrl optional URL to use for accessing the metaverser-server
 * @returns the "data" section of the returned response as an "unknown"
 * @throws {Error} if there are any problems
 */
export async function doAPIGet(pAPIUrl: string, pMetaverseUrl?: string): Promise<unknown> {
    const accessUrl = buildUrl(pAPIUrl, pMetaverseUrl);
    try {
        const resp = await axios.get(accessUrl);
        const response = resp.data as unknown as APIResponse;
        if (response.status && response.status === "success") {
            return response.data;
        }
        throw new Error(`Error return on ${pAPIUrl}: ${response.error ?? "??"}`);
    } catch (err) {
        Log.error(Log.types.OTHER, `Exception on GET ${pAPIUrl}: ${(err as Error).message}`);
        throw new Error(`Exception on GET ${pAPIUrl}: ${(err as Error).message}`);
    }
}

export async function doAPIPost(pAPIUrl: string, pBody: KeyedCollection): Promise<unknown> {
    const accessUrl = buildUrl(pAPIUrl);
    try {
        const resp = await axios.post(accessUrl, pBody);
        const response = resp.data as unknown as APIResponse;
        if (response.status && response.status === "success") {
            return response.data;
        }
        throw new Error(`Error return on POST ${pAPIUrl}: ${response.error ?? "??"}`);
    } catch (err) {
        Log.error(Log.types.OTHER, `Exception on ${pAPIUrl}: ${(err as Error).message}`);
        throw new Error(`Exception on POST ${pAPIUrl}: ${(err as Error).message}`);
    }
}
