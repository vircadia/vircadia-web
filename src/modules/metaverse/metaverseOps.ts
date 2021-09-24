/*
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

import axios, { AxiosRequestConfig } from "axios";

import { MetaverseMgr } from "@Modules/metaverse";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Config } from "@Base/config";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Log from "@Modules/debugging/log";
import { Account } from "../account";

// Standard response from metavers-server API requests
export interface APIResponse {
    status: "success" | "fail";
    data?: unknown;
    error?: string;
}

/**
 * Extract the error string from a thrown error.
 *
 * A "catch" can get anything that is thrown. We want the error message for display
 * so this routine looks at the error object and, if a string, presumes that is the
 * error message and, if an object with the property "message", presumes that is
 * the error message. Otherwise a JSON.stringified version of the object is returned.
 *
 * @param pErr error object caught by "catch"
 * @returns the extracted error message string
 */
export function findErrorMsg(pErr: unknown): string {
    if (typeof pErr === "string") {
        return pErr;
    }
    const errr = <Error>pErr;
    if ("message" in errr) {
        return errr.message;
    }
    return `Error: ${JSON.stringify(pErr)}`;
}

/**
 * Return cleaned up URL to the metaverse-server.
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
 *
 * Mostly add the Authentication: header.
 *
 * @returns a configuration object for an Axios GET or POST request
 */
function buildRequestConfig(): AxiosRequestConfig | undefined {
    const config: KeyedCollection = {};
    if (Account.accessToken) {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        if (Account.accessToken.length > 10) {
            config.headers = {
                "Authorization": (Account.accessTokenType ?? "Bearer") + " " + Account.accessToken
            };
        }
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
    // Log.debug(Log.types.COMM, `doAPIGet: url=${pAPIUrl}`);
    let errorString = "";
    try {
        const resp = await axios.get(accessUrl, buildRequestConfig());
        const response = resp.data as unknown as APIResponse;
        if (response && response.status) {
            if (response.status === "success") {
                return response.data;
            }
            errorString = `${response.error ?? "unspecified"}`;
        } else {
            errorString = `Poorly formed response to GET ${pAPIUrl}: ${JSON.stringify(resp)}`;
        }
    } catch (err) {
        const errMsg = findErrorMsg(err);
        Log.error(Log.types.OTHER, `Exception on GET ${pAPIUrl}: ${errMsg}`);
        errorString = `Exception on GET ${pAPIUrl}: ${errMsg}`;
    }
    throw new Error(errorString);
}

export async function doAPIPost(pAPIUrl: string, pBody: KeyedCollection): Promise<unknown> {
    const accessUrl = buildUrl(pAPIUrl);
    try {
        const resp = await axios.post(accessUrl, pBody, buildRequestConfig());
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
