//
//  LightEntityController.ts
//
//  Created by Nolan Huang on 17 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

// Domain Modules
import { EntityController } from "./EntityController";
import { ILightEntity } from "../../EntityInterfaces";
import { LightEntityComponent } from "../components";

export class LightEntityController extends EntityController {
    // domain properties
    _lightEntity: ILightEntity;
    _lightComponent: Nullable<LightEntityComponent>;

    constructor(entity: ILightEntity) {
        super(entity, LightEntityController.typeName);
        this._lightEntity = entity;
    }

    /**
    * Gets a string identifying the type of this Component
    * @returns "EntityController" string
    */
    // eslint-disable-next-line class-methods-use-this
    public get componentType(): string {
        return LightEntityController.typeName;
    }

    static get typeName(): string {
        return "LightEntityController";
    }

    public onInitialize(): void {
        super.onInitialize();

        this._lightComponent = new LightEntityComponent();
        this._gameObject?.addComponent(this._lightComponent);

        this._lightEntity.onLightTypeChanged?.add(() => {
            this._lightComponent?.load(this._lightEntity);
        });

        this._lightEntity.onLightPropertiesChanged?.add(() => {
            this._lightComponent?.updateProperties(this._lightEntity);
        });

        this._lightEntity.onDimensionChanged?.add(() => {
            this._lightComponent?.updateDimensions(this._lightEntity);
        });

    }

    public onStart(): void {
        this._lightComponent?.load(this._lightEntity);
        super.onStart();
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function, class-methods-use-this
    public onUpdate(): void {
    }
}
