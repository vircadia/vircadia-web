//
//  API.ts
//
//  Refactored by Giga on June 28th, 2023.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { MetaverseManager } from "@Modules/metaverse";
import { Account } from "../account";
import { GetAccountAPI, PostUsersAPI } from "@Modules/metaverse/APIAccount";
import { MetaverseInfoAPI } from "@Modules/metaverse/APIInfo";
import { GetPlacesAPI, type GetPlacesResponse, type PlaceEntry } from "@Modules/metaverse/APIPlaces";
import { OAuthTokenAPI } from "@Modules/metaverse/APIToken";
import Log, { findErrorMessage } from "@Modules/debugging/log";

/**
 * Standard response from Metaverse server API requests.
 */
export interface APIResponse {
    status: "success" | "fail";
    data?: unknown;
    error?: string;
}

/**
 * Static methods for fetching data from a Metaverse server.
 */
export class API {
    public static readonly endpoints = {
        account: GetAccountAPI,
        info: MetaverseInfoAPI,
        places: GetPlacesAPI,
        token: OAuthTokenAPI,
        users: PostUsersAPI
    } as const;

    /**
     * Construct a complete URL from a Metaverse server API path.
     *
     * @param path The API path (for example, `"/api/v1/users"`).
     * @param metaverseUrl `(Optional)` URL to use for accessing the Metaverse server. Otherwise, the currently connected Metaverse server is used.
     * @returns The constructed URL.
     */
    public static buildUrl(path: string, metaverseUrl?: string): string {
        return (metaverseUrl ?? MetaverseManager.activeMetaverse?.MetaverseUrl ?? "") + path;
    }

    /**
     * Build configuration parameters for sending REST requests to the Metaverse server.
     *
     * @param method `(Optional)` The REST method of the request. Defaults to GET.
     * @returns A configuration object for a GET or POST request.
     */
    public static buildRequestConfig(method = "GET"): KeyedCollection {
        const config: KeyedCollection = {
            method
        };
        const minAccessTokenLength = 10;
        if (Account.accessToken && Account.accessToken.length > minAccessTokenLength) {
            config.headers = {
                "Authorization": (Account.accessTokenType ?? "Bearer") + " " + Account.accessToken
            };
        }
        return config;
    }

    /**
     * Normalize a Metaverse server URL.
     *
     * @param url
     * @returns The normalized URL.
     */
    public static normalizeMetaverseUrl(url: string): string {
        let normalizedUrl = url;
        // Remove any trailing slashes so that paths are easier to append to the URL.
        while (normalizedUrl.endsWith("/")) {
            normalizedUrl = normalizedUrl.slice(0, -1);
        }
        return normalizedUrl;
    }

    /**
     * Make a GET request to the Vircadia API.
     *
     * @param path The API path to make the request to.
     * @param metaverseUrl `(Optional)` URL to use for accessing the Metaverse server. Otherwise, the currently connected Metaverse server is used.
     * @returns The `data` section of the returned response as an `unknown` type.
     */
    public static async get(path: string, metaverseUrl?: string): Promise<unknown> {
        const response = await fetch(this.buildUrl(path, metaverseUrl), this.buildRequestConfig());
        const data = await response.json() as APIResponse;
        // The info and token endpoints do not return data in the usual format.
        if (data && (path === this.endpoints.info || path === this.endpoints.token)) {
            return data;
        }
        if (data && data.status === "success") {
            return data.data;
        }
        throw new Error(`Vircadia API GET request to ${path} failed: ${response.status}: ${response.statusText}`);
    }

    /**
     * Make a POST request to the Vircadia API.
     *
     * @param path The API path to make the request to.
     * @param body The content to send to the API.
     * @param metaverseUrl `(Optional)` URL to use for accessing the Metaverse server. Otherwise, the currently connected Metaverse server is used.
     * @returns The `data` section of the returned response as an `unknown` type.
     */
    public static async post(path: string, body: FormData | KeyedCollection, metaverseUrl?: string): Promise<unknown> {
        const requestConfig = this.buildRequestConfig("POST");
        requestConfig.body = body instanceof FormData ? body : JSON.stringify(body);
        if (!(body instanceof FormData)) {
            requestConfig.headers = {
              "Accept": "application/json",
              "Content-Type": "application/json"
            };
        }
        const response = await fetch(this.buildUrl(path, metaverseUrl), requestConfig);
        const data = await response.json() as APIResponse;
        // The info and token endpoints do not return data in the usual format.
        if (data && (path === this.endpoints.info || path === this.endpoints.token)) {
            return data;
        }
        if (data && data.status === "success") {
            return data.data;
        }
        throw new Error(`Vircadia API POST request to ${path} failed: ${response.status}: ${response.statusText}`);
    }

    /**
     * @returns A list of the places (worlds) available in the connected Metaverse.
     */
    public static async getActivePlaceList(): Promise<PlaceEntry[]> {
        const places: PlaceEntry[] = [];

        if (!MetaverseManager.activeMetaverse?.isConnected) {
            Log.error(Log.types.PLACES, "Attempted to get places when not connected to a Metaverse server.");
        }

        try {
            const placesResponse = await this.get(this.endpoints.places + "?status=online") as GetPlacesResponse;

            for (const place of placesResponse.places) {
                places.push({
                    name: place.name,
                    placeId: place.placeId,
                    address: place.address,
                    description: place.description,
                    thumbnail: place.thumbnail ?? "",
                    currentAttendance: place.current_attendance ?? 0
                });
            }
        } catch (error) {
            Log.error(Log.types.PLACES, `Exception while attempting to get places: ${findErrorMessage(error)}`);
        }

        return places;
    }
}
