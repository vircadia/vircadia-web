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
import Log from "@Base/modules/debugging/log";

export class EntityChangeObservable {
    _entity : IEntity;
    public observable : Observable<IEntity> = new Observable<IEntity>();
    public isDirty = false;

    constructor(entity : IEntity) {
        this._entity = entity;
    }

    public update() : void {
        if (this.isDirty) {
            this.observable.notifyObservers(this._entity);
            this.isDirty = false;
            Log.debug(Log.types.ENTITIES, "notify change");
        }
    }
}

export abstract class Entity implements IEntity {
    protected _id : string;
    protected _type : EntityType;
    protected _name: string | undefined;
    protected _parentID: string | undefined;
    protected _visible: boolean | undefined;
    protected _position: IVector3Property | undefined;
    protected _rotation: IQuaternionProperty | undefined;
    protected _dimensions: IVector3Property | undefined;
    protected _changeObservables : Array<EntityChangeObservable>;

    private _onCommonPropertiesChanged : EntityChangeObservable;
    private _onPositionAndRotationChanged : EntityChangeObservable;
    private _onDimensionChanged : EntityChangeObservable;


    constructor(id : string, type : EntityType) {
        this._id = id;
        this._type = type;

        this._changeObservables = new Array<EntityChangeObservable>();

        this._onCommonPropertiesChanged = new EntityChangeObservable(this);
        this._changeObservables.push(this._onCommonPropertiesChanged);

        this._onPositionAndRotationChanged = new EntityChangeObservable(this);
        this._changeObservables.push(this._onPositionAndRotationChanged);

        this._onDimensionChanged = new EntityChangeObservable(this);
        this._changeObservables.push(this._onDimensionChanged);

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
            this._onCommonPropertiesChanged.isDirty = true;
        }
    }

    public get parentID(): string | undefined {
        return this._parentID;
    }

    public set parentID(value: string | undefined) {
        if (value && value !== this._parentID) {
            this._parentID = value;
            this._onCommonPropertiesChanged.isDirty = true;
        }
    }

    public get visible(): boolean | undefined {
        return this._visible;
    }

    public set visible(value: boolean | undefined) {
        if (value && value !== this._visible) {
            this._visible = value;
            this._onCommonPropertiesChanged.isDirty = true;
        }
    }

    public get position(): IVector3Property | undefined {
        return this._position;
    }

    public set position(value: IVector3Property | undefined) {
        if (value) {
            this._position = value;
            this._onPositionAndRotationChanged.isDirty = true;
        }
    }

    public get rotation(): IQuaternionProperty | undefined {
        return this._rotation;
    }

    public set rotation(value: IQuaternionProperty | undefined) {
        if (value) {
            this._rotation = value;
            this._onPositionAndRotationChanged.isDirty = true;
        }
    }

    public get dimensions(): IVector3Property | undefined {
        return this._dimensions;
    }

    public set dimensions(value: IVector3Property | undefined) {
        if (value) {
            this._dimensions = value;
            this._onDimensionChanged.isDirty = true;
        }
    }

    public get onCommonPropertiesChanged(): Observable<IEntity> {
        return this._onCommonPropertiesChanged.observable;
    }

    public get onPositionAndRotationChanged(): Observable<IEntity> {
        return this._onPositionAndRotationChanged.observable;
    }

    public update() : void {
        this._changeObservables.forEach((observable) => {
            observable.update();
        });
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
