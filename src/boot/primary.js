//  primary.js
//
//  Created by Kalila L. on May 17th, 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

import { boot } from 'quasar/wrappers';

import Log from '../modules/debugging/log.js';

// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(({ app, store, router, Vue }) => {
    // MAIN APPLICATION INITIALIZATION

    const axios = require('axios');

    function initializeAxios () {
        Log.print('OTHER', 'INFO', 'Bootstrapping Axios.');

        axios.defaults.headers.common = {
            'x-vircadia-error-handle': 'badrequest',
            'Authorization': 'Bearer ' + store.state.account.accessToken
        };
    }

    // END MAIN APPLICATION INITIALIZATION

    // GLOBAL FUNCTIONS

    function checkNeedsTokenRefresh () {
        const currentTimestamp = Math.floor(new Date().getTime() / 1000); // in seconds
        const sessionExpirationTime = parseInt(store.state.account.createdAt) + parseInt(store.state.account.expiresIn);

        // console.info('createdAt', Object.prototype.toString.call(store.state.account.createdAt), 'expiresIn', Object.prototype.toString.call(store.state.account.expiresIn))
        // console.info('currentTimestamp', currentTimestamp, Object.prototype.toString.call(currentTimestamp))
        // console.info('sessionExpirationTime', sessionExpirationTime, Object.prototype.toString.call(sessionExpirationTime))

        return (currentTimestamp > sessionExpirationTime || (currentTimestamp - store.state.globalConsts.SAFETY_BEFORE_SESSION_TIMEOUT) > sessionExpirationTime);
    }

    function attemptRefreshToken () {
        return new Promise(function (resolve, reject) {
            axios.post(store.state.metaverseConfig.server + '/oauth/token', {
                grant_type: 'refresh_token',
                scope: store.state.account.scope,
                refresh_token: store.state.account.refreshToken
            })
                .then((response) => {
                    store.commit('mutate', {
                        update: true,
                        property: 'account',
                        with: {
                            isLoggedIn: true,
                            accessToken: response.access_token,
                            tokenType: response.token_type,
                            createdAt: response.created_at,
                            expiresIn: response.expires_in,
                            refreshToken: response.refresh_token,
                            scope: response.scope
                        }
                    });
                    Log.print('METAVERSE', 'INFO', 'Token refresh successful.');
                    resolve();
                }, (error) => {
                    // If this fails for any reason, the user must log back in.
                    Log.print('METAVERSE', 'WARN', 'Refresh failed.');
                    store.state.Metaverse.logout();

                    if (error.response && error.response.data) {
                        reject(error.response.data);
                    } else {
                        reject('Unknown reason.');
                    }
                });
        });
    }

    function parseFromStorage (item) {
        const retrievedItem = localStorage.getItem(item);

        if (retrievedItem !== null) {
            try {
                const attemptedParse = JSON.parse(retrievedItem);
                if (attemptedParse) {
                    return attemptedParse;
                }
            } catch (error) {
                // console.info('Error retrieving', item, 'from storage. Parsing error:', error);
                return retrievedItem;
            }
        } else {
            return retrievedItem;
        }
    }

    app.mixin({
        methods: {
            checkNeedsTokenRefresh: checkNeedsTokenRefresh,
            attemptRefreshToken: attemptRefreshToken,
            parseFromStorage: parseFromStorage,
            initializeAxios: initializeAxios
        }
    });

    // STORE FUNCTIONS

    function initStore () {
        const metaverseConfigItems = {
            // Metaverse Config
            server: localStorage.getItem('metaverseConfig.server') // string
        };

        if (metaverseConfigItems.server !== null) {
            Log.print('OTHER', 'INFO', 'Initializing metaverse configuration with: ' + JSON.stringify(metaverseConfigItems.server));

            store.commit('mutate', {
                update: true,
                property: 'metaverseConfig',
                with: {
                    server: metaverseConfigItems.server
                }
            });
        }

        const accountItems = {
            // Account / General Stuff
            isLoggedIn: parseFromStorage('isLoggedIn'), // bool
            isAdmin: parseFromStorage('isAdmin'), // bool
            useAsAdmin: parseFromStorage('useAsAdmin'), // bool
            username: localStorage.getItem('username'), // string
            accountId: localStorage.getItem('accountId'), // string
            metaverseServer: localStorage.getItem('metaverseServer'), // string
            // Account / Token Stuff
            accessToken: localStorage.getItem('accessToken'), // string
            refreshToken: localStorage.getItem('refreshToken'), // string
            tokenType: localStorage.getItem('tokenType'), // string
            createdAt: parseFromStorage('createdAt'), // int
            expiresIn: parseFromStorage('expiresIn'), // int
            scope: localStorage.getItem('scope') // string
        };

        store.commit('mutate', {
            property: 'account',
            with: accountItems
        });

        // const placesItems = {
        //     // Places / General Stuff
        //     showOnlyMine: parseFromStorage('showOnlyMine') // bool
        // };
        //
        // store.commit('mutate', {
        //     property: 'places',
        //     with: placesItems
        // });

        const dashboardConfig = {
            dashboardTheme: parseFromStorage('dashboardTheme') // int
        };

        store.commit('mutate', {
            property: 'dashboardConfig',
            with: dashboardConfig
        });

        store.commit('mutate', {
            property: 'initialized',
            with: true
        });
    }

    // END STORE FUNCTIONS

    // ROUTER CONTROLS

    router.beforeEach((to, from, next) => {
        // If the store has not yet been initialized...
        Log.print('OTHER', 'INFO', 'Is the store initialized? ' + store.state.initialized);
        if (store.state.initialized !== true) {
            Log.print('OTHER', 'INFO', 'Initializing store & Axios.');
            initStore();
            initializeAxios();
        }

        const requestedRoute = to;
        const isLoggedIn = store.state.account.isLoggedIn;

        // var query = Object.assign({}, requestedRoute.query);
        // if (query.page) {
        //     // Make the first letter uppercase in case we get e.g. 'places' instead of 'Places'.
        //     // var pageValue = query.page.substring(0, 1).toUpperCase() + query.page.substring(1);
        //     var pageValue = query.page;
        //     if (routerDebugging) console.info('?page parameter set for', pageValue);
        //     delete query.page;
        //     router.replace({ query });
        //     router.push({ path: pageValue });
        //     return;
        // }

        // Verify the user's session is still active.
        if (isLoggedIn && checkNeedsTokenRefresh()) {
            // If the session has expired... Attempt to refresh it.
            console.info('Token refresh needed, attempting to refresh token.');
            attemptRefreshToken();
        }

        // Good to go, send them on their way.
        console.info('All router guards cleared, attempting to continue route to', requestedRoute.name);
        next();
    });

    // END ROUTER CONTROLS
});
