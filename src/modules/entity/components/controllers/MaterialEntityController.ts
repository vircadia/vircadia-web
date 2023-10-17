//
//  materialEntityController.ts
//
//  Created by Nolan Huang on 19 Sep 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

// Domain Modules
import { EntityController } from "./EntityController";
import { IMaterialEntity } from "../../EntityInterfaces";
import { MaterialComponent } from "..";

export class MaterialEntityController extends EntityController {
    // domain properties
    _materialEntity: IMaterialEntity;
    _materialComponent: Nullable<MaterialComponent>;

    constructor(entity: IMaterialEntity) {
        super(entity, MaterialEntityController.typeName);
        this._materialEntity = entity;
    }

    static get typeName(): string {
        return "MaterialEntityController";
    }

    /**
    * Gets a string identifying the type of this Component
    * @returns "MaterialEntityController" string
    */
    // eslint-disable-next-line class-methods-use-this
    public get componentType(): string {
        return MaterialEntityController.typeName;
    }

    public onInitialize(): void {
        super.onInitialize();

        this._materialComponent = new MaterialComponent();
        this._gameObject?.addComponent(this._materialComponent);
    }

    public onStart(): void {
        super.onStart();
        this._materialComponent?.load(this._materialEntity);
    }

    protected _updateParent(): void {
        this._materialComponent?.updateParent(this._materialEntity);
        super._updateParent();
    }
}
