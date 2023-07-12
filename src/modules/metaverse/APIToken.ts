//
//  APIToken.ts
//
//  Metaverse server token operations.
//
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

// OAuth interface for login.
// Does not return a standard APIResponse
export const OAuthTokenAPI = "/oauth/token";
export interface OAuthTokenRequest {
    "grant_type": "password",
    "username": string,
    "password": string
}

export interface OAuthTokenResponse {
    "access_token": string,
    "token_type": "Bearer",
    "expires_in": number,
    "refresh_token": string,
    "scope": string,
    "created_at": number,
    "account_name": string,
    "account_roles": string[],
    "account_id": string
}

// If an OAuth operation error, this body is returned
export interface OAuthTokenError {
    "error": string
}
