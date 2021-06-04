/*
//  index.js
//
//  Created by Kalila L. on May 9th, 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

import { store } from 'quasar/wrappers';
import { createStore } from 'vuex';
import packageInfo from '../../package.json';

/*
* If not building with SSR mode, you can
* directly export the Store instantiation;
*
* The function below can be async too; either use
* async/await or return a Promise which resolves
* with the Store instance.
*/

export default store(function (/* { ssrContext } */) {
    const Store = createStore({
        modules: {
            // example
        },

        state: {
            globalConsts: {
                APP_NAME: packageInfo.productName,
                APP_VERSION: packageInfo.version,
                SAFETY_BEFORE_SESSION_TIMEOUT: 21600 // If a token has 6 or less hours left on its life, refresh it.
            },
            metaverseConfig: { // Prefilled with initial values
                name: '',
                nickname: '',
                server: 'https://metaverse.vircadia.com/live', // This needs to at least be pre-filled in order to get all other config information.
                iceServer: '',
                serverVersion: ''
            },
            account: {
                isLoggedIn: false, // bool
                isAdmin: false, // bool
                username: null, // string
                accountRoles: null, // array
                accountId: null, // string
                metaverseServer: null, // string
                // Token data
                accessToken: null, // string
                refreshToken: null, // string
                tokenType: null, // string
                createdAt: null, // int
                expiresIn: null, // int
                scope: null, // string
                // Options
                useAsAdmin: false, // bool
                // Profile
                images: {
                    hero: null, // string
                    tiny: null, // string
                    thumbnail: null // string
                }
            },
            profile: {
                displayName: ''
            },
            dialog: {
                show: false,
                which: '',
                notice: {
                    title: '',
                    message: ''
                }
            },
            error: {
                title: '',
                code: '',
                full: ''
            },
            dashboardConfig: {
                dashboardTheme: 2 // int
            },
            debugging: {
            },
            notifications: {
            },
            renderer: {
                canvases: [
                    {
                        canvas: null
                    }
                ]
            },
            location: {
                current: '',
                state: 'Not Connected'
            },
            // Mounted Classes - mounted from MainLayout.vue
            Audio: {
                input: null
            },
            Metaverse: null
        },

        mutations: {
            mutate (state, payload) {
                const segments = payload.property.split('.');
                let base = state;
                while (segments.length > 1) {
                    const segment = segments.shift();
                    if (!(segment in base)) base[segment] = {};
                    base = base[segment];
                }
                const prop = segments[0];

                if (!payload.update || !(prop in base)) {
                    base[prop] = payload.with;
                } else {
                    for (const item in payload.with) {
                        if (Object.prototype.hasOwnProperty.call(payload.with, item)) {
                            base[prop][item] = payload.with[item];
                        }
                    }
                }

                // if (state.debugging) console.info('Payload:', payload.property, 'with:', payload.with, 'state is now:', this.state);
            }
        },

        // enable strict mode (adds overhead!)
        // for dev mode and --debug builds only
        strict: process.env.DEBUGGING
    });

    return Store;
});
