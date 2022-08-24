//
//  ModelEntityController.ts
//
//  Created by Nolan Huang on 4 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable @typescript-eslint/no-unused-vars */
// Domain Modules
import { EntityController } from "./EntityController";
import { IModelEntity } from "../../EntityInterfaces";
import { ModelComponent } from "../../components";
import Log from "@Base/modules/debugging/log";

export class ModelEntityController extends EntityController {
    // domain properties
    _modelEntity : IModelEntity;
    _modelComponent : Nullable<ModelComponent>;

    constructor(entity : IModelEntity) {
        super(entity, "ModelEntityController");
        this._modelEntity = entity;
    }

    /**
    * Gets a string identifying the type of this Component
    * @returns "EntityController" string
    */
    // eslint-disable-next-line class-methods-use-this
    public get componentType():string {
        return "ModelEntityController";
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function, class-methods-use-this
    public onInitialize(): void {
        super.onInitialize();

        this._modelComponent = new ModelComponent();
        this._gameObject?.addComponent(this._modelComponent);

        this._modelEntity.onModelURLChanged?.add(this._handleModelURLChanged.bind(this));
        this._modelEntity.onCollisionPropertiesChanged?.add(this._handleCollisionPropertiesChanged.bind(this));
    }

    public onStart(): void {
        super.onStart();
        this._modelComponent?.load(this._modelEntity);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function, class-methods-use-this
    public onUpdate():void {

    }


    private _handleModelURLChanged(): void {
        this._modelComponent?.load(this._modelEntity);
    }

    private _handleCollisionPropertiesChanged(): void {
        this._modelComponent?.updateCollisionProperties(this._modelEntity);
    }
}
