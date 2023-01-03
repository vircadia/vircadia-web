//
//  DomainProperties.ts
//
//  Created by Nolan Huang on 2 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

export enum EntityType {
    Unknown = 0,
    Box = 1,
    Sphere = 2,
    Shape = 3,
    Model = 4,
    Text = 5,
    Image = 6,
    Web = 7,
    ParticleEffect = 8,
    Line = 9,
    PolyLine = 10,
    PolyVox = 11,
    Grid = 12,
    Gizmo = 13,
    Light = 14,
    Zone = 15,
    Material = 16,
    NUM_TYPES = 17
}

export enum ShapeType {
    // C++  enum ShapeType
    NONE,
    BOX,
    SPHERE,
    CAPSULE_X,
    CAPSULE_Y,
    CAPSULE_Z,
    CYLINDER_X,
    CYLINDER_Y,
    CYLINDER_Z,
    HULL,
    PLANE,
    COMPOUND,
    SIMPLE_HULL,
    SIMPLE_COMPOUND,
    STATIC_MESH,
    ELLIPSOID,
    CIRCLE,
    MULTISPHERE
}

export enum ComponentMode {
    // C++  enum ComponentMode
    INHERIT,
    DISABLED,
    ENABLED,

    ITEM_COUNT
}

export enum MaterialMappingMode {
    // C++  enum MaterialMappingMode
    UV = 0,
    PROJECTED,
    // Put new mapping-modes before this line.
    UNSET_MATERIAL_MAPPING_MODE
}
