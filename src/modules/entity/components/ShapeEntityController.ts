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
import { IShapeEntity } from "../Entities";
import { MeshComponent } from "@Base/modules/object";
import { ShapeEntityBuilder } from "../builders";

export class ShapeEntityController extends EntityController {
    // domain properties
    _shapeEntity : IShapeEntity;

    constructor(entity : IShapeEntity) {
        super(entity, "ShapeEntityController");
        this._shapeEntity = entity;
    }

    /**
    * Gets a string identifying the type of this Component
    * @returns "EntityController" string
    */
    // eslint-disable-next-line class-methods-use-this
    public get componentType():string {
        return "ShapeEntityController";
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function, class-methods-use-this
    public onInitialize(): void {
        super.onInitialize();
        this._shapeEntity.onShapeChanged?.add(this._handleShapeChanged.bind(this));
        this._shapeEntity.onColorChanged?.add(this._handleColorChanged.bind(this));
        this._shapeEntity.onDimensionChanged?.add(this._handleDimensionChanged.bind(this));
    }

    public onStart(): void {
        super.onStart();
        // this._handleShapeChanged();
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function, class-methods-use-this
    public onUpdate():void {

    }

    private _handleShapeChanged(): void {
        if (this._shapeEntity.shape && this._gameObject) {
            ShapeEntityBuilder.buildMesh(this._gameObject, this._shapeEntity);
        }
    }

    private _handleColorChanged(): void {
        if (this._shapeEntity.color && this._gameObject) {
            const comp = this._gameObject.getComponent("Mesh") as MeshComponent;
            if (comp && comp.mesh) {
                ShapeEntityBuilder.buildColor(comp.mesh, this._shapeEntity);
            }
        }
    }

    private _handleDimensionChanged(): void {
        if (this._shapeEntity.color && this._gameObject) {
            const comp = this._gameObject.getComponent("Mesh") as MeshComponent;
            if (comp && comp.mesh) {
                ShapeEntityBuilder.buildDimensions(comp.mesh, this._shapeEntity);
            }
        }
    }

}
