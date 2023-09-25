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

// Domain Modules
import { EntityController } from "./EntityController";
import { IModelEntity } from "../../EntityInterfaces";
import { ModelComponent } from "../../components";

export class ModelEntityController extends EntityController {
    // domain properties
    _modelEntity: IModelEntity;
    _modelComponent: Nullable<ModelComponent> = null;

    constructor(entity: IModelEntity) {
        super(entity, ModelEntityController.typeName);
        this._modelEntity = entity;
    }

    static get typeName(): string {
        return "ModelEntityController";
    }


    /**
    * Gets a string identifying the type of this Component
    * @returns "EntityController" string
    */
    // eslint-disable-next-line class-methods-use-this
    public get componentType(): string {
        return ModelEntityController.typeName;
    }

    public onInitialize(): void {
        super.onInitialize();

        this._modelComponent = new ModelComponent();
        this._gameObject?.addComponent(this._modelComponent);

        this._modelEntity.onModelURLChanged?.add(() => {
            this._modelComponent?.load(this._modelEntity);
        });
        this._modelEntity.onCollisionPropertiesChanged?.add(() => {
            this._modelComponent?.updateCollisionProperties(this._modelEntity);
        });
        this._modelEntity.onPhysicsPropertiesChanged?.add(() => {
            this._modelComponent?.updatePhysicsProperties(this._modelEntity);
        });
        this._modelEntity.onAnimationChanged?.add(() => {
            this._modelComponent?.updateAnimationProperties(this._modelEntity);
        });
    }

    public onStart(): void {
        this._modelComponent?.load(this._modelEntity);
        super.onStart();
    }
}
