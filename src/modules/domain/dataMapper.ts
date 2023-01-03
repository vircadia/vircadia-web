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

import { vec3, quat, Vec3, Quat } from "@vircadia/web-sdk";

/* eslint-disable @typescript-eslint/no-magic-numbers */

export class DataMapper {

    static mapVec3ToString(vec: Nullable<vec3>): string {
        if (vec) {
            const digits = 2;
            return `${vec.x.toFixed(digits)},${vec.y.toFixed(digits)},${vec.z.toFixed(digits)}`;
        }
        return "0,0,0";
    }

    static mapQuaternionToString(q: Nullable<quat>): string {
        if (q) {
            const digits = 2;
            return `${q.x.toFixed(digits)},${q.y.toFixed(digits)},${q.z.toFixed(digits)},${q.w.toFixed(digits)}`;
        }
        return "0,0,0,1";
    }

    static mapStringToVec3(vecStr: string) : vec3 {
        const array = vecStr.split(",").map((value) => Number(value));
        if (array.length >= 3) {
            return { x: array[0], y: array[1], z: array[2] };
        }

        return Vec3.ZERO;
    }

    static mapStringToQuaternion(quatStr: string) : quat {
        const array = quatStr.split(",").map((value) => Number(value));
        if (array.length >= 4) {
            return { x: array[0], y: array[1], z: array[2], w: array[3] };
        }

        return Quat.IDENTITY;
    }
}
