//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

import { IRootState } from "../index";
import { Module, ActionTree, GetterTree, MutationTree } from "vuex";

// Base state
export interface IMetaverseState {
    name: string;
    nickname: string;
    server: string;
    iceServer: string | undefined ;
    serverVersion: string | undefined ;
}
function state(): IMetaverseState {
    return {
        name: "",
        nickname: "",
        server: "https://metaverse.vircadia.com/live",
        iceServer: undefined,
        serverVersion: undefined
    };
}

// Getters
const getters: GetterTree<IMetaverseState, IRootState> = {
    someGetter(/* context */) {
        // your code
    }
};

// Actions
const actions: ActionTree<IMetaverseState, IRootState> = {
    someAction(/* context */) {
        // your code
    }
};

// Mutations
const mutations: MutationTree<IMetaverseState> = {
    someMutation(/* state: IMetaverseState */) {
        // your code
    }
};

export const MetaverseModule: Module<IMetaverseState, IRootState> = {
    namespaced: true,
    state,
    actions,
    getters,
    mutations
};

export default MetaverseModule;
