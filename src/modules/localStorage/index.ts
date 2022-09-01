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
    displayName: string
}

export function saveLocalValue(key: keyof LocalStorageContent, value: string): void {
    window.localStorage.setItem(key, value);
}

export function loadLocalValue(key: keyof LocalStorageContent): string | null {
    return window.localStorage.getItem(key);
}
