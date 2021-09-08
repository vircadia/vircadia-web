//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

import { IRootState } from "../index";
import { Module, ActionTree, GetterTree, MutationTree } from "vuex";

// Place holder module for presenting audio interface and control to the UI

export interface IAudioState {
    connected: boolean;
    hasInputAccess: boolean;
    awaitingCapturePermissions: boolean;
    currentInputDevice: string;
    inputsList: MediaDeviceInfo[];
}

function state(): IAudioState {
    return {
        connected: false,
        hasInputAccess: false,
        awaitingCapturePermissions: false,
        currentInputDevice: "UNKNOWN",
        inputsList: []
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
