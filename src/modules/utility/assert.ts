//
//  assert.ts
//
//  Created by David Rowe on 9 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import Log from "@Modules/debugging/log";

/**
 * Reports and throws an error if an assertion is falsey.
 * Information on the error is reported to the console along with a call stack.
 * @param assertion The assertion value.
 * @param info Information to report to the console if the assertion is falsey.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function assert(assertion: boolean, ...info: any[]): asserts assertion {
    if (!assertion) {
        const message = ["Assertion failed!", ...info as [string]].join(" ");
        Log.error(Log.types.OTHER, message);
        throw new Error(message);
    }
}
