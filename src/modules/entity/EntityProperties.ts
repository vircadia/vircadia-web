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

import { WebInputMode } from "@vircadia/web-sdk";


export type EntityType =
    "Unknown" | "Box" | "Sphere" | "Shape" | "Model" |
    "Text" | "Image" | "Web" | "ParticleEffect" |
    "Line" | "PolyLine" | "PolyVox" | "Grid" | "Gizmo" |
    "Light" | "Zone" | "Material";

export type Shape =
    "Circle" | "Cone" | "Cube" | "Cylinder" | "Dodecahedron" |
    "Hexagon" | "Icosahedron" | "Octagon" | "Octahedron" |
    "Quad" | "Sphere" | "Tetrahedron" | "Torus" | "Triangle";

export const ShapeType = {
    None: "none",
    Box: "box",
    Sphere: "sphere",
    Cylinder: "cylinder",
    CapsuleX: "capsule-x",
    CapsuleY: "capsule-y",
    CapsuleZ: "capsule-z",
    CylinderX: "cylinder-x",
    CylinderY: "cylinder-y",
    CylinderZ: "cylinder-z",
    Hull: "hull",
    Compound: "compound",
    SimpleHull: "simple-hull",
    SimpleCompound: "simple-compound",
    StaticMesh: "static-mesh",
    Plane: "plane",
    Ellipsoid: "ellipsoid",
    Circle: "circle",
    Multisphere: "multisphere"
} as const;

export type ShapeType = typeof ShapeType[keyof typeof ShapeType];

export type MaterialMappingMode = "uv" | "projected";

export type BillboardMode = "none" | "yaw" | "full";

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

export interface IVector2Property {
    x: number;
    y: number;
}

export interface IVector3Property {
    x: number;
    y: number;
    z: number;
}

export interface IQuaternionProperty {
    x: number;
    y: number;
    z: number;
    w: number;
}

export interface IColorProperty {
    red: number;
    green: number;
    blue: number;
    // alpha?: number;
}

export interface IAmbientLightProperty {
    ambientIntensity?: number | undefined;
    ambientURL?: string | undefined;
}

export interface IKeyLightProperty {
    color?: IColorProperty | undefined;
    intensity?: number | undefined;
    direction?: IVector3Property | undefined;
    castShadows?: boolean | undefined;
    shadowBias?: number | undefined;
    shadowMaxDistance?: number | undefined;
}

export interface ISkyboxProperty {
    color: IColorProperty | undefined;
    url: string | undefined;
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

export interface IRectProperty {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface IAnimationProperties {
    url?: string | undefined;
    allowTranslation?: boolean | undefined;
    fps?: number | undefined;
    firstFrame?: number | undefined;
    lastFrame?: number | undefined;
    currentFrame?: number | undefined;
    running?: boolean | undefined;
    loop?: boolean | undefined;
    hold?: boolean | undefined;
}

export interface ISpatialProperties {
    position: IVector3Property | undefined;
    rotation: IQuaternionProperty | undefined;
    dimensions: IVector3Property | undefined;
}

export interface ICollisionProperties {
    collisionless: boolean | undefined;
    collisionMask: number | undefined;
    collisionSoundURL: string | undefined;
    dynamic: boolean | undefined;
}

export interface IPhysicsProperties {
    velocity: IVector3Property | undefined;
    damping: number | undefined;
    angularVelocity: IVector3Property | undefined;
    angularDamping: number | undefined;
    restitution: number | undefined;
    friction: number | undefined;
    density: number | undefined;
    gravity: IVector3Property | undefined;
}

export interface IBehaviorProperties extends ICollisionProperties, IPhysicsProperties {
    grab?: IGrabProperty;
    canCastShadow?: boolean;
}

export interface IShapeProperties {
    shape: Shape | undefined;
    color: IColorProperty | undefined;
    alpha: number | undefined;
}

export interface IWebProperties {
    sourceUrl: string | undefined;
    color: IColorProperty | undefined;
    alpha: number | undefined;
    dpi: number | undefined;
    scriptURL: string | undefined;
    maxFPS: number | undefined;
    inputMode: WebInputMode | undefined;
    showKeyboardFocusHighlight: boolean | undefined;
    useBackground: boolean | undefined;
    userAgent: string | undefined;

}

export interface IModelEProperties {
    modelURL: string | undefined;
    modelScale?: IVector3Property;
    shapeType: string | undefined;
    animation: IAnimationProperties | undefined;
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
    name: string | undefined;
    type: EntityType;
    created?: Date;
    lastEdited?: Date;
    lastEditedBy?: Date;
    parentID: string | undefined;
    billboardMode: string | undefined;
    renderLayer?: string | undefined;
    primitiveMode?: string | undefined;
    visible: boolean | undefined;
    script: string | undefined;
    userData: string | undefined;
}

export interface IImageProperties {
    imageURL: string | undefined;
    emissive?: boolean | undefined;
    keepAspectRatio?: boolean | undefined;
    subImage?: IRectProperty | undefined;
    color?: IColorProperty | undefined;
    alpha?: number | undefined;
}

export interface IMaterialProperties {
    materialURL: string | undefined;
    materialData: string | undefined;
    priority: number | undefined;
    parentMaterialName: string | undefined;
    materialMappingMode: MaterialMappingMode | undefined;
    materialMappingPos: IVector2Property | undefined;
    materialMappingScale: IVector2Property | undefined;
    materialMappingRot: number | undefined;
    materialRepeat: boolean | undefined;
}
