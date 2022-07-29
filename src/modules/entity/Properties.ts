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
    alpha?: number;
}

export interface IAmbientLightProperty {
    ambientIntensity: number;
    ambientURL? : string;
}

export interface IKeyLightProperty {
    color?: IColorProperty;
    intensity? : number;
    direction : Vector3;
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
