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

import { IVector3Property, IQuaternionProperty, EntityType } from "../EntityProperties";
import { IEntity } from "../IEntity";
import { Observable } from "@babylonjs/core";
import { EntityProperties } from "@vircadia/web-sdk";

export class Entity implements IEntity {
    protected _onChanged : Observable<IEntity>;
    protected _id : string;
    protected _type : EntityType;
    protected _name: string | undefined;
    protected _parentID: string | undefined;
    protected _visible: boolean | undefined;
    protected _position: IVector3Property | undefined;
    protected _rotation: IQuaternionProperty | undefined;
    protected _dimensions: IVector3Property | undefined;

    constructor(id : string, type : EntityType) {
        this._id = id;
        this._type = type;
        this._onChanged = new Observable<IEntity>();
    }

    public get id() : string {
        return this._id;
    }

    public get type() : EntityType {
        return this._type;
    }

    public get name() : string | undefined {
        return this._name;
    }

    public set name(value : string | undefined) {
        this._name = value;
    }

    public get parentID(): string | undefined {
        return this._parentID;
    }

    public set parentID(value: string | undefined) {
        this._parentID = value;
    }

    public get visible(): boolean | undefined {
        return this._visible;
    }

    public set visible(value: boolean | undefined) {
        this._visible = value;
    }

    public get position(): IVector3Property | undefined {
        return this._position;
    }

    public set position(value: IVector3Property | undefined) {
        this._position = value;
    }

    public get rotation(): IQuaternionProperty | undefined {
        return this._rotation;
    }

    public set rotation(value: IQuaternionProperty | undefined) {
        this._rotation = value;
    }

    public get dimensions(): IVector3Property | undefined {
        return this._dimensions;
    }

    public set dimensions(value: IVector3Property | undefined) {
        this._dimensions = value;
    }

    // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-empty-function
    public update() : void {}

    public copyFormPacketData(props : EntityProperties) : void {
        this.name = props.name;
        this.position = props.position;
        this.rotation = props.rotation;
        this.dimensions = props.dimensions;
        this.parentID = props.parentID?.stringify();
        this.visible = props.visible;
    }
}
