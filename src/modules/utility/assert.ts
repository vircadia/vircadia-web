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

/*@devdoc
 *  Reports and throws an error if an assertion is <code>false</code>. Information on the error is reported to the console along
 *  with a call stack.
 *  @function assert
 *  @param {boolean} assertion - The assertion value.
 *  @param {...any} info - Information to report to the console if the assertion is <code>false</code>.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function assert(assertion: boolean, ...info: any[]): asserts assertion {
    // console.assert(assertion, ...info);
    if (!assertion) {
        throw new Error(["Assertion failed!", ...info as [string]].join(" "));
    }
}

export default assert;
