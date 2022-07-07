/*
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

import axios from "axios";

import { MetaverseMgr } from "@Modules/metaverse";
import { doAPIGet, doAPIPost, buildUrl, findErrorMsg } from "@Modules/metaverse/metaverseOps";
import { OAuthTokenAPI, OAuthTokenResp, OAuthTokenError } from "@Modules/metaverse/APIToken";
import { GetAccountByIdAPI, GetAccountByIdResp,
    PostUsersAPI, PostUsersReq, PostUsersResp } from "@Modules/metaverse/APIAccount";
import { AccountInfo } from "@Modules/metaverse/APIInfo";
import { SignalEmitter } from "@vircadia/web-sdk";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Config } from "@Base/config";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Log from "@Modules/debugging/log";

// ESLint thinks there are race conditions which don't exist (:fingers-crossed:)
/* eslint-disable require-atomic-updates */

// number of milliseconds in a second
const msinsec = 1000;
const guestAccountName = "Guest";

export interface onAttributeChangePayload {
    isLoggedIn: boolean,
    isAdmin: boolean,
    accountName: string,
    id: string,
    accessToken: string,
    accessTokenType: string,
    accessTokenExpiration: Date,
    refreshToken: string,
    scope: string,
    roles: string[],
    createdAt: Date,
    accountInfo: AccountInfo
}
export interface onAccessTokenChangePayload {
    token: string,
    tokenType: string
}

export const Account = {
    // Account information related to login and access
    isLoggedIn: false,
    accountName: guestAccountName,
    id: "UNKNOWN",
    accessToken: undefined as Nullable<string>,
    accessTokenType: undefined as Nullable<string>,
    accessTokenExpiration: undefined as unknown as Date,
    refreshToken: undefined as Nullable<string>,
    scope: undefined as unknown as string,
    roles: [] as string[],
    createdAt: undefined as unknown as Date,

    // Additional account information (images and such)
    accountInfo: {} as AccountInfo,

    // Signal emitted when various account attributes change
    onAttributeChange: new SignalEmitter(),

    /**
     * Login the account and update the account profile information.
     *
     * If the metaverse is connected and the user is not logged in already,
     * do the metaverse-server request to fetch an access token for the account.
     * This also fetches the account information and updates the Vuex store.
     *
     * @param {string} pUsername Username to login
     * @param {string} pPassword Password of user to login
     * @returns 'true' if login succeeded.
     */
    async login(pUsername: string, pPassword: string): Promise<boolean> {
        if (MetaverseMgr.ActiveMetaverse?.isConnected && !Account.isLoggedIn) {
            try {
                // Log.debug(Log.types.ACCOUNT, `Login: ${pUsername}`);
                const params = new URLSearchParams();
                params.append("grant_type", "password");
                params.append("username", pUsername);
                params.append("password", pPassword);

                const loginUrl = buildUrl(OAuthTokenAPI);
                const resp = await axios.post(loginUrl, params);
                if (resp.data) {
                    const maybeError = resp.data as unknown as OAuthTokenError;
                    if (maybeError.error) {
                        Log.error(Log.types.ACCOUNT, `Login failure. User ${pUsername}`);
                        return false;
                    }
                    const loginResp = resp.data as unknown as OAuthTokenResp;
                    // Log.debug(Log.types.ACCOUNT, `Login: success: ${JSON.stringify(loginResp)}`);
                    Account.accountName = loginResp.account_name;
                    Account.id = loginResp.account_id;
                    Account.accessToken = loginResp.access_token;
                    Account.accessTokenType = loginResp.token_type;
                    Account.accessTokenExpiration = new Date(Date.now() + loginResp.expires_in * msinsec);
                    Account.refreshToken = loginResp.refresh_token;
                    Account.scope = loginResp.scope;
                    Account.roles = loginResp.account_roles ?? [];
                    Account.createdAt = new Date(Date.now() + loginResp.created_at * msinsec);

                    Account.isLoggedIn = true;

                    // Fetch and update all the visible account info
                    await Account.updateAccountInfo();
                    return true;
                }
            } catch (err) {
                const errr = findErrorMsg(err);
                Log.error(Log.types.ACCOUNT, `Exception while attempting to login user ${pUsername}: ${errr}`);
                return false;
            }
        } else {
            Log.error(Log.types.ACCOUNT, `Attempt to login when metaverse not connected: ${pUsername}`);
        }
        return false;
    },

    _emitAttributeChange(): void {
        Log.debug(Log.types.ACCOUNT, `emitAttributeChange:`);
        Account.onAttributeChange.emit({
            isLoggedIn: Account.isLoggedIn,
            isAdmin: "admin" in Account.roles,
            accountName: Account.accountName,
            id: Account.id,
            accessToken: Account.accessToken,
            accessTokenType: Account.accessTokenType,
            accessTokenExpiration: Account.accessTokenExpiration,
            refreshToken: Account.refreshToken,
            scope: Account.scope,
            roles: Account.roles,
            createdAt: Account.createdAt,
            accountInfo: Account.accountInfo
        });
    },

    /**
     * Fetch the current account information and emit changed events
     */
    async updateAccountInfo(): Promise<void> {
        // Fetch account profile information
        try {
            const acctInfo = await doAPIGet(GetAccountByIdAPI + Account.id) as GetAccountByIdResp;
            Account.accountInfo = acctInfo.account;

            // Update the Account local vars in case anything changed
            Account.accountName = acctInfo.account.username;
            Account.roles = acctInfo.account.roles;

            // Tell the world about the changes
            Account._emitAttributeChange();
        } catch (err) {
            const errr = findErrorMsg(err);
            Log.error(Log.types.ACCOUNT, `Exception fetching account Info: ${Account.accountName}: ${errr}`);
        }
    },

    async createAccount(pUsername: string, pPassword: string, pEmail: string): Promise<boolean> {
        const req = {
            username: pUsername,
            password: pPassword,
            email: pEmail
        } as PostUsersReq;
        try {
            const resp = await doAPIPost(PostUsersAPI, req) as PostUsersResp;
            Account.accountName = resp.username;
            Account.id = resp.accountId;

            return resp.accountAwaitingVerification;
        } catch (err) {
            const errr = findErrorMsg(err);
            Log.error(Log.types.ACCOUNT, `Exception creating account: ${pUsername}: ${errr}`);
            return false;
        }
    },

    // eslint-disable-next-line @typescript-eslint/require-await
    async logout(): Promise<void> {
        Account.accountName = guestAccountName;
        Account.accountInfo = {} as AccountInfo;
        Account.isLoggedIn = false;
        Account.accessToken = "UNKNOWN";
        Account._emitAttributeChange();
    }
};
