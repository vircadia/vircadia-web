//
//  APIAccount.ts
//
//  Metaverse server account operations.
//
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import type { AccountInfo } from "@Modules/metaverse/APIInfo";

// GET /api/v1/account
export const GetAccountAPI = "/api/v1/account";
export interface GetAccountResponse {
    "accounts": AccountInfo[]
}

// GET /api/v1/account/{accountId}
export const GetAccountByIdAPI = "/api/v1/account"; // Add "/{accountId}".
export interface GetAccountByIdResponse {
    "account": AccountInfo
}

// POST /api/v1/users
// Create an account.
export const PostUsersAPI = "/api/v1/users";
export interface PostUsersRequest extends KeyedCollection {
    "user": {
        "username": string,
        "password": string,
        "email": string
    }
}
export interface PostUsersResponse {
    "accountId": string,
    "username": string,
    "accountIsActive": boolean,
    "accountAwaitingVerification": boolean
}
