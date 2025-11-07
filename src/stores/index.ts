//
//  stores/index.ts
//
//  Created by Giga on 30 May 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { store } from "quasar/wrappers";
import { createPinia } from "pinia";
import { Router } from "vue-router";
import { useApplicationStore } from "@Stores/application-store";
import { useUserStore } from "@Stores/user-store";
import { Account } from "@Modules/account";

/*
 * When adding new properties to stores, you should also
 * extend the `PiniaCustomProperties` interface.
 * @see https://pinia.vuejs.org/core-concepts/plugins.html#typing-new-store-properties
 */
declare module "pinia" {
    export interface PiniaCustomProperties {
        readonly router: Router;
    }
}

export const pinia = createPinia();

export const applicationStore = useApplicationStore(pinia);

export const userStore = useUserStore(pinia);

// Hydrate runtime Account singleton from persisted userStore after refresh
// so API requests include Authorization immediately.
(() => {
    const persisted = userStore.account;
    const hasToken = typeof persisted?.accessToken === "string" && persisted.accessToken.length > 0;
    if (persisted?.isLoggedIn && hasToken) {
        Account.isLoggedIn = true;
        Account.accountName = persisted.username ?? Account.accountName;
        Account.id = persisted.id ?? Account.id;
        Account.accessToken = persisted.accessToken;
        Account.accessTokenType = persisted.tokenType ?? "Bearer";
        Account.scope = persisted.scope ?? Account.scope;
        // Reflect admin flag into roles array best-effort (roles not persisted in userStore)
        if (persisted.isAdmin) {
            if (!Account.roles.includes("admin")) Account.roles.push("admin");
        }
        // Notify listeners that Account is ready after hydration
        Account.onAttributeChange.emit({
            isLoggedIn: Account.isLoggedIn,
            isAdmin: Account.roles.includes("admin"),
            accountName: Account.accountName,
            id: Account.id,
            accessToken: Account.accessToken,
            accessTokenType: Account.accessTokenType,
            accessTokenExpiration: Account.accessTokenExpiration,
            refreshToken: Account.refreshToken,
            scope: Account.scope as string,
            roles: Account.roles,
            createdAt: Account.createdAt,
            accountInfo: Account.accountInfo
        });
    }
})();

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default store((/* { ssrContext } */) => pinia);
