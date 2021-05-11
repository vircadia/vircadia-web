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
                input: {
                    hasCapturePermissions: false,
                    selected: null // object
                }
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
                if (!payload.update) {
                    state[payload.property] = payload.with;
                } else {
                    for (var item in payload.with) {
                        if (Object.prototype.hasOwnProperty.call(state[payload.property], item)) {
                            state[payload.property][item] = payload.with[item];
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
