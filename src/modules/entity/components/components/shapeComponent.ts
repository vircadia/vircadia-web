//
//  shapeComponent.ts
//
//  Created by Nolan Huang on 20 Sep 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable class-methods-use-this */
/* eslint-disable new-cap */

import { MeshComponent, DEFAULT_MESH_RENDER_GROUP_ID } from "@Modules/object";
import { StandardMaterial, Mesh, MeshBuilder, PhysicsImpostor } from "@babylonjs/core";
import { IShapeEntity } from "../../EntityInterfaces";
import { EntityMapper } from "../../package";

export class ShapeComponent extends MeshComponent {

    public get componentType(): string {
        return ShapeComponent.typeName;
    }

    static get typeName(): string {
        return "Shape";
    }

    public load(entity: IShapeEntity): void {
        this.updateShape(entity);
    }

    public updateShape(entity: IShapeEntity): void {
        if (this._mesh) {
            this._mesh.dispose();
            this._mesh = null;
        }

        if (entity.shape && this._gameObject) {
            const mesh = this._createShape(entity);
            if (!mesh) {
                return;
            }

            mesh.isPickable = false;
            mesh.checkCollisions = false;
            mesh.renderingGroupId = DEFAULT_MESH_RENDER_GROUP_ID;

            this.mesh = mesh;
            if (entity.visible !== undefined) {
                this.visible = entity.visible;
            }

            this.updateDimensions(entity);
            this.updateColor(entity);
            this.updateCollisionProperties(entity);
        }
    }

    public updateColor(entity: IShapeEntity): void {
        if (!entity.color || !this._mesh) {
            return;
        }

        if (!this._mesh.material) {
            this._mesh.material = new StandardMaterial(this._mesh.name + "_" + entity.id);
        }

        const material = this._mesh.material as StandardMaterial;
        const color = EntityMapper.mapToColor3(entity.color);
        material.ambientColor = color;
        material.diffuseColor = color;
        material.specularColor = color;
        material.alpha = entity.alpha ?? material.alpha;
    }

    public updateDimensions(entity: IShapeEntity): void {
        if (entity.dimensions && this._mesh) {
            this._mesh.scaling = EntityMapper.mapToVector3(entity.dimensions);
        }
    }

    public updateCollisionProperties(entity: IShapeEntity): void {
        if (this._gameObject && this._mesh) {
            if (entity.collisionless) {
                this._disposeCollider();
                this.pickable = false;
                this.checkCollisions = false;
            } else {
                this._createCollider(entity);
                this.pickable = true;
                this.checkCollisions = true;
            }
        }
    }

    protected _createCollider(props: IShapeEntity): void {
        if (!this._gameObject || !this._mesh) {
            return;
        }

        if (props.shape === "Cube") {
            this._disposeCollider();
            this._mesh.physicsImpostor = new PhysicsImpostor(this._mesh, PhysicsImpostor.BoxImpostor,
                { mass: 0,
                    restitution: 0 },
                this._mesh.getScene());

            this._gameObject.physicsImpostor = new PhysicsImpostor(
                this._gameObject, PhysicsImpostor.NoImpostor,
                { mass: 0,
                    restitution: 0 },
                this._gameObject.getScene());
        }
    }

    protected _disposeCollider(): void {
        if (this._mesh && this._mesh.physicsImpostor) {
            this._mesh.physicsImpostor.dispose();
            this._mesh.physicsImpostor = null;
        }

        if (this._gameObject && this._gameObject.physicsImpostor) {
            this._gameObject.physicsImpostor.dispose();
            this._gameObject.physicsImpostor = null;
        }
    }

    private _createShape(props: IShapeEntity): Mesh | undefined {
        const scene = this._gameObject?.getScene();
        switch (props.shape) {
            case "Cube":
                return MeshBuilder.CreateBox("Box", undefined, scene);
            case "Sphere":
                return MeshBuilder.CreateSphere("Sphere", undefined, scene);
            case "Cylinder":
                return MeshBuilder.CreateCylinder("Cylinder", { diameter: 1, height: 1 }, scene);
            default:
                return MeshBuilder.CreateBox("Box", undefined, scene);
        }
    }

}
