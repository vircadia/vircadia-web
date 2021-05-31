/*
//  people.js
//
//  Created by Kalila L. on May 19th, 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

// System Modules
const axios = require('axios');
// General Modules
import Log from '../debugging/log.js';

export class People {
    constructor (store, prop) {
        this.retrieveAccount = (metaverse, userIdentifier) => {
            let parameters = window.$.param({
                'asAdmin': store.account.useAsAdmin
            });
            parameters = '?' + parameters;

            const apiToRequest = (store.account.isLoggedIn ? 'account' : 'profile');

            return new Promise(function (resolve, reject) {
                axios.get(metaverse + '/api/v1/' + apiToRequest + '/' + userIdentifier + parameters)
                    .then((response) => {
                        Log.print('PEOPLE', 'DEBUG', 'Retrieved info for ' + userIdentifier + '.');
                        resolve(response.data);
                    }, (error) => {
                        Log.print('PEOPLE', 'DEBUG', 'Failed to retrieve info for ' + userIdentifier + '.');
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
