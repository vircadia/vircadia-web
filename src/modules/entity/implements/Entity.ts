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

/* eslint-disable @typescript-eslint/no-unused-vars */
import { IVector3Property, IQuaternionProperty, EntityType } from "../EntityProperties";
import { IEntity } from "../Entities";
import { Observable } from "@babylonjs/core";
import { EntityProperties } from "@vircadia/web-sdk";
import Log from "@Base/modules/debugging/log";


export class EntityPropertyChangeObservable<T extends IEntity> {
    _entity : T;
    public observable : Observable<T> = new Observable<T>();
    public isDirty = false;

    constructor(entity : T) {
        this._entity = entity;
    }

    public update() : void {
        if (this.isDirty) {
            this.observable.notifyObservers(this._entity);
            this.isDirty = false;
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
    protected _userData: string | undefined;
    protected _collisionMask : number | undefined;
    protected _propertyChangeObservables : Array<EntityPropertyChangeObservable<IEntity>>;

    private _onCommonPropertiesChanged : EntityPropertyChangeObservable<IEntity>;
    private _onPositionAndRotationChanged : EntityPropertyChangeObservable<IEntity>;
    private _onDimensionChanged : EntityPropertyChangeObservable<IEntity>;
    private _onCollisionPropertiesChanged : EntityPropertyChangeObservable<IEntity>;
    private _onUserDataChanged : EntityPropertyChangeObservable<IEntity>;


    constructor(id : string, type : EntityType) {
        this._id = id;
        this._type = type;

        this._propertyChangeObservables = new Array<EntityPropertyChangeObservable<IEntity>>();

        this._onCommonPropertiesChanged = this.createPropertyChangeObservable();
        this._onPositionAndRotationChanged = this.createPropertyChangeObservable();
        this._onDimensionChanged = this.createPropertyChangeObservable();
        this._onCollisionPropertiesChanged = this.createPropertyChangeObservable();
        this._onUserDataChanged = this.createPropertyChangeObservable();
    }

    protected createPropertyChangeObservable(): EntityPropertyChangeObservable<IEntity> {
        const observable = new EntityPropertyChangeObservable<IEntity>(this);
        this._propertyChangeObservables.push(observable);
        return observable;
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
        if (value !== undefined && value !== this._visible) {
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

    public get userData(): string | undefined {
        return this._userData;
    }

    public set userData(value: string | undefined) {
        if (value && this._userData !== value) {
            this._userData = value;
            this._onUserDataChanged.isDirty = true;
        }
    }

    public get collisionMask() : number | undefined {
        return this._collisionMask;
    }

    public set collisionMask(value: number | undefined) {
        if (value && value !== this._collisionMask) {
            this._collisionMask = value;
            this._onCollisionPropertiesChanged.isDirty = true;
        }
    }

    public get onCommonPropertiesChanged(): Observable<IEntity> {
        return this._onCommonPropertiesChanged.observable;
    }

    public get onPositionAndRotationChanged(): Observable<IEntity> {
        return this._onPositionAndRotationChanged.observable;
    }

    public get onDimensionChanged(): Observable<IEntity> {
        return this._onDimensionChanged.observable;
    }

    public get onCollisionPropertiesChanged(): Observable<IEntity> {
        return this._onCollisionPropertiesChanged.observable;
    }

    public get onUserDataChanged(): Observable<IEntity> {
        return this._onUserDataChanged.observable;
    }

    public update() : void {
        this._propertyChangeObservables.forEach((observable) => {
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
        this.userData = props.userData;
        this.collisionMask = props.collisionMask;
    }
}
