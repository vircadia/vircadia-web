/* eslint-disable class-methods-use-this */
//
//  mesh.ts
//
//  Created by Nolan Huang on 19 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { GenericNodeComponent } from "../component";

import {
    AbstractMesh, AnimationGroup, Nullable
} from "@babylonjs/core";

/**
 * A mesh component.
 */
export class MeshComponent extends GenericNodeComponent<AbstractMesh> {
    protected _mesh: Nullable<AbstractMesh> = null;
    protected _animationGroups: Nullable<AnimationGroup[]> = null;

    public get mesh(): Nullable<AbstractMesh> {
        return this._mesh;
    }

    public set mesh(value: Nullable<AbstractMesh>) {
        this._mesh = value;
        this.node = value;
    }

    public get animationGroups(): Nullable<AnimationGroup[]> {
        return this._animationGroups;
    }

    public set animationGroups(value: Nullable<AnimationGroup[]>) {
        this._animationGroups = value;
    }

    public set node(value: Nullable<AbstractMesh>) {
        this._mesh = value;
        super.node = value;
    }

    public set visible(enalbe: boolean) {
        if (this._mesh) {
            this._mesh.isVisible = enalbe;
            const subMeshes = this._mesh.getChildMeshes(false);
            subMeshes.forEach((subMesh) => {
                subMesh.isVisible = enalbe;
            });
        }
    }

    /**
    * Gets a string identifying the type of this Component
    * @returns "Mesh" string
    */
    public get componentType():string {
        return MeshComponent.typeName;
    }

    static get typeName(): string {
        return "Mesh";
    }
}
