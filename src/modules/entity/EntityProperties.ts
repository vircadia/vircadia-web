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

export interface IVector3Property {
    x: number;
    y: number;
    z: number;
}

export interface IQuaternionProperty {
    x: number;
    y: number;
    z: number;
    w: number
}

export interface IColorProperty {
    red: number;
    green: number;
    blue: number;
    // alpha?: number;
}

export interface IAmbientLightProperty {
    ambientIntensity: number;
    ambientURL? : string;
}

export interface IKeyLightProperty {
    color?: IColorProperty;
    intensity? : number;
    direction : IVector3Property;
    castShadows: boolean;
    shadowBias: number;
    shadowMaxDistance: number;
}

export interface ISkyboxProperty {
    color?: IColorProperty;
    url?:string;
}

export interface IHazeProperty {
    hazeRange: number;
    hazeColor: IColorProperty;
    hazeGlareColor: IColorProperty;
    hazeEnableGlare: boolean;
    hazeGlareAngle: number;
    hazeCeiling: number;
    hazeBaseRef: number;
    hazeBackgroundBlend: number;
}

export interface IBloomProperty {
    bloomIntensity: number;
    bloomThreshold: number;
    bloomSize: number;
}

export interface IGrabProperty {
    grabbable: boolean;
    grabFollowsController?: boolean;
    equippableLeftRotation?: IQuaternionProperty;
    equippableRightRotation?: IQuaternionProperty;
}

export type EntityType =
"Unknown" | "Box" | "Sphere" | "Shape" | "Model" |
"Text" | "Image" | "Web" | "ParticleEffect" |
"Line" | "PolyLine" | "PolyVox" | "Grid" | "Gizmo" |
"Light" | "Zone" | "Material";

export type Shape =
"Circle" | "Cone" | "Cube" | "Cylinder" | "Dodecahedron" |
"Hexagon" | "Icosahedron" | "Octagon" | "Octahedron" |
"Quad" | "Sphere" | "Tetrahedron" | "Torus" | "Triangle";

export type ShapeType = "box" | "sphere" | "cylinder";

export enum CollisionMask {
    None = 0,
    Static = 1,
    Dynamic = 2,
    Kinematic = 4,
    MyAvatar = 8,
    OtherAvatar = 16
}

export type CollisionTarget = "static" | "dynamic" | "kinematic" | "myAvatar" | "otherAvatar";

export interface ISpatialProperties {
    position?: IVector3Property | undefined;
    rotation?: IQuaternionProperty | undefined;
    dimensions?: IVector3Property | undefined;
}

export interface ICollisionProperties {
    collision?: string;
    collidesWith?: CollisionTarget;
    collisionMask?: number | undefined;
}

export interface IBehaviorProperties extends ICollisionProperties {
    grab?: IGrabProperty;
    canCastShadow?: boolean;
}

export interface IShapeProperties {
    shape: Shape | undefined;
    color?: IColorProperty | undefined;
    alpha?: number | undefined;
}

export interface IModelEProperties {
    modelURL: string | undefined;
    shapeType: string | undefined;
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

export interface IEntityCommonProperties {
    id: string;
    type: EntityType;
    created?: Date;
    lastEdited?: Date;
    lastEditedBy?: Date;
    name?: string | undefined;
    parentID?: string | undefined;
    visible?: boolean | undefined;
}
