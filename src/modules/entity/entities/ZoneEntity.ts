//
//  ZoneEntity.ts
//
//  Created by Nolan Huang on 18 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { ShapeType, IAmbientLightProperty, IKeyLightProperty,
    ISkyboxProperty, IHazeProperty, IBloomProperty, ComponentMode,
    AvatarPriorityMode } from "../EntityProperties";
import { IEntity, IZoneEntity } from "../EntityInterfaces";
import { Entity, EntityPropertyChangeObservable } from "./Entity";
import { EntityProperties, ZoneEntityProperties } from "@vircadia/web-sdk";
import { Observable } from "@babylonjs/core";
import { EntityMapper } from "../package";

/* eslint-disable prefer-object-spread */
export class ZoneEntity extends Entity implements IZoneEntity {
    private _shapeType: ShapeType | undefined;
    private _compoundShapeURL: string | undefined;
    private _keyLightMode: ComponentMode | undefined;
    private _keyLight: IKeyLightProperty | undefined;
    private _ambientLightMode: ComponentMode | undefined;
    private _ambientLight: IAmbientLightProperty | undefined;
    private _skyboxMode: ComponentMode | undefined;
    private _skybox: ISkyboxProperty | undefined;
    private _hazeMode: ComponentMode | undefined;
    private _haze: IHazeProperty | undefined;
    private _bloomMode?: ComponentMode | undefined;
    private _bloom: IBloomProperty | undefined;
    _flyingAllowed: boolean | undefined;
    _ghostingAllowed: boolean | undefined;
    _filterURL: string | undefined;
    _avatarPriority: AvatarPriorityMode | undefined;
    _screenshare: ComponentMode | undefined;
    protected _onShapeTypeChanged: EntityPropertyChangeObservable<IEntity>;
    protected _onAmbientLightPropertiesChanged: EntityPropertyChangeObservable<IEntity>;
    protected _onKeyLightPropertiesChanged: EntityPropertyChangeObservable<IEntity>;
    protected _onSkyboxPropertiesChanged: EntityPropertyChangeObservable<IEntity>;
    protected _onHazePropertiesChanged: EntityPropertyChangeObservable<IEntity>;
    protected _onBloomPropertiesChanged: EntityPropertyChangeObservable<IEntity>;

    constructor(id: string) {
        super(id, "Zone");

        this._onShapeTypeChanged = this.createPropertyChangeObservable();
        this._onAmbientLightPropertiesChanged = this.createPropertyChangeObservable();
        this._onKeyLightPropertiesChanged = this.createPropertyChangeObservable();
        this._onSkyboxPropertiesChanged = this.createPropertyChangeObservable();
        this._onHazePropertiesChanged = this.createPropertyChangeObservable();
        this._onBloomPropertiesChanged = this.createPropertyChangeObservable();
    }

    public get shapeType(): ShapeType | undefined {
        return this._shapeType;
    }

    public set shapeType(value: ShapeType | undefined) {
        if (this._shapeType !== value) {
            this._shapeType = value;
            this._onShapeTypeChanged.isDirty = true;
        }
    }

    public get ambientLightMode(): ComponentMode | undefined {
        return this._ambientLightMode;
    }

    public set ambientLightMode(value: ComponentMode | undefined) {
        if (value && value !== this._ambientLightMode) {
            this._ambientLightMode = value;
            this._onAmbientLightPropertiesChanged.isDirty = true;
        }
    }

    public get ambientLight(): IAmbientLightProperty | undefined {
        return this._ambientLight;
    }

    public set ambientLight(value: IAmbientLightProperty | undefined) {
        if (value) {
            this._ambientLight = value;
            this._onAmbientLightPropertiesChanged.isDirty = true;
        }
    }

    public get onShapeTypeChanged(): Observable<IEntity> {
        return this._onShapeTypeChanged.observable;
    }

    public get onAmbientLightPropertiesChanged(): Observable<IEntity> {
        return this._onAmbientLightPropertiesChanged.observable;
    }

    public get onKeyLightPropertiesChanged(): Observable<IEntity> {
        return this._onKeyLightPropertiesChanged.observable;
    }

    public get onHazePropertiesChanged(): Observable<IEntity> {
        return this._onHazePropertiesChanged.observable;
    }

    public get onSkyboxPropertiesChanged(): Observable<IEntity> {
        return this._onSkyboxPropertiesChanged.observable;
    }

    public get onBloomPropertiesChanged(): Observable<IEntity> {
        return this._onBloomPropertiesChanged.observable;
    }

    public get keyLightMode(): ComponentMode | undefined {
        return this._keyLightMode;
    }

    public set keyLightMode(value: ComponentMode | undefined) {
        if (value && value !== this._keyLightMode) {
            this._keyLightMode = value;
            this._onKeyLightPropertiesChanged.isDirty = true;
        }
    }

    public get keyLight(): IKeyLightProperty | undefined {
        return this._keyLight;
    }

    public set keyLight(value: IKeyLightProperty | undefined) {
        if (value) {
            this._keyLight = value;
            this._onKeyLightPropertiesChanged.isDirty = true;
        }
    }

    public get skyboxMode(): ComponentMode | undefined {
        return this._skyboxMode;
    }

    public set skyboxMode(value: ComponentMode | undefined) {
        if (value && value !== this._skyboxMode) {
            this._skyboxMode = value;
            this._onSkyboxPropertiesChanged.isDirty = true;
        }
    }

    public get skybox(): ISkyboxProperty | undefined {
        return this._skybox;
    }

    public set skybox(value: ISkyboxProperty | undefined) {
        if (value) {
            this._skybox = value;
            this._onSkyboxPropertiesChanged.isDirty = true;
        }
    }

    public get hazeMode(): ComponentMode | undefined {
        return this._hazeMode;
    }

    public set hazeMode(value: ComponentMode | undefined) {
        this._hazeMode = value;

        if (value && value !== this._hazeMode) {
            this._hazeMode = value;
            this._onHazePropertiesChanged.isDirty = true;
        }
    }

    public get haze(): IHazeProperty | undefined {
        return this._haze;
    }

    public set haze(value: IHazeProperty | undefined) {
        if (value) {
            this._haze = value;
            this._onHazePropertiesChanged.isDirty = true;
        }
    }

    public get bloomMode(): ComponentMode | undefined {
        return this._bloomMode;
    }

    public set bloomMode(value: ComponentMode | undefined) {
        if (value && value !== this._bloomMode) {
            this._bloomMode = value;
            this._onBloomPropertiesChanged.isDirty = true;
        }
    }

    public get bloom(): IBloomProperty | undefined {
        return this._bloom;
    }

    public set bloom(value: IBloomProperty | undefined) {
        if (value) {
            this._bloom = value;
            this._onBloomPropertiesChanged.isDirty = true;
        }
    }

    public copyFormPacketData(props: EntityProperties): void {
        super.copyFormPacketData(props);

        const zoneProps = props as ZoneEntityProperties;

        this.shapeType = EntityMapper.mapToShapeType(zoneProps.shapeType);

        this.ambientLightMode = EntityMapper.mapToComponentMode(zoneProps.ambientLightMode);
        this.ambientLight = EntityMapper.mapToAmbientLightProperty(zoneProps.ambientLight);

        this.keyLightMode = EntityMapper.mapToComponentMode(zoneProps.keyLightMode);
        this.keyLight = Object.assign({}, zoneProps.keyLight);

        this.skyboxMode = EntityMapper.mapToComponentMode(zoneProps.skyboxMode);
        this.skybox = Object.assign({}, zoneProps.skybox);

        this.hazeMode = EntityMapper.mapToComponentMode(zoneProps.hazeMode);
        this.haze = EntityMapper.mapToHazeProperty(zoneProps.haze);

        this.bloomMode = EntityMapper.mapToComponentMode(zoneProps.bloomMode);
        this.bloom = EntityMapper.mapToBloomProperty(zoneProps.bloom);
    }
}
