//
//  AvatarMapper.ts
//
//  Created by Nolan Huang on 16 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import {
    Quaternion,
    TransformNode,
    Vector3
} from "@babylonjs/core";

// General Modules
import { SkeletonJoint, vec3, quat } from "@vircadia/web-sdk";

export enum BoneType {
    SkeletonRoot = 0,
    SkeletonChild,
    NonSkeletonRoot,
    NonSkeletonChild
}

/* eslint-disable new-cap */
export class AvatarMapper {

    public static mapToJointPosition(position : Vector3) : vec3 {
        return { x: position.x, y: position.y, z: position.z };
    }

    public static mapToJointQuaternion(rotationQuaternion : Nullable<Quaternion>) : quat {
        const q = rotationQuaternion ? rotationQuaternion : Quaternion.Zero();
        return { x: q.x, y: q.y, z: q.z, w: q.w };
    }

    public static mapToJointScale(scaling : Vector3) : number {
        return scaling.x;
    }

    public static mapToJoint(node:TransformNode, jointIndex : number, parentIndex : number) : SkeletonJoint {
        return {
            jointName: node.name,
            jointIndex,
            parentIndex,
            boneType: parentIndex === -1 ? BoneType.SkeletonRoot : BoneType.SkeletonChild,
            defaultTranslation: AvatarMapper.mapToJointPosition(node.position),
            defaultRotation: AvatarMapper.mapToJointQuaternion(node.rotationQuaternion),
            defaultScale: AvatarMapper.mapToJointScale(node.scaling)
        };
    }

    public static mapToNodePosition(position : vec3 | null) : Vector3 {
        return position ? new Vector3(position.x, position.y, position.z) : Vector3.Zero();
    }

    public static mapToNodeQuaternion(quaternion : quat | null) : Quaternion {
        return quaternion ? new Quaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w) : Quaternion.Zero();
    }

    public static mapToNodeScaling(scale :number) : Vector3 {
        return new Vector3(scale, scale, scale);
    }

}
