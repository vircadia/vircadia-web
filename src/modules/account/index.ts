/*
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

import { MetaverseManager } from "@Modules/metaverse";
import { API } from "@Modules/metaverse/API";
import type { OAuthTokenResponse, OAuthTokenError } from "@Modules/metaverse/APIToken";
import type { GetAccountByIdResponse, PostUsersRequest, PostUsersResponse } from "@Modules/metaverse/APIAccount";
import type { AccountInfo } from "@Modules/metaverse/APIInfo";
import { SignalEmitter } from "@vircadia/web-sdk";
import Log, { findErrorMessage } from "@Modules/debugging/log";

// ESLint thinks there are race conditions which don't exist (:fingers-crossed:)
/* eslint-disable require-atomic-updates */

// Number of milliseconds in a second.
const oneSecond = 1000;
// The default account name.
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
    // Account information related to login and access.
    isLoggedIn: false,
    accountName: guestAccountName,
    id: "UNKNOWN",
    accessToken: undefined as Nullable<string>,
    accessTokenType: undefined as Nullable<string>,
    accessTokenExpiration: undefined as unknown as Date,
    refreshToken: undefined as Nullable<string>,
    accountAwaitingVerification: false,
    scope: undefined as unknown as string,
    roles: [] as string[],
    createdAt: undefined as unknown as Date,

    // Additional account information (images, etc).
    accountInfo: {} as AccountInfo,

    // Signal emitted when any account attributes change.
    onAttributeChange: new SignalEmitter(),

    /**
     * Login the account and update the account profile information.
     *
     * If the metaverse is connected and the user is not logged in already,
     * fetch an access token for the account.
     * This also fetches the account information and updates the Store.
     *
     * @param {string} pUsername Username to login
     * @param {string} pPassword Password of user to login
     * @returns `true` if login succeeded, `false` if not.
     */
    async login(pUsername: string, pPassword: string): Promise<boolean> {
        // Prevent login attempts if the metaverse server is not connected.
        if (!MetaverseManager.activeMetaverse?.isConnected) {
            Log.error(
                Log.types.ACCOUNT,
                `Exception: Attempted to login to account "${pUsername}" when metaverse is not connected.`
            );
            return false;
        }

        // Prevent login attempts if an account is already logged in.
        if (Account.isLoggedIn) {
            Log.error(
                Log.types.ACCOUNT,
                `Exception: Attempted to login to account "${pUsername}" when an account is already logged in.`
            );
            return false;
        }

        // Attempt to login with the given credentials.
        try {
            const params = new FormData();
            params.append("grant_type", "password");
            params.append("username", pUsername);
            params.append("password", pPassword);

            const response = await API.post(API.endpoints.token, params) as OAuthTokenResponse | OAuthTokenError;

            if ("error" in response) {
                Log.error(Log.types.ACCOUNT, `Login failure for user: ${pUsername}. Error: ${response.error}`);
                return false;
            }

            Log.debug(Log.types.ACCOUNT, `Login success for user: ${pUsername}`);
            Account.accountName = response.account_name;
            Account.id = response.account_id;
            Account.accessToken = response.access_token;
            Account.accessTokenType = response.token_type;
            Account.accessTokenExpiration = new Date(Date.now() + response.expires_in * oneSecond);
            Account.refreshToken = response.refresh_token;
            Account.scope = response.scope;
            Account.roles = response.account_roles ?? [];
            Account.createdAt = new Date(Date.now() + response.created_at * oneSecond);

            Account.isLoggedIn = true;

            // Fetch and update all the visible account info.
            await Account.updateAccountInfo();
            return true;
        } catch (error) {
            const errorMessage = findErrorMessage(error);
            Log.error(Log.types.ACCOUNT, `Exception while attempting to login user ${pUsername}: ${errorMessage}`);
            return false;
        }
    },

    _emitAttributeChange(): void {
        Log.debug(Log.types.ACCOUNT, `emitAttributeChange:`);
        Account.onAttributeChange.emit({
            isLoggedIn: Account.isLoggedIn,
            isAdmin: Account.roles.includes("admin"),
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
     * Fetch all information for the currently logged in account and emit changed events.
     */
    async updateAccountInfo(): Promise<void> {
        // Skip fetching info if the account ID is "UNKNOWN", as this is designed to fail.
        if (Account.id === "UNKNOWN") {
            return;
        }
        // Fetch account profile information.
        try {
            const response = await API.get(API.endpoints.account + "/" + Account.id) as GetAccountByIdResponse;
            Account.accountInfo = response.account;

            // Update the Account local vars in case anything changed.
            Account.accountName = response.account.username;
            Account.roles = response.account.roles;

            // Tell the world about the changes.
            Account._emitAttributeChange();
        } catch (error) {
            const errorMessage = findErrorMessage(error);
            Log.error(Log.types.ACCOUNT, `Exception fetching account info for: ${Account.accountName}: ${errorMessage}`);
        }
    },

    /**
     * Create a new metaverse account.
     * @param pUsername The username for the new account.
     * @param pPassword The password for the new account
     * @param pEmail The email address for the new account.
     * @returns `true` once the new account is awaiting verification,
     * `false` if verification is not required or account creation failed.
     */
    async createAccount(pUsername: string, pPassword: string, pEmail: string): Promise<PostUsersResponse | false> {
        const request = {
            user: {
                username: pUsername,
                password: pPassword,
                email: pEmail
            }
        } as PostUsersRequest;
        try {
            const response = await API.post(API.endpoints.users, request) as PostUsersResponse;
            Account.accountName = response.username;
            Account.id = response.accountId;
            Account.accountAwaitingVerification = response.accountAwaitingVerification;
            return response;
        } catch (error) {
            const errorMessage = findErrorMessage(error);
            Log.error(Log.types.ACCOUNT, `Exception creating account: ${pUsername}: ${errorMessage}`);
            return false;
        }
    },

    /**
     * Log out of the current metaverse account.
     */
    logout(): void {
        const accountName = Account.accountName;
        Account.accountName = guestAccountName;
        Account.accountInfo = {} as AccountInfo;
        Account.isLoggedIn = false;
        Account.accessToken = "UNKNOWN";
        Account._emitAttributeChange();
        Log.info(Log.types.ACCOUNT, `Logged out of account: ${accountName}`);
    }
};
