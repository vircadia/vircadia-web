//
//  ShapeEntity.ts
//
//  Created by Nolan Huang on 3 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { IColorProperty, EntityType, Shape } from "../EntityProperties";
import { IEntity, IShapeEntity } from "../EntityInterfaces";
import { Entity, EntityPropertyChangeObservable } from "./Entity";
import { EntityProperties, ShapeEntityProperties } from "@vircadia/web-sdk";
import { Observable } from "@babylonjs/core";

export class ShapeEntity extends Entity implements IShapeEntity {
    protected _shape: Shape | undefined;

    protected _color: IColorProperty | undefined;

    protected _alpha: number | undefined;

    protected _onShapeChanged: EntityPropertyChangeObservable<IEntity>;

    protected _onColorChanged: EntityPropertyChangeObservable<IEntity>;

    constructor(id: string, type: EntityType) {
        super(id, type);

        this._onShapeChanged = this.createPropertyChangeObservable();
        this._onColorChanged = this.createPropertyChangeObservable();
    }

    public get shape(): Shape | undefined {
        return this._shape;
    }

    public set shape(value: Shape | undefined) {
        if (this._shape !== value) {
            this._shape = value;
            this._onShapeChanged.isDirty = true;
        }
    }


    public get color(): IColorProperty | undefined {
        return this._color;
    }

    public set color(value: IColorProperty | undefined) {
        if (value) {
            this._color = value;
            this._onColorChanged.isDirty = true;
        }
    }

    public get alpha(): number | undefined {
        return this._alpha;
    }

    public set alpha(value: number | undefined) {
        if (typeof value === "number") {
            this._alpha = value;
            this._onColorChanged.isDirty = true;
        }
    }

    public get onShapeChanged(): Observable<IEntity> {
        return this._onShapeChanged.observable;
    }

    public get onColorChanged(): Observable<IEntity> {
        return this._onColorChanged.observable;
    }

    public copyFromPacketData(props: EntityProperties): void {
        super.copyFromPacketData(props);

        const shapeProps = props as ShapeEntityProperties;
        this.shape = shapeProps.shape;
        this.color = shapeProps.color;
        this.alpha = shapeProps.alpha;
    }
}
