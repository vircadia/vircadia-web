/*
//  explore.js
//
//  Created by Madders on June 3rd, 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

// System Modules
const axios = require('axios');
// General Modules
import Log from '../debugging/log.js';

export class Explore {
    constructor (store, prop) {
        this.retrievePlaces = (metaverse) => {
            return new Promise(function (resolve, reject) {
                axios.get(metaverse + '/api/v1/places/')
                    .then((response) => {
                        Log.print('EXPLORE', 'INFO', 'Retrieved places.');
                        resolve(response.data);
                    }, (error) => {
                        Log.print('EXPLORE', 'INFO', 'Failed to retrieve places.');
                        if (error.response && error.response.data) {
                            reject(error.response.data);
                        } else {
                            reject('Unknown reason.');
                        }
                    });
            });
        };
    }
}
