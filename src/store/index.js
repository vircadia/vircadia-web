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
                // APP_VERSION: process.env.VUE_APP_VERSION
                APP_VERSION: '0.0.1'
            },
            debugging: {
            },
            notifications: {
            },
            audio: {
                input: null // A class is mounted onto this in MainLayout.vue
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
            }
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
