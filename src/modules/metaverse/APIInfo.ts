//
//  APIInfo.ts
//
//  Domain and Metaverse server interfaces and operations.
//
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/**
 * Account information returned by various account requests.
 */
export interface AccountInfo {
    "accountId": string,
    "username": string,
    "email": string,
    "availability": "all" | "friends" | "connections",
    "public_key": string,
    "images"?: {
        "hero"?: string,
        "thumbnail"?: string,
        "tiny"?: string
    },
    "location"?: {
        "connected": boolean,
        "path": string,
        "placeid": string,
        "domainid": string,
        "availability": "all" | "none" | "friends" | "connections",
        "friends": string[]
    },
    "profile_detail": KeyedCollection,
    "friends": string[],
    "connections": string[],
    "administrator": boolean,
    "enabled": boolean,
    "roles": string[],
    "when_account_created": string,
    "when_account_created_s": number,
    "time_of_last_heartbeat": string,
    "time_of_last_heartbeat_s": number
}

/**
 * Domain information returned by various domain requests.
 */
export interface DomainInfoV1 {
    "id": string,           // Legacy. Deprecated.
    "domainid": string,
    "name": string,
    "visibility": string,
    "world_name": string,   // Legacy. Deprecated.
    "label": string,        // Legacy. Deprecated.
    "public_key": string,
    "owner_places": PlaceInfo[],
    "sponsor_account_id": string,
    "ice_server_address": string,
    "version": string,
    "protocol_version": string,
    "network_addr": string,
    "network_port": string,
    "networking_mode": string,
    "restricted": boolean,
    "num_users": number,
    "anon_users": number,
    "total_users": number,
    "capacity": number,
    "description": string,
    "maturity": string,
    "restriction": string,
    "managers": string[],
    "tags": string[],
    "meta": {
        "capacity": number,
        "contact_info": string,
        "description": string,
        "images": string[],
        "managers": string[],
        "restriction": string,
        "tags": string[],
        "thumbnail": string,
        "world_name": string
    },
    "users": {
        "num_anon_users": number,
        "num_users": number,
        "user_hostnames": string[],
    }
    "time_of_last_heartbeat": string,
    "time_of_last_heartbeat_s": number,
    "last_sender_key": string,
    "addr_of_first_contact": string,
    "when_domain_entry_created": string
    "when_domain_entry_created_s": number
}

/**
 * Domain information returned by various domain requests.
 */
export interface DomainInfo {
    "id": string,
    "domainId": string,
    "name": string,
    "visibility": string,
    "capacity": number,
    "sponsorAccountId": string,
    "label": string,        // Legacy. Deprecated.
    "network_address": string,
    "network_port": string,
    "ice_server_address": string
    "version": string,
    "protocol_version": string,
    "active": boolean,
    "num_users": number,
    "time_of_last_heartbeat": string,
    "time_of_last_heartbeat_s": number,
}

// GET /api/metaverse_info
export const MetaverseInfoAPI = "/api/metaverse_info";
/**
 * Metaverse information.
 */
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

/**
 * Information about a Place in the Metaverse.
 */
export interface PlaceInfo {
    "placeId": string,
    "id": string,
    "name": string,
    "visibility": string,
    "address": string,
    "path": string,
    "description": string,
    "maturity": string,
    "tags": string[],
    "managers": string[],
    "thumbnail"?: string,
    "images"?: string[],
    "current_attendance"?: number,
    "current_images"?: string[],
    "current_info"?: string,
    "current_last_update_time"?: string,
    "current_last_update_time_s"?: number,
    "last_activity_update": string,
    "last_activity_update_s": number
}
