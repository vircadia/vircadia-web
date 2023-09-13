//
//  materialComponent.ts
//
//  Created by Nolan Huang on 19 Sep 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable class-methods-use-this */
/* eslint-disable new-cap */

import { GenericNodeComponent, GameObject, MeshComponent, IComponent } from "@Modules/object";
import { Node, Material, StandardMaterial, AbstractMesh, Nullable, Observer } from "@babylonjs/core";
import { IMaterialEntity } from "../../EntityInterfaces";

export class MaterialComponent extends GenericNodeComponent<Node> {
    _material: Nullable<Material> = null;
    _target: Nullable<AbstractMesh> = null;
    _parentObserver: Nullable<Observer<IComponent>> = null;

    public get componentType(): string {
        return MaterialComponent.typeName;
    }

    static get typeName(): string {
        return "Material";
    }

    public get material(): Nullable<Material> {
        return this._material;
    }

    public dispose(): void {
        this._unbind();
        if (this._material) {
            this._material.dispose();
            this._material = null;
        }

        super.dispose();
    }

    public load(entity: IMaterialEntity): void {
        this.updateMaterialData(entity);

        this.updateDimensions(entity);

        this.updateParent(entity);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
    public updateDimensions(entity: IMaterialEntity): void {

    }

    public updateMaterialData(entity: IMaterialEntity): void {
        let materialData = null;
        if (!entity.materialURL || entity.materialURL === "" || entity.materialURL === "materialData") {
            materialData = entity.materialData;
        } else {
            // TODO: load material from materialURL
        }

        if (materialData && materialData.length !== 0) {
            if (!this._material) {
                this._material = new StandardMaterial(entity.name as string, this._gameObject?.getScene());

                if (this._target) {
                    this._target.material = this._material;
                }
            }
        }
    }

    public updateParent(entity: IMaterialEntity): void {
        // remove entity form previous parent
        if (this._getParentID() !== entity.parentID) {
            this._unbind();
        }

        // bind material if target mesh exists
        const newParent = entity.parentID ? GameObject.getGameObjectByID(entity.parentID) : undefined;
        if (newParent) {
            for (const comp of newParent.components.values()) {
                if (this._bindMaterial(comp)) {
                    break;
                }
            }

            // bind material when target mesh added
            if (!this._parentObserver) {
                this._parentObserver = newParent.onComponentAddedObservable.add((comp) => {
                    this._bindMaterial(comp);
                });
            }
        }
    }

    private _getParentID(): string | undefined {
        return this._gameObject && this._gameObject.getParent() ? this._gameObject.getParent().id : undefined;
    }

    private _bindMaterial(comp: IComponent): boolean {
        if (comp instanceof MeshComponent && comp.mesh) {
            this._unbindMaterial();
            comp.mesh.material = this._material;
            this._target = comp.mesh;
            return true;
        }

        return false;
    }

    private _unbindMaterial(): void {
        if (this._target) {
            this._target.material = null;
            this._target = null;
        }
    }

    private _unbind(): void {
        this._unbindMaterial();

        if (this._parentObserver && this._gameObject && this._gameObject.getParent()) {
            this._gameObject.getParent().onComponentAddedObservable.remove(this._parentObserver);
            this._parentObserver = null;
        }
    }
}
