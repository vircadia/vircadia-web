//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

import { IRootState } from "../index";
import { Module, ActionTree, GetterTree, MutationTree } from "vuex";

// Base state
export interface IRendererState {
    name: string;
    nickname: string;
    server: string;
    iceServer: string | undefined ;
    serverVersion: string | undefined ;
}
function state(): IRendererState {
    return {
        name: "",
        nickname: "",
        server: "https://metaverse.vircadia.com/live",
        iceServer: undefined,
        serverVersion: undefined
    };
}

// Getters
const getters: GetterTree<IRendererState, IRootState> = {
    someGetter(/* context */) {
        // your code
    }
};

// Actions
const actions: ActionTree<IRendererState, IRootState> = {
    someAction(/* context */) {
        // your code
    }
};

// Mutations
const mutations: MutationTree<IRendererState> = {
    someMutation(/* state: IRendererState */) {
        // your code
    }
};

export const RendererModule: Module<IRendererState, IRootState> = {
    namespaced: true,
    state,
    actions,
    getters,
    mutations
};

export default RendererModule;
