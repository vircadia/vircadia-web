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

export interface IEntity extends
    IEntityCommonProperties,
    ISpatialProperties {
}

export interface IModelEntity extends
    IEntity,
    IBehaviorProperties,
    IModelEProperties {
}

export interface IShapeEntity extends
    IEntity,
    IBehaviorProperties,
    IShapeProperties {
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
