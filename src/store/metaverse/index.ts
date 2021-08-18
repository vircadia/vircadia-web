//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

import { StateInterface } from "../index";
import { Module, ActionTree, GetterTree, MutationTree } from "vuex";

// Base state
export interface MetaverseStateInterface {
    name: string;
    nickname: string;
    server: string;
    iceServer: string | undefined ;
    serverVersion: string | undefined ;
}
function state(): MetaverseStateInterface {
    return {
        name: "",
        nickname: "",
        server: "https://metaverse.vircadia.com/live",
        iceServer: undefined,
        serverVersion: undefined
    };
}

// Getters
const getters: GetterTree<MetaverseStateInterface, StateInterface> = {
    someGetter(/* context */) {
        // your code
    }
};

// Actions
const actions: ActionTree<MetaverseStateInterface, StateInterface> = {
    someAction(/* context */) {
        // your code
    }
};

// Mutations
const mutations: MutationTree<MetaverseStateInterface> = {
    someMutation(/* state: MetaverseStateInterface */) {
        // your code
    }
};

const MetaverseModule: Module<MetaverseStateInterface, StateInterface> = {
    namespaced: true,
    state,
    actions,
    getters,
    mutations
};

export default MetaverseModule;
