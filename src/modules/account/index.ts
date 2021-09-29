/*
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

import axios from "axios";

import { Metaverse } from "@Modules/metaverse";
import { doAPIGet, doAPIPost } from "../metaverse/metaverseOps";
import { OAuthTokenAPI, OAuthTokenReq, OAuthTokenResp, OAuthTokenError } from "@Modules/metaverse/APIToken";
import { GetAccountByIdAPI, GetAccountByIdResp,
    PostUsersAPI, PostUsersReq, PostUsersResp } from "@Modules/metaverse/APIAccount";
import { AccountInfo } from "@Modules/metaverse/APIInfo";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Config } from "@Base/config";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Log from "@Modules/debugging/log";
import { Store, Mutations as StoreMutations } from "@Base/store";

// ESLint thinks there are race conditions which don't exist (:fingers-crossed:)
/* eslint-disable require-atomic-updates */

// number of milliseconds in a second
const msinsec = 1000;

export const Account = {
    isLoggedIn: false,
    accountName: "UNKNOWN",
    id: "UNKNOWN",
    accessToken: undefined as Nullable<string>,
    accessTokenType: undefined as Nullable<string>,
    accessTokenExpiration: undefined as unknown as Date,
    refreshToken: undefined as Nullable<string>,
    scope: undefined as unknown as string,
    roles: [] as string[],
    createdAt: undefined as unknown as Date,
    accountInfo: {} as AccountInfo,

    /**
     * Login the account and update the account profile information.
     *
     * If the metaverse is connected and the user is not logged in already,
     * do the metaverser-server request to fetch an access token for the account.
     * This also fetches the account information and updates the Vuex store.
     *
     * @param {string} pUsername Username to login
     * @param {string} pPassword Password of user to login
     * @returns 'true' if login succeeded.
     */
    async login(pUsername: string, pPassword: string): Promise<boolean> {
        const req = {
            "grant_type": "password",
            "username": pUsername,
            "password": pPassword
        } as OAuthTokenReq;

        if (Metaverse.connected && !Account.isLoggedIn) {
            try {
                const resp = await axios.post(OAuthTokenAPI, req);
                if (resp.data) {
                    const maybeError = resp.data as unknown as OAuthTokenError;
                    if (maybeError.error) {
                        Log.error(Log.types.ACCOUNT, `Login failure. User ${pUsername}`);
                        return false;
                    }
                    const loginResp = resp.data as unknown as OAuthTokenResp;
                    Account.accountName = loginResp.account_name;
                    Account.id = loginResp.account_id;
                    Account.accessToken = loginResp.access_token;
                    Account.accessTokenExpiration = new Date(Date.now() + loginResp.expires_in * msinsec);
                    Account.refreshToken = loginResp.refresh_token;
                    Account.scope = loginResp.scope;
                    Account.roles = loginResp.account_roles ?? [];
                    Account.createdAt = new Date(Date.now() + loginResp.created_at * msinsec);

                    Account.isLoggedIn = true;

                    // Fetch and update all the visible account info
                    await Account.updateAccountInfo();
                }
            } catch (err) {
                Log.error(Log.types.ACCOUNT, `Exception while attempting to log in as user ${pUsername}`);
                return false;
            }
        }
        return false;
    },

    /**
     * Fetch the current account information and update the Vuex store.
     */
    async updateAccountInfo(): Promise<void> {
        // Fetch account profile information
        const acctInfo = await doAPIGet(GetAccountByIdAPI + Account.id) as GetAccountByIdResp;
        Account.accountInfo = acctInfo.account;

        // Update the Account local vars in case anything changed
        Account.accountName = acctInfo.account.username;
        Account.roles = acctInfo.account.roles;

        // Update the Vuex variables
        Store.commit(StoreMutations.MUTATE, {
            "username": Account.accountName,
            "isLoggedIn": Account.isLoggedIn,
            "accessToken": Account.accessToken,
            "tokenType": Account.accessTokenType,
            "scope": Account.scope,
            "isAdmin": Account.roles.includes("admin"),
            "useAsAdmin": false
        });
        if (acctInfo.account.images) {
            Store.commit(StoreMutations.MUTATE, {
                "images": acctInfo.account.images
            });
        } else {
            Store.commit(StoreMutations.MUTATE, {
                "images": {}
            });
        }
    },

    async createAccount(pUsername: string, pPassword: string, pEmail: string): Promise<boolean> {
        const req = {
            username: pUsername,
            password: pPassword,
            email: pEmail
        } as PostUsersReq;
        const resp = await doAPIPost(PostUsersAPI, req) as PostUsersResp;
        Account.accountName = resp.username;
        Account.id = resp.accountId;

        return resp.accountAwaitingVerification;
    },

    // Remove the next 'disable' when the logout routine is completed
    // eslint-disable-next-line @typescript-eslint/require-await
    async logout(): Promise<void> {
        Store.commit(StoreMutations.MUTATE, {
            "property": "isLoggedIn",
            "value": false
        });
    }
};
