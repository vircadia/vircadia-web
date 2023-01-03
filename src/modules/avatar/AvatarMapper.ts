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

    public static mapToDomainPosition(position : Vector3) : vec3 {
        return { x: position.x, y: position.y, z: position.z };
    }

    public static mapToDomainOrientation(rotationQuaternion : Nullable<Quaternion>) : quat {
        // prevent null and w === 0
        const q = rotationQuaternion ? rotationQuaternion : Quaternion.Identity();
        return { x: q.x, y: q.y, z: q.z, w: q.w === 0 ? 1 : q.w };
    }

    public static mapToDomainScale(scaling : Vector3) : number {
        return scaling.x;
    }

    public static mapDomainPosition(position : vec3 | null) : Vector3 {
        return position ? new Vector3(position.x, position.y, position.z) : Vector3.Zero();
    }

    public static mapDomainOrientation(q : quat | null) : Quaternion {
        return q ? new Quaternion(q.x, q.y, q.z, q.w) : Quaternion.Identity();
    }

    public static mapToNodeScaling(scale :number) : Vector3 {
        return new Vector3(scale, scale, scale);
    }

    public static mapToJoint(node:TransformNode, jointIndex : number, parentIndex : number) : SkeletonJoint {
        return {
            jointName: node.name,
            jointIndex,
            parentIndex,
            boneType: parentIndex === -1 ? BoneType.SkeletonRoot : BoneType.SkeletonChild,
            defaultTranslation: AvatarMapper.mapToJointTranslation(node.position),
            defaultRotation: AvatarMapper.mapToJointRotation(node.rotationQuaternion),
            defaultScale: AvatarMapper.mapToDomainScale(node.scaling)
        };
    }

    public static mapToJointTranslation(vec : Vector3) : vec3 {
        return { x: vec.x, y: vec.y, z: vec.z };
    }

    public static mapToJointRotation(quaternion : Nullable<Quaternion>) : quat {
        // prevent null and w === 0
        const q = quaternion ? quaternion : Quaternion.Identity();
        return { x: q.x, y: q.y, z: q.z, w: q.w === 0 ? 1 : q.w };
    }

    public static mapJointTranslation(translation : vec3) : Vector3 {
        return new Vector3(translation.x, translation.y, translation.z);
    }

    public static mapJointRotation(q : quat) : Quaternion {
        return new Quaternion(q.x, q.y, q.z, q.w);
    }
}
