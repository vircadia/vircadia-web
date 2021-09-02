//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

import { IRootState } from "../index";
import { Module, ActionTree, GetterTree, MutationTree } from "vuex";

import { VVector3, VVector4 } from "../../modules/render";
import { Renderer } from "src/modules/render/renderer";

import Log from "src/modules/debugging/log";

// Base state
export interface IRendererState {
    focusSceneId: number,
    fps: number,
    cameraLocation: Nullable<VVector3>,
    cameraRotation: Nullable<VVector4>
}

// Getters
export type Getters = {
    cameraLocation(pState?: IRendererState, pRootState?: IRootState): VVector3;
};

const getters: GetterTree<IRendererState, IRootState> & Getters = {
    cameraLocation(): VVector3 {
        Log.debug(Log.types.OTHER, "Renderer.getters.cameraLocation: Fetching camera location");
        return Renderer.getScene().getCameraLocation();
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
    setFocusSceneId(pState: IRendererState, pSceneId: number) {
        Log.debug(Log.types.OTHER, `Renderer.mut.setFocusSceneId: Setting id to ${pSceneId}`);
        pState.focusSceneId = pSceneId;
    }
};

export const RendererModule: Module<IRendererState, IRootState> = {
    namespaced: true,
    state: () => ({
        focusSceneId: 0,
        fps: 1,
        cameraLocation: undefined,
        cameraRotation: undefined
    }),
    actions,
    getters,
    mutations
};

export default RendererModule;
