//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

import { route } from "quasar/wrappers";
import {
    createMemoryHistory,
    createRouter,
    createWebHashHistory,
    createWebHistory
} from "vue-router";
import { applicationStore } from "@Stores/index";
import routes from "./routes";

function firstTimeSetupIsNeeded(): boolean {
    const hasCompletedSetup = window.localStorage.getItem("hasCompletedSetup");
    return !hasCompletedSetup;
}

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(() => {
    // eslint-disable-next-line no-nested-ternary
    const createHistory = process.env.SERVER
        ? createMemoryHistory
        : process.env.VUE_ROUTER_MODE === "history" ? createWebHistory : createWebHashHistory;

    const Router = createRouter({
        scrollBehavior: () => ({ left: 0, top: 0 }),
        routes,

        // Leave this as is and make changes in quasar.conf.js instead!
        // quasar.conf.js -> build -> vueRouterMode
        // quasar.conf.js -> build -> publicPath
        history: createHistory(
            process.env.MODE === "ssr" ? void 0 : process.env.VUE_ROUTER_BASE
        )
    });

    Router.beforeEach((to): { name: string } | false | undefined => {
        // Note:
        // `return { path: string }` to navigate.
        // `return false` to cancel the current navigation.
        // `return undefined` to do nothing and continue the current navigation.
        // Redirect to First-Time-Setup if needed.
        if (
            firstTimeSetupIsNeeded()
            // Avoid an infinite redirect
            && to.path !== "/first-time-setup" && to.name !== "FirstTimeSetup"
        ) {
            if (to.path !== "/") {
                applicationStore.firstTimeWizard.pendingLocation = to.path;
            }
            return { name: "FirstTimeSetup" };
        }
        return undefined;
    });

    return Router;
});
