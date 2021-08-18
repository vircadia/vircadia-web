/*
//  global.d.ts
//
//  Created by Robert Adams, July 31, 2021
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

// Define a variable to be potentially nullable/undefined.
type Nullable<T> = T | null | undefined;

// Definition of simple collections
type KeyedCollection = { [ key: string ] : unknown };
type KeyValue = { [ key: string ] : string };

type AnyValue = KeyedCollection | string | number | unknown;
