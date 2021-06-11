/*
//  explore.js
//
//  Created by Madders on June 3rd, 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

export class Explore {
    constructor (store, prop) {
        this.retrievePlaces = () => {
            return new Promise(function (resolve, reject) {
                store.state.Metaverse.Places.retrievePlaces(
                    store.state.account.metaverseServer
                ).then((result) => {
                    resolve(result.data.places);
                });
            });
        };
    }
}
