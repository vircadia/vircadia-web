/*
//  metaverse.js
//
//  Created by Kalila L. on May 18th, 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

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
    };

    login (metaverse, username, password) {
        Log.print('METAVERSE', 'INFO', 'Attempting to login as ' + username + '.');
        return new Promise(function (resolve, reject) {
            window.$.ajax({
                type: 'POST',
                url: metaverse + '/oauth/token',
                contentType: 'application/x-www-form-urlencoded;charset=UTF-8',
                data: {
                    grant_type: 'password',
                    scope: 'owner', // as opposed to 'domain', we're asking for a user token
                    username: username,
                    password: password
                }
            })
                .done(function (data, status, xhr) {
                    Log.print('METAVERSE', 'INFO', 'Successfully got key and details for ' + username + ' from the Metaverse.');
                    resolve(data);
                })
                .fail(function (xhr, status, errorThrown) {
                    Log.print('METAVERSE', 'INFO', 'Failed to login as ' + username + ': ' + JSON.stringify(xhr.responseJSON));
                    reject(xhr.responseJSON);
                });
        });
    };

    commitLogin (username, result) {
        this.commitLogin(username, result);
    };

    async register (metaverse, username, email, password) {
        Log.print('METAVERSE', 'INFO', 'Attempting to register as ' + username + '.');

        const objectToPost = {
            'user': {
                'username': username,
                'email': email,
                'password': password
            }
        };

        return new Promise(function (resolve, reject) {
            window.$.ajax({
                type: 'POST',
                url: metaverse + '/api/v1/users',
                contentType: 'application/json',
                data: JSON.stringify(objectToPost)
            })
                .done(function (data, status, xhr) {
                    Log.print('METAVERSE', 'INFO', 'Registered successfully as ' + username + '.');
                    resolve(data);
                })
                .fail(function (xhr, status, errorThrown) {
                    Log.print('METAVERSE', 'INFO', 'Registration as ' + username + ' failed: ' + JSON.stringify(xhr.responseJSON));
                    reject(xhr.responseJSON);
                });
        });
    };
}
