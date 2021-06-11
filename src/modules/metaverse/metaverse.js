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

        // #region Login & Registration

        this.commitLogin = (username, result) => {
            Log.print('METAVERSE', 'INFO', 'Committing login.');

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
                    refreshToken: null,
                    // Profile
                    images: {
                        hero: null,
                        tiny: null,
                        thumbnail: null
                    }
                }
            });
        };

        // #endregion Login & Registration

        // #region People

        this.People = {
            retrieveAccount: (metaverse, userIdentifier) => {
                const apiToRequest = (store.state.account.isLoggedIn ? 'account' : 'profile');

                return new Promise(function (resolve, reject) {
                    axios.get(metaverse + '/api/v1/' + apiToRequest + '/' + userIdentifier, {
                        headers: {
                            // This function is called immediately after login, the accessToken is not applied to the headers yet.
                            // So, we wil do it manually.
                            Authorization: 'Bearer ' + store.state.account.accessToken
                        },
                        params: {
                            'asAdmin': store.state.account.useAsAdmin
                        }
                    })
                        .then((response) => {
                            Log.print('PEOPLE', 'INFO', 'Retrieved info for ' + userIdentifier + '.');
                            resolve(response.data);
                        }, (error) => {
                            Log.print('PEOPLE', 'ERROR', 'Failed to retrieve info for ' + userIdentifier + '.');
                            if (error.response && error.response.data) {
                                reject(error.response.data);
                            } else {
                                reject('Unknown reason.');
                            }
                        });
                });
            }
        };

        // #endregion People

        // #region Places

        this.Places = {
            retrievePlaces: (metaverse) => {
                return new Promise(function (resolve, reject) {
                    // TODO: Add query to params.
                    axios.get(metaverse + '/api/v1/places')
                        .then((response) => {
                            Log.print('PLACES', 'INFO', 'Retrieved list of places.');
                            resolve(response.data);
                        }, (error) => {
                            Log.print('PLACES', 'ERROR', 'Failed to retrieve list of places.');
                            if (error.response && error.response.data) {
                                reject(error.response.data);
                            } else {
                                reject('Unknown reason.');
                            }
                        });
                });
            }
        };
        
        // #endregion Places
    };

    // #region Login & Registration

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
                    Log.print('METAVERSE', 'ERROR', 'Failed to login as ' + username + ': ' + JSON.stringify(error.response.data));
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
                    Log.print('METAVERSE', 'ERROR', 'Registration as ' + username + ' failed: ' + JSON.stringify(error.response.data));
                    if (error.response && error.response.data) {
                        reject(error.response.data);
                    } else {
                        reject('Unknown reason.');
                    }
                });
        });
    };
    
    // #endregion Login & Registration
}
