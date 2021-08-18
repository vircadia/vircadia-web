//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

import { StateInterface } from "../index";
import { Module, ActionTree, GetterTree, MutationTree } from "vuex";

// Base state
export interface AudioStateInterface {
    connected: boolean;
    input: string | undefined ;
}
function state(): AudioStateInterface {
    return {
        connected: false,
        input: undefined
    };
}

// Getters
const getters: GetterTree<AudioStateInterface, StateInterface> = {
    someGetter(/* context */) {
        // your code
    }
};

// Actions
const actions: ActionTree<AudioStateInterface, StateInterface> = {
    someAction(/* context */) {
        // your code
    }
};

// Mutations
const mutations: MutationTree<AudioStateInterface> = {
    someMutation(/* state: AudioStateInterface */) {
        // your code
    }
};

const AudioModule: Module<AudioStateInterface, StateInterface> = {
    namespaced: true,
    state,
    actions,
    getters,
    mutations
};

export default AudioModule;
