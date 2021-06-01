/*
//  log.js
//
//  Created by Kalila L. on May 10th, 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

const Log = (function () {
    const types = {
        'OTHER': {
            'prefix': '[OTHER]'
        },

        'ENTITIES': {
            'prefix': '[ENTITIES]'
        },

        'AUDIO': {
            'prefix': '[AUDIO]'
        },

        'METAVERSE': {
            'prefix': '[METAVERSE]'
        },

        'PEOPLE': {
            'prefix': '[PEOPLE]'
        }
    };

    const levels = {
        'ERROR': {
            'prefix': '[ERROR]'
        },

        'WARN': {
            'prefix': '[WARN]'
        },

        'INFO': {
            'prefix': '[INFO]'
        }
    };

    function print (type, level, string) {
        console.info(types[type].prefix, levels[level].prefix, string);
    };

    return {
        // Tables
        types,
        levels,
        // Functions
        print
    };
}());

export default Log;
