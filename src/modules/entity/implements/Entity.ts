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
import { IEntity } from "../Entities";
import { Observable } from "@babylonjs/core";
import { EntityProperties } from "@vircadia/web-sdk";

export abstract class Entity implements IEntity {
    protected _id : string;
    protected _type : EntityType;
    protected _name: string | undefined;
    protected _parentID: string | undefined;
    protected _visible: boolean | undefined;
    protected _position: IVector3Property | undefined;
    protected _rotation: IQuaternionProperty | undefined;
    protected _dimensions: IVector3Property | undefined;

    private _onCommonPropertiesChanged : Observable<IEntity>;
    private _onPositionAndRotationChanged : Observable<IEntity>;
    private _commonProperties = false;
    private _positionAndRotationChanged = false;


    constructor(id : string, type : EntityType) {
        this._id = id;
        this._type = type;
        this._onCommonPropertiesChanged = new Observable<IEntity>();
        this._onPositionAndRotationChanged = new Observable<IEntity>();
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
        if (value && value !== this._name) {
            this._name = value;
            this._commonProperties = true;
        }
    }

    public get parentID(): string | undefined {
        return this._parentID;
    }

    public set parentID(value: string | undefined) {
        if (value && value !== this._parentID) {
            this._parentID = value;
            this._commonProperties = true;
        }
    }

    public get visible(): boolean | undefined {
        return this._visible;
    }

    public set visible(value: boolean | undefined) {
        if (value && value !== this._visible) {
            this._visible = value;
            this._commonProperties = true;
        }
    }

    public get position(): IVector3Property | undefined {
        return this._position;
    }

    public set position(value: IVector3Property | undefined) {
        if (value) {
            this._position = value;
            this._positionAndRotationChanged = true;
        }
    }

    public get rotation(): IQuaternionProperty | undefined {
        return this._rotation;
    }

    public set rotation(value: IQuaternionProperty | undefined) {
        if (value) {
            this._rotation = value;
            this._positionAndRotationChanged = true;
        }
    }

    public get dimensions(): IVector3Property | undefined {
        return this._dimensions;
    }

    public set dimensions(value: IVector3Property | undefined) {
        if (value) {
            this._dimensions = value;
        }
    }

    public get onCommonPropertiesChanged(): Observable<IEntity> {
        return this._onCommonPropertiesChanged;
    }

    public get onPositionAndRotationChanged(): Observable<IEntity> {
        return this._onPositionAndRotationChanged;
    }

    public update() : void {
        if (this._commonProperties) {
            this._onCommonPropertiesChanged.notifyObservers(this);
            this._commonProperties = false;
        }

        if (this._positionAndRotationChanged) {
            this._onPositionAndRotationChanged.notifyObservers(this);
            this._positionAndRotationChanged = false;
        }

    }

    public copyFormPacketData(props : EntityProperties) : void {
        this.name = props.name;
        this.position = props.position;
        this.rotation = props.rotation;
        this.dimensions = props.dimensions;
        this.parentID = props.parentID?.stringify();
        this.visible = props.visible;
    }
}
