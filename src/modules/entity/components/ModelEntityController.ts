/* eslint-disable @typescript-eslint/no-unused-vars */
//
//  ShapeEntityController.ts
//
//  Created by Nolan Huang on 4 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

// General Modules
import Log from "@Modules/debugging/log";
// Domain Modules
import { EntityController } from "./EntityController";
import { IModelEntity } from "../Entities";
import { ModelEntityBuilder } from "../builders";
import { GameObject, MeshComponent } from "@Base/modules/object";

export class ModelEntityController extends EntityController {
    // domain properties
    _modelEntity : IModelEntity;

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
    }

    public onStart(): void {
        super.onStart();
        this._modelEntity.onModelURLChanged?.add(this._handleModelURLChanged.bind(this));
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function, class-methods-use-this
    public onUpdate():void {

    }


    private _handleModelURLChanged(): void {
        ModelEntityBuilder.buildModel(this._gameObject as GameObject, this._modelEntity);
    }
}
