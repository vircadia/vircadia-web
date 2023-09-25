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
import { IEntity } from "../EntityInterfaces";
import { Observable } from "@babylonjs/core";
import { EntityProperties } from "@vircadia/web-sdk";
import { EntityMapper } from "../package";

export class EntityPropertyChangeObservable<T extends IEntity> {
    _entity: T;
    public observable: Observable<T> = new Observable<T>();
    public isDirty = false;

    constructor(entity: T) {
        this._entity = entity;
    }

    public update(): void {
        if (this.isDirty) {
            this.observable.notifyObservers(this._entity);
            this.isDirty = false;
        }
    }
}

export abstract class Entity implements IEntity {
    protected _id: string;
    protected _type: EntityType;
    protected _name: string | undefined;
    protected _parentID: string | undefined;
    protected _visible: boolean | undefined;
    protected _position: IVector3Property | undefined;
    protected _rotation: IQuaternionProperty | undefined;
    protected _dimensions: IVector3Property | undefined;
    // render mode properties
    protected _billboardMode: string | undefined;
    // script Properties
    protected _script: string | undefined;
    protected _userData: string | undefined;
    // collision Properties
    protected _collisionless: boolean | undefined;
    protected _collisionMask: number | undefined;
    protected _collisionSoundURL: string | undefined;
    protected _dynamic: boolean | undefined;
    // physics Properties
    protected _velocity: IVector3Property | undefined;
    protected _damping: number | undefined;
    protected _angularVelocity: IVector3Property | undefined;
    protected _angularDamping: number | undefined;
    protected _restitution: number | undefined;
    protected _friction: number | undefined;
    protected _density: number | undefined;
    protected _gravity: IVector3Property | undefined;

    protected _propertyChangeObservables: Array<EntityPropertyChangeObservable<IEntity>>;

    protected _onCommonPropertiesChanged: EntityPropertyChangeObservable<IEntity>;
    protected _onRenderModeChanged: EntityPropertyChangeObservable<IEntity>;
    protected _onParentChanged: EntityPropertyChangeObservable<IEntity>;
    protected _onPositionAndRotationChanged: EntityPropertyChangeObservable<IEntity>;
    protected _onDimensionChanged: EntityPropertyChangeObservable<IEntity>;
    protected _onScriptChanged: EntityPropertyChangeObservable<IEntity>;
    protected _onUserDataChanged: EntityPropertyChangeObservable<IEntity>;
    protected _onCollisionPropertiesChanged: EntityPropertyChangeObservable<IEntity>;
    protected _onPhysicsPropertiesChanged: EntityPropertyChangeObservable<IEntity>;

    constructor(id: string, type: EntityType) {
        this._id = id;
        this._type = type;

        this._propertyChangeObservables = new Array<EntityPropertyChangeObservable<IEntity>>();

        this._onCommonPropertiesChanged = this.createPropertyChangeObservable();
        this._onParentChanged = this.createPropertyChangeObservable();
        this._onPositionAndRotationChanged = this.createPropertyChangeObservable();
        this._onDimensionChanged = this.createPropertyChangeObservable();
        this._onRenderModeChanged = this.createPropertyChangeObservable();
        this._onScriptChanged = this.createPropertyChangeObservable();
        this._onUserDataChanged = this.createPropertyChangeObservable();
        this._onCollisionPropertiesChanged = this.createPropertyChangeObservable();
        this._onPhysicsPropertiesChanged = this.createPropertyChangeObservable();
    }

    protected createPropertyChangeObservable(): EntityPropertyChangeObservable<IEntity> {
        const observable = new EntityPropertyChangeObservable<IEntity>(this);
        this._propertyChangeObservables.push(observable);
        return observable;
    }

    public get id(): string {
        return this._id;
    }

    public get type(): EntityType {
        return this._type;
    }

    public get name(): string | undefined {
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
            this._onParentChanged.isDirty = true;
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

    public get billboardMode(): string | undefined {
        return this._billboardMode;
    }

    public set billboardMode(value: string | undefined) {
        if (value !== undefined && this._billboardMode !== value) {
            this._billboardMode = value;
            this._onRenderModeChanged.isDirty = true;
        }
    }

    public get script(): string | undefined {
        return this._script;
    }

    public set script(value: string | undefined) {
        if (value && this._script !== value) {
            this._script = value;
            this._onScriptChanged.isDirty = true;
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

    public get collisionless(): boolean | undefined {
        return this._collisionless;
    }

    public set collisionless(value: boolean | undefined) {
        if (value !== undefined && value !== this._collisionless) {
            this._collisionless = value;
            this._onCollisionPropertiesChanged.isDirty = true;
        }
    }

    public get collisionMask(): number | undefined {
        return this._collisionMask;
    }

    public set collisionMask(value: number | undefined) {
        if (typeof value === "number" && value !== this._collisionMask) {
            this._collisionMask = value;
            this._onCollisionPropertiesChanged.isDirty = true;
        }
    }

    public get collisionSoundURL(): string | undefined {
        return this._collisionSoundURL;
    }

    public set collisionSoundURL(value: string | undefined) {
        if (value !== undefined && value !== this._collisionSoundURL) {
            this._collisionSoundURL = value;
            this._onCollisionPropertiesChanged.isDirty = true;
        }
    }

    public get dynamic(): boolean | undefined {
        return this._dynamic;
    }

    public set dynamic(value: boolean | undefined) {
        if (value !== undefined && value !== this._collisionless) {
            this._dynamic = value;
            this._onCollisionPropertiesChanged.isDirty = true;
        }
    }

    public get velocity(): IVector3Property | undefined {
        return this._velocity;
    }

    public set velocity(value: IVector3Property | undefined) {
        if (value && this._velocity !== value) {
            this._velocity = value;
            this._onPhysicsPropertiesChanged.isDirty = true;
        }
    }

    public get damping(): number | undefined {
        return this._damping;
    }

    public set damping(value: number | undefined) {
        if (typeof value === "number" && this._damping !== value) {
            this._damping = value;
            this._onPhysicsPropertiesChanged.isDirty = true;
        }
    }

    public get angularVelocity(): IVector3Property | undefined {
        return this._angularVelocity;
    }

    public set angularVelocity(value: IVector3Property | undefined) {
        if (value && this._angularVelocity !== value) {
            this._angularVelocity = value;
            this._onPhysicsPropertiesChanged.isDirty = true;
        }
    }

    public get angularDamping(): number | undefined {
        return this._angularDamping;
    }

    public set angularDamping(value: number | undefined) {
        if (typeof value === "number" && this._angularDamping !== value) {
            this._angularDamping = value;
            this._onPhysicsPropertiesChanged.isDirty = true;
        }
    }

    public get restitution(): number | undefined {
        return this._restitution;
    }

    public set restitution(value: number | undefined) {
        if (typeof value === "number" && this._restitution !== value) {
            this._restitution = value;
            this._onPhysicsPropertiesChanged.isDirty = true;
        }
    }

    public get friction(): number | undefined {
        return this._friction;
    }

    public set friction(value: number | undefined) {
        if (typeof value === "number" && this._friction !== value) {
            this._friction = value;
            this._onPhysicsPropertiesChanged.isDirty = true;
        }
    }

    public get density(): number | undefined {
        return this._density;
    }

    public set density(value: number | undefined) {
        if (typeof value === "number" && this._density !== value) {
            this._density = value;
            this._onPhysicsPropertiesChanged.isDirty = true;
        }
    }

    public get gravity(): IVector3Property | undefined {
        return this._gravity;
    }

    public set gravity(value: IVector3Property | undefined) {
        if (value && this._gravity !== value) {
            this._gravity = value;
            this._onPhysicsPropertiesChanged.isDirty = true;
        }
    }

    public get onCommonPropertiesChanged(): Observable<IEntity> {
        return this._onCommonPropertiesChanged.observable;
    }

    public get onParentChanged(): Observable<IEntity> {
        return this._onParentChanged.observable;
    }

    public get onPositionAndRotationChanged(): Observable<IEntity> {
        return this._onPositionAndRotationChanged.observable;
    }

    public get onDimensionChanged(): Observable<IEntity> {
        return this._onDimensionChanged.observable;
    }

    public get onRenderModeChanged(): Observable<IEntity> {
        return this._onRenderModeChanged.observable;
    }

    public get onScriptChanged(): Observable<IEntity> {
        return this._onScriptChanged.observable;
    }

    public get onUserDataChanged(): Observable<IEntity> {
        return this._onUserDataChanged.observable;
    }

    public get onCollisionPropertiesChanged(): Observable<IEntity> {
        return this._onCollisionPropertiesChanged.observable;
    }

    public get onPhysicsPropertiesChanged(): Observable<IEntity> {
        return this._onPhysicsPropertiesChanged.observable;
    }

    public update(): void {
        this._propertyChangeObservables.forEach((observable) => {
            observable.update();
        });
    }

    public copyFormPacketData(props: EntityProperties): void {
        this.name = props.name;
        this.position = props.position;
        this.rotation = props.rotation;
        this.dimensions = props.dimensions;
        this.parentID = props.parentID?.stringify();
        this.visible = props.visible;
        // render mode properties
        this.billboardMode = EntityMapper.mapToEntityBillboardMode(props.billboardMode);
        // script properties
        this.script = props.script;
        this.userData = props.userData;
        // collision properties
        this.collisionless = props.collisionless;
        this.collisionMask = props.collisionMask;
        this.collisionSoundURL = props.collisionSoundURL;
        this.dynamic = props.dynamic;
        // physics properties
        this.velocity = props.velocity;
        this.damping = props.damping;
        this.angularVelocity = props.angularVelocity;
        this.angularDamping = props.angularDampling;
        this.restitution = props.restitution;
        this.friction = props.friction;
        this.density = props.density;
        this.gravity = props.gravity;
    }
}
