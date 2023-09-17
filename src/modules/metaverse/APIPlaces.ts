//
//  APIPlaces.ts
//
//  Metaverse server place operations.
//
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { PlaceInfo } from "@Modules/metaverse/APIInfo";

// GET /api/v1/places
export const GetPlacesAPI = "/api/v1/places";
export interface GetPlacesResponse {
    "places": PlaceInfo[],
    "maturity-categories": string[]
}
export interface PlaceEntry {
    name: string;
    placeId: string;
    address: string;
    description: string;
    thumbnail: string;
    currentAttendance: number;
}
