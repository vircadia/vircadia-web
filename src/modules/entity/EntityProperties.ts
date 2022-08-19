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
    ambientIntensity?: number | undefined;
    ambientURL? : string | undefined;
}

export interface IKeyLightProperty {
    color?: IColorProperty | undefined;
    intensity? : number | undefined;
    direction? : IVector3Property | undefined;
    castShadows?: boolean | undefined;
    shadowBias?: number | undefined;
    shadowMaxDistance?: number | undefined;
}

export interface ISkyboxProperty {
    color?: IColorProperty | undefined;
    url?:string | undefined;
}

export interface IHazeProperty {
    hazeRange?: number | undefined;
    hazeColor?: IColorProperty | undefined;
    hazeEnableGlare?: boolean | undefined;
    hazeGlareColor?: IColorProperty | undefined;
    hazeGlareAngle?: number | undefined;
    hazeAltitudeEffect?: boolean | undefined;
    hazeBaseRef?: number | undefined;
    hazeCeiling?: number | undefined;
    hazeBackgroundBlend?: number | undefined;
    hazeAttenuateKeyLight?: boolean | undefined;
    hazeKeyLightRange?: number | undefined;
    hazeKeyLightAltitude?: number | undefined;
}

export interface IBloomProperty {
    bloomIntensity?: number | undefined;
    bloomThreshold?: number | undefined;
    bloomSize?: number | undefined;
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

export type ShapeType = "none" | "box" | "sphere" | "cylinder" |
"capsule-x" | "capsule-y" | "capsule-z" | "cylinder-x" | "cylinder-y" | "cylinder-z" |
"hull" | "compound" | "simple-hull" | "simple-compound" | "static-mesh" |
"plane" | "ellipsoid" | "circle" | "multisphere";

export enum CollisionMask {
    None = 0,
    Static = 1,
    Dynamic = 2,
    Kinematic = 4,
    MyAvatar = 8,
    OtherAvatar = 16
}

export type CollisionTarget = "static" | "dynamic" | "kinematic" | "myAvatar" | "otherAvatar";

export type ComponentMode = "inherit" | "disabled" | "enabled";

export type AvatarPriorityMode = "inherit" | "crowd" | "hero";

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
    color?: IColorProperty | undefined;
    isSpotlight?: boolean | undefined;
    exponent?: number | undefined;
    cutoff?: number | undefined;
    falloffRadius?: number | undefined;
    intensity?: number | undefined;
}

export interface IZoneProperties {
    shapeType?: ShapeType | undefined;
    compoundShapeURL?: string | undefined;
    keyLightMode?: ComponentMode | undefined;
    keyLight?: IKeyLightProperty | undefined;
    ambientLightMode?: ComponentMode | undefined;
    ambientLight?: IAmbientLightProperty | undefined;
    skyboxMode?: ComponentMode | undefined;
    skybox?: ISkyboxProperty | undefined;
    hazeMode?: ComponentMode | undefined;
    haze?: IHazeProperty | undefined;
    bloomMode?: ComponentMode | undefined;
    bloom?: IBloomProperty | undefined;
    flyingAllowed?: boolean | undefined;
    ghostingAllowed?: boolean | undefined;
    filterURL?: string | undefined;
    avatarPriority?: AvatarPriorityMode | undefined;
    screenshare?: ComponentMode | undefined;
}

export interface IEntityProperties {
    id: string;
    name?: string | undefined;
    type: EntityType;
    created?: Date;
    lastEdited?: Date;
    lastEditedBy?: Date;
    parentID?: string | undefined;
    visible?: boolean | undefined;
    userData?: string | undefined;
}
