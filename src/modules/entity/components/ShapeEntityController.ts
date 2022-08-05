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
import { ScriptComponent, inspectorAccessor } from "@Modules/script";
import { EntityController } from "./EntityController";
import { IShapeEntity } from "../Entities";

export class ShapeEntityController extends EntityController {
    // domain properties
    _shapeEntity : IShapeEntity;

    constructor(entity : IShapeEntity) {
        super(entity);
        this._shapeEntity = entity;
    }

    /**
    * Gets a string identifying the type of this Component
    * @returns "EntityController" string
    */
    // eslint-disable-next-line class-methods-use-this
    public get componentType():string {
        return "EntityController";
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function, class-methods-use-this
    public onInitialize(): void {

    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function, class-methods-use-this
    public onUpdate():void {

    }

    /*
    private _handleScaleChanged(): void {
    } */

}
