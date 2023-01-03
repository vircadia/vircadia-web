//
//  index.ts
//
//  Created by Giga on 31 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

interface LocalStorageContent {
    store: string
}

/**
 * Save a value to the browser's local storage.
 * @param key The local storage key to save the value under.
 * @param value The value to save.
 */
export function saveLocalValue(key: keyof LocalStorageContent, value: string): void {
    window.localStorage.setItem(key, value);
}

/**
 * Load a value from the browser's local storage.
 * @param key The local storage key to retrieve the value from.
 * @returns The value stored at `key`, or `null` if the key/value doesn't exist.
 */
export function loadLocalValue(key: keyof LocalStorageContent): string | null {
    return window.localStorage.getItem(key);
}
