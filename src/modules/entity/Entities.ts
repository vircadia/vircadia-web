//
//  IEntity.ts
//
//  Created by Nolan Huang on 3 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
import { IEntityCommonProperties, ISpatialProperties, IBehaviorProperties,
    IModelEProperties, IShapeProperties, ILightProperties,
    IZoneProperties } from "./EntityProperties";
import { Observable } from "@babylonjs/core";

export interface IEntity extends
    IEntityCommonProperties,
    ISpatialProperties {

    onCommonPropertiesChanged ?: Observable<IEntity>;
    onPositionAndRotationChanged ?: Observable<IEntity>;
    onDimensionChanged ?: Observable<IEntity>;
}

export interface IModelEntity extends
    IEntity,
    IBehaviorProperties,
    IModelEProperties {

    onModelURLChanged ?: Observable<IEntity>;
}

export interface IShapeEntity extends
    IEntity,
    IBehaviorProperties,
    IShapeProperties {

    onShapeChanged ?: Observable<IEntity>;
    onColorChanged ?: Observable<IEntity>;
}

export interface ILightEntity extends
    IEntity,
    IBehaviorProperties,
    ILightProperties {
}

export interface IZoneEntity extends
    IEntity,
    IBehaviorProperties,
    IZoneProperties {
}
