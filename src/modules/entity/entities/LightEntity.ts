//
//  LightEntity.ts
//
//  Created by Nolan Huang on 17 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { IColorProperty } from "../EntityProperties";
import { IEntity, ILightEntity } from "../EntityInterfaces";
import { Entity, EntityPropertyChangeObservable } from "./Entity";
import { EntityProperties, LightEntityProperties } from "@vircadia/web-sdk";
import { Observable } from "@babylonjs/core";


export class LightEntity extends Entity implements ILightEntity {
    protected _color: IColorProperty | undefined;
    protected _isSpotlight: boolean | undefined;
    protected _exponent: number | undefined;
    protected _cutoff: number | undefined;
    protected _falloffRadius: number | undefined;
    protected _intensity: number | undefined;
    protected _onLightPropertiesChanged: EntityPropertyChangeObservable<IEntity>;
    protected _onLightTypeChanged: EntityPropertyChangeObservable<IEntity>;

    constructor(id: string) {
        super(id, "Light");

        this._onLightPropertiesChanged = this.createPropertyChangeObservable();
        this._onLightTypeChanged = this.createPropertyChangeObservable();
    }

    public get color(): IColorProperty | undefined {
        return this._color;
    }

    public set color(value: IColorProperty | undefined) {
        if (value) {
            this._color = value;
            this._onLightPropertiesChanged.isDirty = true;
        }
    }

    public get isSpotlight(): boolean | undefined {
        return this._isSpotlight;
    }

    public set isSpotlight(value: boolean | undefined) {
        if (value !== undefined && value !== this._isSpotlight) {
            this._isSpotlight = value;
            this._onLightTypeChanged.isDirty = true;
        }
    }

    public get exponent(): number | undefined {
        return this._exponent;
    }

    public set exponent(value: number | undefined) {
        if (typeof value === "number" && value !== this._exponent) {
            this._exponent = value;
            this._onLightPropertiesChanged.isDirty = true;
        }
    }

    public get cutoff(): number | undefined {
        return this._cutoff;
    }

    public set cutoff(value: number | undefined) {
        if (typeof value === "number" && value !== this._cutoff) {
            this._cutoff = value;
            this._onLightPropertiesChanged.isDirty = true;
        }
    }

    public get falloffRadius(): number | undefined {
        return this._falloffRadius;
    }

    public set falloffRadius(value: number | undefined) {
        if (typeof value === "number" && value !== this._falloffRadius) {
            this._falloffRadius = value;
            this._onLightPropertiesChanged.isDirty = true;
        }
    }

    public get intensity(): number | undefined {
        return this._intensity;
    }

    public set intensity(value: number | undefined) {
        if (typeof value === "number" && value !== this._intensity) {
            this._intensity = value;
            this._onLightPropertiesChanged.isDirty = true;
        }
    }

    public get onLightPropertiesChanged(): Observable<IEntity> {
        return this._onLightPropertiesChanged.observable;
    }

    public get onLightTypeChanged(): Observable<IEntity> {
        return this._onLightTypeChanged.observable;
    }

    public copyFromPacketData(props: EntityProperties): void {
        super.copyFromPacketData(props);

        const lightProps = props as LightEntityProperties;

        this.color = lightProps.color;
        this.isSpotlight = lightProps.isSpotlight;
        this.intensity = lightProps.intensity;
        this.exponent = lightProps.exponent;
        this.cutoff = lightProps.cutoff;
        this.falloffRadius = lightProps.falloffRadius;

    }
}
