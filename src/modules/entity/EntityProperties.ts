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
    ISkyboxProperty, IHazeProperty, IBloomProperty } from "./Properties";


type EntityType = "Model" | "Box" | "Cube" | "Sphere" |
"Light" | "Text" | "Image" | "Web" | "Zone" | "Particle" | "Material";

export interface IEntityProperties {
    id: string;
    type: EntityType;
    created: Date;
    lastEdited: Date;
    lastEditedBy: Date;
    name?: string;
    parentID?: string;
    position?: IVector3Property;
    rotation?: IQuaternionProperty;
    dimensions?: IVector3Property;
    grab: {
        grabbable: boolean;
    }
}

export interface IMeshEntityProperties extends IEntityProperties {
    canCastShadow: boolean;
}

export interface IModelEntityProperties extends IMeshEntityProperties {
    modelURL: string;
    shapeType: string;
}

export interface IShapeEntityProperties extends IMeshEntityProperties {
    shape: string;
    color?: { red: number; green: number; blue: number; alpha?: number };
}

export interface ILightEntityProperties extends IEntityProperties {
    isSpotlight: boolean;
    exponent?: number;
    cutoff?: number;
    falloffRadius?: number;
    intensity?: number;
}

export interface IZoneEntityProperties extends IEntityProperties {
    userData: string;
    shapeType: string;
    ambientLight?: IAmbientLightProperty;
    keyLight?: IKeyLightProperty;
    skybox?: ISkyboxProperty;
    haze?: IHazeProperty;
    bloom?: IBloomProperty;
}
