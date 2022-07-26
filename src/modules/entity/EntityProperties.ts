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

type EntityType = "Model" | "Box" | "Cube" | "Sphere" |
"Light" | "Text" | "Image" | "Web" | "Zone" | "Particle" | "Material";

export interface IEntityProperties {
    id: string;
    type: EntityType;
    created: Date;
    lastEdited: Date;
    lastEditedBy: Date;
    name: string;
    parentID: string;
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number; w?: number };
    dimensions: { x: number; y: number; z: number; };   // scaling
}

export interface IModelEntityProperties extends IEntityProperties {
    modelURL: string;
}

export interface IShapeEntityProperties extends IEntityProperties {
    shape: string;
    color?: { red: number; green: number; blue: number; alpha?: number };
}

export interface ILightEntityProperties extends IEntityProperties {
    isSpotlight: boolean;
}
