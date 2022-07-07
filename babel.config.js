/*
//  babel.config.js
//
//  Created by Kalila L. on May 9th, 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

/* eslint-env node */

module.exports = api => {
    return {
        presets: [
            [
                '@quasar/babel-preset-app',
                api.caller(caller => caller && caller.target === 'node')
                ? { targets: { node: 'current' } }
                : {}
            ]
        ]
    }
}
