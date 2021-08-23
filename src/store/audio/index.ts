//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

import { IRootState } from "../index";
import { Module, ActionTree, GetterTree, MutationTree } from "vuex";

// Base state
export interface IAudioState {
    connected: boolean;
    input: {
        hasInputAccess: boolean;
        requestInputAccess: () => MediaStream;
        requestSpecificInputAccess: (pDevice:string) => MediaStream;
        currentInputDevice: string;
        inputsList: MediaDeviceInfo[];
    },
}

function state(): IAudioState {
    return {
        connected: false,
        input: {
            // TODO: stubs to make compile work. Replace with Audio module class
            hasInputAccess: false,
            requestInputAccess: function() {
                return null as unknown as MediaStream;
            },
            requestSpecificInputAccess: function() {
                return null as unknown as MediaStream;
            },
            currentInputDevice: "UNKNOWN",
            inputsList: []
        }
    };
}

// Getters
const getters: GetterTree<IAudioState, IRootState> = {
    someGetter(/* context */) {
        // your code
    }
};

// Actions
const actions: ActionTree<IAudioState, IRootState> = {
    someAction(/* context */) {
        // your code
    }
};

// Mutations
const mutations: MutationTree<IAudioState> = {
    someMutation(/* state: IAudioState */) {
        // your code
    }
};

export const AudioModule: Module<IAudioState, IRootState> = {
    namespaced: true,
    state,
    actions,
    getters,
    mutations
};

export default AudioModule;
