/*
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

// This is disabled because TS complains about BABYLON's use of cap'ed function names
/* eslint-disable new-cap */

import * as BABYLON from "babylonjs";

// Vircadia "types" defined so  the BABYLON definitions don't pollute the UI
export type VVector3 = BABYLON.Vector3;
export type VVector4 = BABYLON.Vector4;
