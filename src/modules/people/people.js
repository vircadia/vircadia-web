/*
//  people.js
//
//  Created by Kalila L. on May 19th, 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

export class People {
    constructor (store, prop) {
        this.retrieveAccount = (metaverse, userIdentifier) => {
            let parameters = window.$.param({
                'asAdmin': store.account.useAsAdmin
            });
            parameters = '?' + parameters;

            const apiToRequest = (store.account.isLoggedIn ? 'account' : 'profile');

            return new Promise(function (resolve, reject) {
                window.$.ajax({
                    type: 'GET',
                    url: metaverse + '/api/v1/' + apiToRequest + '/' + userIdentifier + parameters
                })
                    .done(function (data, status, xhr) {
                        resolve(data);
                    })
                    .fail(function (xhr, status, errorThrown) {
                        console.info('Failed to retrieve', apiToRequest, xhr.responseJSON);
                        reject(xhr.responseJSON);
                    });
            });
        };
    }

    retrieveAccount (metaverse, userIdentifier) {
        this.retrieveAccount(metaverse, userIdentifier);
    };
}
