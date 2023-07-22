//
//  dataMapper.ts
//
//  Created by Nolan Huang on 23 Sep 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { type vec3, type quat, Vec3, Quat } from "@vircadia/web-sdk";
import type { Vector3 } from "@babylonjs/core";

const vector3Length = 3;
const vector4Length = 4;

/**
 * Maximum number of fractional digits to show.
 */
const digits = 2;

/**
 * Static methods for converting data from one format to another.
 */
export class DataMapper {
    /**
     * Convert a `vec3` to its string representation.
     * @param vector The vector to convert.
     * @returns The string representation.
     */
    public static vec3ToString(vector: Nullable<vec3>): string {
        if (vector) {
            return `${vector.x.toFixed(digits)},${vector.y.toFixed(digits)},${vector.z.toFixed(digits)}`;
        }
        return "0,0,0";
    }

    /**
     * Convert a `quat` to its string representation.
     * @param quaternion The quaternion to convert.
     * @returns The string representation.
     */
    public static quaternionToString(quaternion: Nullable<quat>): string {
        if (quaternion) {
            return `${quaternion.x.toFixed(digits)},${quaternion.y.toFixed(digits)},${quaternion.z.toFixed(digits)},${quaternion.w.toFixed(digits)}`;
        }
        return "0,0,0,1";
    }

    /**
     * Parse a `vec3` from a string.
     * @param string The string to parse.
     * @returns The parsed vector.
     */
    public static stringToVec3(string: string): vec3 {
        const array = string.split(",").map((value) => Number(value));
        if (array.length < vector3Length) {
            return Vec3.ZERO;
        }
        return { x: array[0], y: array[1], z: array[2] };
    }

    /**
     * Parse a `quat` from a string.
     * @param string The string to parse.
     * @returns The parsed quaternion.
     */
    public static stringToQuaternion(string: string): quat {
        const array = string.split(",").map((value) => Number(value));
        if (array.length < vector4Length) {
            return Quat.IDENTITY;
        }
        return { x: array[0], y: array[1], z: array[2], w: array[vector4Length - 1] };
    }

    /**
     * Compare two scalars.
     * @param scalarA
     * @param scalarB
     * @param tolerance `(Optional)` The tolerance with which to compare the scalars. (Defaults to `0`).
     * @returns `true` if the vectors are comparable, `false` if they differ.
     */
    public static compareScalar(scalarA: number, scalarB: number, tolerance = 0): boolean {
        return scalarA === scalarB || scalarB - tolerance < scalarA && scalarA < scalarB + tolerance;
    }

    /**
     * Compare two vectors.
     * @param vectorA
     * @param vectorB
     * @param tolerance `(Optional)` The tolerance with which to compare the vectors. (Defaults to `0`).
     * @returns `true` if the vectors are comparable, `false` if they differ.
     */
    public static compareVec3(vectorA: vec3 | Vector3, vectorB: vec3 | Vector3, tolerance = 0): boolean {
        const x = this.compareScalar(vectorA.x, vectorB.x, tolerance);
        const y = this.compareScalar(vectorA.y, vectorB.y, tolerance);
        const z = this.compareScalar(vectorA.z, vectorB.z, tolerance);
        return x && y && z;
    }
}
