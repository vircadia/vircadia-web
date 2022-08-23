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
import { IEntityProperties, ISpatialProperties, IBehaviorProperties,
    IModelEProperties, IShapeProperties, ILightProperties,
    IZoneProperties } from "./EntityProperties";
import { Observable } from "@babylonjs/core";

export interface IEntity extends
    IEntityProperties,
    ISpatialProperties,
    IBehaviorProperties {

    onCommonPropertiesChanged ?: Observable<IEntity>;
    onPositionAndRotationChanged ?: Observable<IEntity>;
    onDimensionChanged ?: Observable<IEntity>;
    onCollisionPropertiesChanged ?: Observable<IEntity>;
    onUserDataChanged ?: Observable<IEntity>;
}

export interface IModelEntity extends
    IEntity,
    IModelEProperties {

    onModelURLChanged ?: Observable<IEntity>;
}

export interface IShapeEntity extends
    IEntity,
    IShapeProperties {

    onShapeChanged ?: Observable<IEntity>;
    onColorChanged ?: Observable<IEntity>;
}

export interface ILightEntity extends
    IEntity,
    ILightProperties {

    onLightPropertiesChanged ?: Observable<IEntity>;
    onLightTypeChanged ?: Observable<IEntity>;
}

export interface IZoneEntity extends
    IEntity,
    IZoneProperties {

    onShapeTypeChanged : Observable<IEntity>;
    onAmbientLightPropertiesChanged : Observable<IEntity>;
    onKeyLightPropertiesChanged : Observable<IEntity>;
    onSkyboxPropertiesChanged : Observable<IEntity>;
    onHazePropertiesChanged : Observable<IEntity>;
    onBloomPropertiesChanged : Observable<IEntity>;
}
