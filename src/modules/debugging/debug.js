/*
//  debug.js
//
//  Created by Kalila L. on June 9th, 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

import Log from "./log.js";

const Debug = (function() {
    function error(type, string) {
        Log.print(type, "ERROR", string);
    }

    return {
        error
    };
}());

export default Debug;
