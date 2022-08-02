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


// export type EntityType = "Model" | "Box" |
// "Light" | "Text" | "Image" | "Web" | "Zone" | "Particle" | "Material";

// export type Shape = "Cube" | "Sphere";

export enum EntityType {
    Unknown = "Unknown",
    Box = "Box",
    Sphere = "Sphere",
    Model = "Model",
    Text = "Text",
    Image = "Image",
    Web = "Web",
    ParticleEffect = "ParticleEffect",
    Line = "Line",
    PolyLine = "PolyLine",
    PolyVox = "PolyVox",
    Grid = "Grid",
    Gizmo = "Gizmo",
    Light = "Light",
    Zone = "Zone",
    Material = "Material"
}

export enum Shape {
    CIRCLE = "Circle",
    CONE = "Cone",
    CUBE = "Cube",
    CYLINDER = "Cylinder",
    DODECAHEDRON = "Dodecahedron",
    HEXAGON = "Hexagon",
    ICOSAHEDRON = "Icosahedron",
    OCTAGON = "Octagon",
    OCTAHEDRON = "Octahedron",
    QUAD = "Quad",
    SPHERE = "Sphere",
    TETRAHEDRON = "Tetrahedron",
    TORUS = "Torus",
    TRIANGLE = "Triangle"
}

export type ShapeType = "box" | "sphere" | "cylinder";

export type CollisionTarget = "static" | "dynamic" | "kinematic" | "otherAvatar" | "myAvatar";

export interface ISpatialProperties {
    position?: IVector3Property | undefined;
    rotation?: IQuaternionProperty | undefined;
    dimensions?: IVector3Property | undefined;
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

export interface IEntityProperties extends ISpatialProperties {
    id: string;
    type: EntityType;
    created?: Date;
    lastEdited?: Date;
    lastEditedBy?: Date;
    name?: string | undefined;
    parentID?: string | undefined;
    visible?: boolean | undefined;
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
