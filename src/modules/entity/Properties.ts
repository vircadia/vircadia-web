//
//  Properties.ts
//
//  Created by Nolan Huang on 27 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { Vector3 } from "@babylonjs/core/Maths/math.vector";

export interface IPropertyVector3 {
    x: number;
    y: number;
    z: number;
}

export interface IPropertyQuaternion {
    x: number;
    y: number;
    z: number;
    w: number
}

export interface IPropertyColor {
    red: number;
    green: number;
    blue: number;
}

export interface IPropertyAmbientLight {
    ambientIntensity: number;
    ambientURL? : string;
}

export interface IPropertyKeyLight {
    color?: IPropertyColor;
    intensity? : number;
    direction : Vector3;
    castShadows: boolean;
    shadowBias: number;
    shadowMaxDistance: number;
}
