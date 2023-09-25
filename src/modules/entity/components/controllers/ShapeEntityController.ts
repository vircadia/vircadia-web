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

import { EntityController } from "./EntityController";
import { IShapeEntity } from "../../EntityInterfaces";
import { ShapeComponent } from "../components";

export class ShapeEntityController extends EntityController {
    _shapeEntity: IShapeEntity;
    _shapeComponent: Nullable<ShapeComponent> = null;

    constructor(entity: IShapeEntity) {
        super(entity, ShapeEntityController.typeName);
        this._shapeEntity = entity;
    }

    static get typeName(): string {
        return "ShapeEntityController";
    }

    /**
    * Gets a string identifying the type of this Component
    * @returns "ShapeEntityController" string
    */
    // eslint-disable-next-line class-methods-use-this
    public get componentType(): string {
        return ShapeEntityController.typeName;
    }

    public onInitialize(): void {
        super.onInitialize();

        this._shapeComponent = new ShapeComponent();
        this._gameObject?.addComponent(this._shapeComponent);

        this._shapeEntity.onShapeChanged?.add(() => {
            this._shapeComponent?.updateShape(this._shapeEntity);
        });

        this._shapeEntity.onColorChanged?.add(() => {
            this._shapeComponent?.updateColor(this._shapeEntity);
        });

        this._shapeEntity.onDimensionChanged?.add(() => {
            this._shapeComponent?.updateDimensions(this._shapeEntity);
        });

        this._shapeEntity.onCollisionPropertiesChanged?.add(() => {
            this._shapeComponent?.updateCollisionProperties(this._shapeEntity);
        });
    }

    public onStart(): void {
        this._shapeComponent?.load(this._shapeEntity);
        super.onStart();
    }
}
