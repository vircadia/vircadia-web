/*
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

/**
 * Metaverse-server account operations.
 */

// GET /api/metaverse_info
export const MetaverseInfoAPI = "/api/metaverse_info";
export interface MetaverseInfoResponse {
    "metaverse_name": string,
    "metaverse_nick_name": string,
    "metaverse_url": string,
    "jitsi_server_domain": string,
    "ice_server_url": string,
    "metaverse_server_version": {
        "npm-package-version": string,
        "git-commit": string,
        "version-tag": string
    }
}

// GET /api/v1/account
import { AccountInfo } from "@Modules/metaverse/APIInfo";

export const GetAccountAPI = "/api/v1/account";
export interface GetAccountResponse {
    "accounts": AccountInfo[]
}

// GET /api/v1/account/{accountId}
// (Note slash at end to make construction easier: "GetAccountByIdAPI + ID")
export const GetAccountByIdAPI = "/api/v1/account/"; // add "/accountId"
export interface GetAccountByIdResponse {
    "account": AccountInfo
}

// POST /api/v1/users
// Create account
export const PostUsersAPI = "/api/v1/users";
export interface PostUsersRequest extends KeyedCollection {
    "username": string,
    "password": string,
    "email": string
}
export interface PostUsersResponse {
    "accountId": string,
    "username": string,
    "accountIsActive": boolean,
    "accountAwaitingVerification": boolean
}
