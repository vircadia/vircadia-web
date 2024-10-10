//
//  materialEntity.ts
//
//  Created by Nolan Huang on 19 Sep 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { MaterialMappingMode, IVector2Property } from "../EntityProperties";
import { IEntity, IMaterialEntity } from "../EntityInterfaces";
import { Observable } from "@babylonjs/core";
import { Entity, EntityPropertyChangeObservable } from "./Entity";
import { EntityProperties, MaterialEntityProperties } from "@vircadia/web-sdk";
import { EntityMapper } from "../package";

export class MaterialEntity extends Entity implements IMaterialEntity {

    protected _materialURL: string | undefined = "";
    protected _materialData: string | undefined = "";
    protected _priority: number | undefined = 0;
    protected _parentMaterialName: string | undefined = "0";
    protected _materialMappingMode: MaterialMappingMode | undefined = "uv";
    protected _materialMappingPos: IVector2Property | undefined = { x: 0, y: 0 };
    protected _materialMappingScale: IVector2Property | undefined = { x: 1, y: 1 };
    protected _materialMappingRot: number | undefined = 0;
    protected _materialRepeat: boolean | undefined = true;

    protected _onMaterialDataChanged: EntityPropertyChangeObservable<IEntity>;
    protected _onMaterialMappingModeChanged: EntityPropertyChangeObservable<IEntity>;
    protected _onMaterialPriorityChanged: EntityPropertyChangeObservable<IEntity>;
    protected _onParentMaterialNameChanged: EntityPropertyChangeObservable<IEntity>;

    constructor(id: string) {
        super(id, "Material");
        this._onMaterialDataChanged = this.createPropertyChangeObservable();
        this._onMaterialMappingModeChanged = this.createPropertyChangeObservable();
        this._onMaterialPriorityChanged = this.createPropertyChangeObservable();
        this._onParentMaterialNameChanged = this.createPropertyChangeObservable();
    }

    public get materialURL(): string | undefined {
        return this._materialURL;
    }

    public set materialURL(value: string | undefined) {
        if (value && value !== this._materialURL) {
            this._materialURL = value;
            this._onMaterialDataChanged.isDirty = true;
        }
    }

    public get materialData(): string | undefined {
        return this._materialData;
    }

    public set materialData(value: string | undefined) {
        if (value && value !== this._materialData) {
            this._materialData = value;
            this._onMaterialDataChanged.isDirty = true;
        }
    }

    public get priority(): number | undefined {
        return this._priority;
    }

    public set priority(value: number | undefined) {
        if (typeof value === "number" && value !== this._priority) {
            this._priority = value;
            this._onMaterialPriorityChanged.isDirty = true;
        }
    }

    public get parentMaterialName(): string | undefined {
        return this._parentMaterialName;
    }

    public set parentMaterialName(value: string | undefined) {
        if (value && value !== this._materialURL) {
            this._parentMaterialName = value;
            this._onParentMaterialNameChanged.isDirty = true;
        }
    }

    public get materialMappingMode(): MaterialMappingMode | undefined {
        return this._materialMappingMode;
    }

    public set materialMappingMode(value: MaterialMappingMode | undefined) {
        if (value && value !== this._materialMappingMode) {
            this._materialMappingMode = value;
            this._onMaterialMappingModeChanged.isDirty = true;
        }
    }

    public get materialMappingPos(): IVector2Property | undefined {
        return this._materialMappingPos;
    }

    public set materialMappingPos(value: IVector2Property | undefined) {
        if (value && value !== this._materialMappingPos) {
            this._materialMappingPos = value;
            this._onMaterialMappingModeChanged.isDirty = true;
        }
    }

    public get materialMappingScale(): IVector2Property | undefined {
        return this._materialMappingScale;
    }

    public set materialMappingScale(value: IVector2Property | undefined) {
        if (value && value !== this._materialMappingScale) {
            this._materialMappingScale = value;
            this._onMaterialMappingModeChanged.isDirty = true;
        }
    }

    public get materialMappingRot(): number | undefined {
        return this._materialMappingRot;
    }

    public set materialMappingRot(value: number | undefined) {
        if (typeof value === "number" && value !== this._materialMappingRot) {
            this._materialMappingRot = value;
            this._onMaterialMappingModeChanged.isDirty = true;
        }
    }

    public get materialRepeat(): boolean | undefined {
        return this._materialRepeat;
    }

    public set materialRepeat(value: boolean | undefined) {
        if (value && value !== this.materialRepeat) {
            this.materialRepeat = value;
            this._onMaterialMappingModeChanged.isDirty = true;
        }
    }

    public get onMaterialDataChanged(): Observable<IEntity> {
        return this._onMaterialDataChanged.observable;
    }

    public get onMaterialMappingModeChanged(): Observable<IEntity> {
        return this._onMaterialMappingModeChanged.observable;
    }

    public get onMaterialPriorityChanged(): Observable<IEntity> {
        return this._onMaterialPriorityChanged.observable;
    }

    public get onParentMaterialNameChanged(): Observable<IEntity> {
        return this._onParentMaterialNameChanged.observable;
    }


    public copyFromPacketData(props: EntityProperties): void {
        super.copyFromPacketData(props);

        const materialProps = props as MaterialEntityProperties;

        this.materialURL = materialProps.materialURL;
        this.materialData = materialProps.materialData;

        this.priority = materialProps.priority;

        this.parentMaterialName = materialProps.parentMaterialName;

        this.materialMappingMode = EntityMapper.mapToMaterialMappingMode(materialProps.materialMappingMode);
        this.materialMappingPos = materialProps.materialMappingPos;
        this.materialMappingScale = materialProps.materialMappingScale;
        this.materialMappingRot = materialProps.materialMappingRot;
        this.materialRepeat = materialProps.materialRepeat;
    }
}
