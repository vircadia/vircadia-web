/*
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

/**
 * Metaverse-server operations that operate on Places
 */

import { PlaceInfo } from "@Modules/metaverse/APIInfo";

// GET /api/v1/account/{accountId}
// (Note slash at end to make construction easier: "GetAccountByIdAPI + ID")
export const GetPlacesAPI = "/api/v1/places"; // add "/accountId"
export interface GetPlacesResponse {
    "places": PlaceInfo[],
    "maturity-categories": string[]
}
