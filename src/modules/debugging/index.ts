/*
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

/**
 * Convert an object into a non-standard JSON string.
 *
 * This exists because there is no serializer for BigInt and this allows debugging
 * output of general objects that might include the SDK's Uuid type.
 * This also handles "undefined" in that standard JSON.stringify will not output
 * anything for an undefined value because it is non-standard JSON.
 * Note that because of this, this code does not create standard JSON so use
 * this function only for debugging output and not for generating stored or sent messages.
 *
 * @param value object to be serialized to a string
 * @returns {string} of passed object as JSON
 */
export function toJSON(value: unknown): string {
    return JSON.stringify(value, (k, v) => {
        if (v instanceof BigInt) {
            return "BigInt";    // there is no serializer for BigInt
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return typeof v === "undefined" ? "undef" : v;
    });
}
