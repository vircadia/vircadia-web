//
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { MetaverseManager } from "@Modules/metaverse";
import { API } from "@Modules/metaverse/API";
import type { GetPlacesResponse } from "@Modules/metaverse/APIPlaces";
import Log, { findErrorMessage } from "@Modules/debugging/log";

export interface PlaceEntry {
    name: string;
    placeId: string;
    address: string;
    description: string;
    thumbnail: string;
    currentAttendance: number;
}

/**
 * Static methods for interacting with places/worlds in the connected Metaverse.
 */
export class Places {
    /**
     * @returns A list of the places (worlds) available in the connected Metaverse.
     */
    public static async getActiveList(): Promise<PlaceEntry[]> {
        const places: PlaceEntry[] = [];

        if (!MetaverseManager.activeMetaverse?.isConnected) {
            Log.error(Log.types.PLACES, "Attempted to get places when not connected to a Metaverse server.");
        }

        try {
            const placesResponse = await API.get(API.endpoints.places + "?status=online") as GetPlacesResponse;

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
