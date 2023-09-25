//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

import { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
    {
        name: "Primary",
        path: "/",
        component: () => import("layouts/MainLayout.vue")
    },
    {
        name: "FirstTimeSetup",
        path: "/first-time-setup",
        component: () => import("pages/FirstTimeSetup.vue")
    },
    {
        path: "/:location*",
        component: () => import("layouts/MainLayout.vue")
    },

    // Always leave this as last one,
    // but you can also remove it
    {
        path: "/:catchAll(.*)*",
        component: () => import("pages/Error404.vue")
    }
];

export default routes;
