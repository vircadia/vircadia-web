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
    IZoneProperties, IImageProperties, IMaterialProperties, IWebProperties } from "./EntityProperties";
import { Observable } from "@babylonjs/core";

export interface IEntity extends
    IEntityProperties,
    ISpatialProperties,
    IBehaviorProperties {

    onCommonPropertiesChanged?: Observable<IEntity>;
    onParentChanged?: Observable<IEntity>;
    onPositionAndRotationChanged?: Observable<IEntity>;
    onDimensionChanged?: Observable<IEntity>;
    onRenderModeChanged?: Observable<IEntity>;
    onScriptChanged?: Observable<IEntity>;
    onUserDataChanged?: Observable<IEntity>;
    onCollisionPropertiesChanged?: Observable<IEntity>;
    onPhysicsPropertiesChanged?: Observable<IEntity>;
}

export interface IModelEntity extends
    IEntity,
    IModelEProperties {

    onModelURLChanged?: Observable<IEntity>;
    onAnimationChanged?: Observable<IEntity>
}

export type JitsiSettings = {
    roomID: string;
    roomName: string;
};

export type WebExtensions = {
    jitsi: JitsiSettings | undefined
};

export interface IWebEntity extends
    IEntity,
    IWebProperties {

    onColorChanged: Observable<IEntity>;
    onSourceURLChanged: Observable<IEntity>;
    onWebPropertiesChanged: Observable<IEntity>;
}

export interface IShapeEntity extends
    IEntity,
    IShapeProperties {

    onShapeChanged?: Observable<IEntity>;
    onColorChanged?: Observable<IEntity>;
}

export interface ILightEntity extends
    IEntity,
    ILightProperties {

    onLightPropertiesChanged?: Observable<IEntity>;
    onLightTypeChanged?: Observable<IEntity>;
}

export interface IZoneEntity extends
    IEntity,
    IZoneProperties {

    onShapeTypeChanged: Observable<IEntity>;
    onAmbientLightPropertiesChanged: Observable<IEntity>;
    onKeyLightPropertiesChanged: Observable<IEntity>;
    onSkyboxPropertiesChanged: Observable<IEntity>;
    onHazePropertiesChanged: Observable<IEntity>;
    onBloomPropertiesChanged: Observable<IEntity>;
}

export interface IImageEntity extends
    IEntity,
    IImageProperties {

    onColorChanged: Observable<IEntity>;
    onImageURLChanged: Observable<IEntity>
}

export interface IMaterialEntity extends
    IEntity,
    IMaterialProperties {

    onMaterialDataChanged?: Observable<IEntity>;
    onMaterialMappingModeChanged?: Observable<IEntity>;
    onMaterialPriorityChanged?: Observable<IEntity>;
    onParentMaterialNameChanged?: Observable<IEntity>;
}
