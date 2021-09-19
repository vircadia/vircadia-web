//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

import { IRootState } from "../index";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Module, ActionTree, ActionContext, GetterTree, MutationTree, Payload } from "vuex";

import { MetaverseMgr } from "@Modules/metaverse";

// Placeholder module for presenting Metaverse state and operations to the interface

export interface IMetaverseState {
    name: string;
    nickname: string;
    server: string;
    connectionState: string;
    iceServer: string | undefined ;
    serverVersion: string | undefined ;
}
function state(): IMetaverseState {
    return {
        name: "",
        nickname: "",
        server: "https://metaverse.vircadia.com/live",
        connectionState: "Uninitialized",
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
// Example action. Any script should call Metaverse directly
const actions: ActionTree<IMetaverseState, IRootState> = {
    async setMetaverseUrl(context: ActionContext<IMetaverseState, IRootState>, pUrl: string): Promise<void> {
        await MetaverseMgr.ActiveMetaverse.setMetaverseUrl(pUrl);
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
