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

/* eslint-disable class-methods-use-this */

import type { AbstractMesh, AnimationGroup, Nullable, Skeleton } from "@babylonjs/core";
import { GenericNodeComponent } from "../component";

/**
 * A mesh component.
 */
export class MeshComponent extends GenericNodeComponent<AbstractMesh> {
    protected _mesh: Nullable<AbstractMesh> = null;
    public animationGroups: Nullable<AnimationGroup[]> = null;
    public skeleton: Nullable<Skeleton> = null;

    public get mesh(): Nullable<AbstractMesh> {
        return this._mesh;
    }

    public set mesh(value: Nullable<AbstractMesh>) {
        this.node = value;
    }

    public set node(value: Nullable<AbstractMesh>) {
        this._mesh = value;
        super.node = value;
    }

    public set visible(enable: boolean) {
        if (this._mesh) {
            this._mesh.isVisible = enable;
            const subMeshes = this._mesh.getChildMeshes(false);
            subMeshes.forEach((subMesh) => {
                subMesh.isVisible = enable;
            });
        }
    }

    public set pickable(enable: boolean) {
        if (this._mesh) {
            this._mesh.isPickable = enable;
            const subMeshes = this._mesh.getChildMeshes(false);
            subMeshes.forEach((subMesh) => {
                subMesh.isPickable = enable;
            });
        }
    }

    public set renderGroupId(id: number) {
        if (this._mesh) {
            this._mesh.renderingGroupId = id;
            const subMeshes = this._mesh.getChildMeshes(false);
            subMeshes.forEach((subMesh) => {
                subMesh.renderingGroupId = id;
            });
        }
    }

    public set checkCollisions(enable: boolean) {
        if (this._mesh) {
            this._mesh.checkCollisions = enable;
            const subMeshes = this._mesh.getChildMeshes(false);
            subMeshes.forEach((subMesh) => {
                subMesh.checkCollisions = enable;
            });
        }
    }

    /**
     * A string identifying the type of this component.
     * @returns `"Mesh"`
     */
    public get componentType(): string {
        return MeshComponent.typeName;
    }

    /**
     * A string identifying the type of this component.
     * @returns `"Mesh"`
     */
    static get typeName(): string {
        return "Mesh";
    }
}
