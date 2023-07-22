/*
//  global.d.ts
//
//  Created by Robert Adams, July 31, 2021
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

// Define a variable to be potentially nullable/undefined.
type Nullable<T> = T | null | undefined;

/**
 * An object that contains named entries of unknown contents
 * @typedef {Object.<string,unknown>} KeyedCollection
 */
type KeyedCollection = { [ key: string ]: unknown };
/**
 * An object that contains string keys to string values
 * @typedef {Object.<string,string>} KeyValue
 */
type KeyValue = { [ key: string ]: string };

/**
 * A value that can have any value
 * @typedef ({KeyedCollection|string|number|unknown}) AnyValue
 */
type AnyValue = KeyedCollection | string | number | unknown;
