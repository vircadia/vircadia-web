//
//  Entity.ts
//
//  Created by Nolan Huang on 3 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { IColorProperty, EntityType, Shape } from "../EntityProperties";
import { IShapeEntity } from "../Entities";
import { Observable } from "@babylonjs/core";
import { Entity } from "./Entity";
import { EntityProperties, ShapeEntityProperties } from "@vircadia/web-sdk";

export class ShapeEntity extends Entity implements IShapeEntity {
    protected _onShapeEntityChanged : Observable<IShapeEntity>;

    protected _shape: Shape | undefined;

    protected _color: IColorProperty | undefined;

    protected _alpha: number | undefined;

    constructor(id : string, type : EntityType) {
        super(id, type);
        this._onShapeEntityChanged = new Observable<IShapeEntity>();
    }

    public get shape(): Shape | undefined {
        return this._shape;
    }

    public set shape(value: Shape | undefined) {
        this._shape = value;
    }


    public get color(): IColorProperty | undefined {
        return this._color;
    }

    public set color(value: IColorProperty | undefined) {
        this._color = value;
    }

    public get alpha(): number | undefined {
        return this._alpha;
    }

    public set alpha(value: number | undefined) {
        this._alpha = value;
    }

    public copyFormPacketData(props : EntityProperties) : void {
        super.copyFormPacketData(props);

        const shapeProps = props as ShapeEntityProperties;
        this.shape = shapeProps.shape;
        this.color = shapeProps.color;
        this.alpha = shapeProps.alpha;
    }

    // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-empty-function
    public update() : void {
        super.update();
    }
}
