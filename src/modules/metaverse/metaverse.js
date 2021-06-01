/*
//  metaverse.js
//
//  Created by Kalila L. on May 18th, 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

// System Modules
const axios = require('axios');
// General Modules
import Log from '../debugging/log.js';

export class Metaverse {
    constructor (store, prop) {
        console.info('constructed', store, prop);

        this.commitLogin = (username, result) => {
            Log.print('METAVERSE', 'INFO', 'Committing login.');
            console.info('result', result);
            const checkIsAdmin = result.account_roles.includes('admin');

            store.commit('mutate', {
                update: true,
                property: 'account',
                with: {
                    isLoggedIn: true,
                    isAdmin: checkIsAdmin,
                    username: username,
                    accountRoles: result.account_roles,
                    accountId: result.account_id,
                    metaverseServer: store.state.metaverseConfig.server,
                    accessToken: result.access_token,
                    refreshToken: result.refresh_token,
                    tokenType: result.token_type,
                    createdAt: result.created_at,
                    expiresIn: result.expires_in,
                    scope: result.scope
                }
            });
        };

        this.logout = () => {
            store.commit('mutate', {
                update: true,
                property: 'account',
                with: {
                    username: null,
                    isLoggedIn: false,
                    isAdmin: false,
                    accessToken: null,
                    refreshToken: null
                }
            });
        };
    };

    login (metaverse, username, password) {
        Log.print('METAVERSE', 'INFO', 'Attempting to login as ' + username + '.');

        return new Promise(function (resolve, reject) {
            axios.post(metaverse + '/oauth/token', {
                grant_type: 'password',
                scope: 'owner', // as opposed to 'domain', we're asking for a user token
                username: username,
                password: password
            })
                .then((response) => {
                    Log.print('METAVERSE', 'INFO', 'Successfully got key and details for ' + username + ' from the Metaverse.');
                    resolve(response.data);
                }, (error) => {
                    Log.print('METAVERSE', 'INFO', 'Failed to login as ' + username + ': ' + JSON.stringify(error.response.data));
                    if (error.response && error.response.data) {
                        reject(error.response.data);
                    } else {
                        reject('Unknown reason.');
                    }
                });
        });
    };

    register (metaverse, username, email, password) {
        Log.print('METAVERSE', 'INFO', 'Attempting to register as ' + username + '.');

        return new Promise(function (resolve, reject) {
            axios.post(metaverse + '/api/v1/users', {
                user: {
                    'username': username,
                    'email': email,
                    'password': password
                }
            })
                .then((response) => {
                    Log.print('METAVERSE', 'INFO', 'Registered successfully as ' + username + '.');
                    resolve(response.data);
                }, (error) => {
                    Log.print('METAVERSE', 'INFO', 'Registration as ' + username + ' failed: ' + JSON.stringify(error.response.data));
                    if (error.response && error.response.data) {
                        reject(error.response.data);
                    } else {
                        reject('Unknown reason.');
                    }
                });
        });
    };
}
