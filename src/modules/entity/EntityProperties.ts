//
//  EntityProperties.ts
//
//  Created by Nolan Huang on 26 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
import { IVector3Property, IQuaternionProperty,
    IAmbientLightProperty, IKeyLightProperty,
    ISkyboxProperty, IHazeProperty, IBloomProperty,
    IGrabProperty, IColorProperty } from "./Properties";


export type EntityType = "Model" | "Box" |
"Light" | "Text" | "Image" | "Web" | "Zone" | "Particle" | "Material";

export type Shape = "Cube" | "Sphere";

export type ShapeType = "box" | "sphere" | "cylinder";

export type CollisionTarget = "static" | "dynamic" | "kinematic" | "otherAvatar" | "myAvatar";

export interface ISpatialProperties {
    position?: IVector3Property;
    rotation?: IQuaternionProperty;
    dimensions?: IVector3Property;
}

export interface ICollisionProperties {
    collision?: string;
    collidesWith?: CollisionTarget;
}

export interface IBehaviorProperties extends ICollisionProperties {
    grab?: IGrabProperty;
    canCastShadow?: boolean;
}

export interface IShapeProperties {
    shape: Shape;
    color?: IColorProperty;
}

export interface IModelEProperties {
    modelURL: string;
    shapeType: string;
}

export interface ILightProperties {
    isSpotlight: boolean;
    exponent?: number;
    cutoff?: number;
    falloffRadius?: number;
    intensity?: number;
}

export interface IZoneProperties {
    userData: string;
    shapeType: string;
    ambientLight?: IAmbientLightProperty;
    keyLight?: IKeyLightProperty;
    skybox?: ISkyboxProperty;
    haze?: IHazeProperty;
    bloom?: IBloomProperty;
}

export interface IEntityProperties extends ISpatialProperties {
    id: string;
    type: EntityType;
    created: Date;
    lastEdited: Date;
    lastEditedBy: Date;
    name?: string;
    parentID?: string;
    visible?: boolean;
}

export interface IModelEntityProperties extends
    IEntityProperties,
    IBehaviorProperties,
    IModelEProperties {
}

export interface IShapeEntityProperties extends
    IEntityProperties,
    IBehaviorProperties,
    IShapeProperties {
}

export interface ILightEntityProperties extends
    IEntityProperties,
    IBehaviorProperties,
    ILightProperties {
}

export interface IZoneEntityProperties extends
    IEntityProperties,
    IBehaviorProperties,
    IZoneProperties {
}
