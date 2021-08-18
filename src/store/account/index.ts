//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

import { IRootState } from "../index";
import { Module, ActionTree, GetterTree, MutationTree } from "vuex";

// Base state
export interface IAccountState {
    connected: boolean;
    input: string | undefined ;
}
function state(): IAccountState {
    return {
        connected: false,
        input: undefined
    };
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

const AccountState: Module<IAccountState, IRootState> = {
    namespaced: true,
    state,
    actions,
    getters,
    mutations
};

export default AccountState;
