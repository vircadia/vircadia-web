//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

import { IRootState } from "../index";
import { Module, ActionTree, GetterTree, MutationTree } from "vuex";

export interface IAccountState {
    username: string;
    isLoggedIn: boolean;
    input: Nullable<string>;
    // Token data
    accessToken: string;
    tokenType: string;
    scope: string;
    // Options
    isAdmin: boolean;
    useAsAdmin: boolean;
    // Profile
    images: {
        hero?: string;
        tiny?: string;
        thumbnail?: string;
    }
}

// Getters
const getters: GetterTree<IAccountState, IRootState> = {
    someGetter(/* context */) {
        // your code
    }
};

// Actions
const actions: ActionTree<IAccountState, IRootState> = {
    someAction(/* context */) {
        // your code
    }
};

// Mutations
const mutations: MutationTree<IAccountState> = {
    someMutation(/* state: AccountStateInterface */) {
        // your code
    }
};

export const AccountModule: Module<IAccountState, IRootState> = {
    namespaced: true,
    state: () => ({
        username: "Guest",
        isLoggedIn: false,
        input: undefined,
        accessToken: "UNKNOWN",
        tokenType: "Bearer",
        scope: "UNKNOWN",

        isAdmin: false,
        useAsAdmin: false,

        images: {}
    }),
    actions,
    getters,
    mutations
};
