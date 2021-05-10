/*
//  entities.js
//
//  Created by Kalila L. on May 10th, 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

/* eslint-disable */

import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';

import Log from '../debugging/log.js';

const Entities = (function () {
    function add (properties, entityHostType, scene) {
        // addEntity.apply(this, arguments);
        addEntity(properties, entityHostType, scene);
    }

    return {
        add
    };
}());

export default Entities;

function addEntity (properties, entityHostType, scene) {
    if (!properties.type) {
        Log.print('ENTITIES', 'ERROR', 'Failed to specify entity type.');
        return false;
    }

    Log.print('ENTITIES', 'INFO', 'Success!');
}
