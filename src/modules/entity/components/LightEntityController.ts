/* eslint-disable @typescript-eslint/no-unused-vars */
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

// General Modules
import Log from "@Modules/debugging/log";
// Domain Modules
import { EntityController } from "./EntityController";
import { ILightEntity } from "../Entities";
import { LightComponent } from "@Base/modules/object";
import { LightEntityBuilder } from "../builders";

export class LightEntityController extends EntityController {
    // domain properties
    _lightEntity : ILightEntity;

    constructor(entity : ILightEntity) {
        super(entity, LightEntityController.typeName);
        this._lightEntity = entity;
    }

    /**
    * Gets a string identifying the type of this Component
    * @returns "EntityController" string
    */
    // eslint-disable-next-line class-methods-use-this
    public get componentType():string {
        return LightEntityController.typeName;
    }

    static get typeName(): string {
        return "LightEntityController";
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function, class-methods-use-this
    public onInitialize(): void {
        super.onInitialize();

        this._lightEntity.onLightTypeChanged?.add(this._handleLightTypeChanged.bind(this));
        this._lightEntity.onLightPropertiesChanged?.add(this._handleLightPropertiesChanged.bind(this));
        this._lightEntity.onDimensionChanged?.add(this._handleLightPropertiesChanged.bind(this));
    }

    public onStart(): void {
        super.onStart();
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function, class-methods-use-this
    public onUpdate():void {

    }

    private _handleLightPropertiesChanged(): void {
        if (this._gameObject) {
            const comp = this._gameObject.getComponent(LightComponent.typeName);
            if (comp && comp instanceof LightComponent) {
                LightEntityBuilder.buildLightProperties(comp.light, this._lightEntity);
            }
        }
    }

    private _handleLightTypeChanged(): void {
        if (this._gameObject) {
            LightEntityBuilder.buildLight(this._gameObject, this._lightEntity);
        }
    }

}
