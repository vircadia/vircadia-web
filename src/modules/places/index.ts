/*
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

import { MetaverseMgr } from "@Modules/metaverse";
import { doAPIGet } from "@Modules/metaverse/metaverseOps";
import { GetPlacesAPI, GetPlacesResponse } from "@Modules/metaverse/APIPlaces";
import Log, { findErrorMessage } from "@Modules/debugging/log";

export interface PlaceEntry {
    name: string;
    placeId: string;
    address: string;
    description: string;
    thumbnail: string;
    currentAttendance: number;
}

export const Places = {

    async getActiveList(): Promise<PlaceEntry[]> {
        const places: PlaceEntry[] = [];
        if (MetaverseMgr.ActiveMetaverse?.isConnected) {
            try {
                const apiRequestUrl = GetPlacesAPI + "?status=online";
                const placesResponse = await doAPIGet(apiRequestUrl) as GetPlacesResponse;

                placesResponse.places.forEach((place) => {
                    places.push({
                        name: place.name,
                        placeId: place.placeId,
                        address: place.address,
                        description: place.description,
                        thumbnail: place.thumbnail,
                        currentAttendance: place.current_attendance === undefined ? 0 : place.current_attendance
                    } as PlaceEntry);
                });
            } catch (error) {
                const errorMessage = findErrorMessage(error);
                Log.error(Log.types.PLACES, `Exception while attempting to get places: ${errorMessage}`);
            }
        } else {
            Log.error(Log.types.PLACES, "Attempt to get places when metaverse not connected");
        }

        return places;
    }
};
