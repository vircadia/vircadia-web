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

/* eslint-disable new-cap */

import { Quaternion, TransformNode, Vector3 } from "@babylonjs/core";
import { SkeletonJoint, vec3, quat } from "@vircadia/web-sdk";

export enum BoneType {
    SkeletonRoot = 0,
    SkeletonChild,
    NonSkeletonRoot,
    NonSkeletonChild
}

export class AvatarMapper {
    /**
     * Convert a local `Vector3` position to a Domain-compatible position.
     * @param position The local position.
     * @returns A Domain-compatible position.
     */
    public static mapToDomainPosition(position: Vector3): vec3 {
        return { x: position.x, y: position.y, z: position.z };
    }

    /**
     * Convert a local `Quaternion` orientation to a Domain-compatible orientation.
     * @param orientation The local orientation.
     * @returns A Domain-compatible orientation.
     */
    public static mapToDomainOrientation(orientation: Nullable<Quaternion>): quat {
        // prevent null and w === 0
        const q = orientation ? orientation : Quaternion.Identity();
        return { x: q.x, y: q.y, z: q.z, w: q.w === 0 ? 1 : q.w };
    }

    /**
     * Convert a local `Vector3` scale to a Domain-compatible scale.
     * @param scale The local scale.
     * @returns A Domain-compatible scale.
     */
    public static mapToDomainScale(scale: Vector3): number {
        return scale.x;
    }

    /**
     * Convert a position from the Domain server to a local `Vector3` position.
     * @param position The Domain position.
     * @returns A local position.
     */
    public static mapToLocalPosition(position: vec3 | null): Vector3 {
        return position ? new Vector3(position.x, position.y, position.z) : Vector3.Zero();
    }

    /**
     * Convert an orientation from the Domain server to a local `Quaternion` orientation.
     * @param orientation The Domain orientation.
     * @returns A local orientation.
     */
    public static mapToLocalOrientation(orientation: quat | null): Quaternion {
        return orientation ? new Quaternion(orientation.x, orientation.y, orientation.z, orientation.w) : Quaternion.Identity();
    }

    /**
     * Convert a scale from the Domain server to a local `Vector3` scale.
     * @param scale The Domain scale.
     * @returns A local scale.
     */
    public static mapToLocalScaling(scale: number): Vector3 {
        return new Vector3(scale, scale, scale);
    }

    /**
     * Convert a local `TransformNode` joint to a Domain-compatible skeleton joint.
     * @param node The local joint node.
     * @param jointIndex The local joint's index.
     * @param parentIndex The local joints' parent's index.
     * @returns A Domain-compatible skeleton joint.
     */
    public static mapToDomainJoint(node: TransformNode, jointIndex: number, parentIndex: number): SkeletonJoint {
        return {
            jointName: node.name,
            jointIndex,
            parentIndex,
            boneType: parentIndex === -1 ? BoneType.SkeletonRoot : BoneType.SkeletonChild,
            defaultTranslation: AvatarMapper.mapToDomainJointTranslation(node.position),
            defaultRotation: AvatarMapper.mapToDomainJointRotation(node.rotationQuaternion),
            defaultScale: AvatarMapper.mapToDomainScale(node.scaling)
        };
    }

    /**
     * Convert a local `Vector3` joint translation to a Domain-compatible joint translation.
     * @param translation The local joint translation.
     * @returns A Domain-compatible joint translation.
     */
    public static mapToDomainJointTranslation(translation: Vector3): vec3 {
        return { x: translation.x, y: translation.y, z: translation.z };
    }

    /**
     * Convert a local `Quaternion` joint rotation to a Domain-compatible joint rotation.
     * @param rotation The local joint rotation.
     * @returns A Domain-compatible joint rotation.
     */
    public static mapToDomainJointRotation(rotation: Nullable<Quaternion>): quat {
        // Prevent `null` and `w === 0`.
        const q = rotation ? rotation : Quaternion.Identity();
        return { x: q.x, y: q.y, z: q.z, w: q.w === 0 ? 1 : q.w };
    }

    /**
     * Convert a joint translation from the Domain server to a local `Vector3` joint translation.
     * @param translation The Domain joint translation.
     * @returns A local joint translation.
     */
    public static mapToLocalJointTranslation(translation: vec3): Vector3 {
        return new Vector3(translation.x, translation.y, translation.z);
    }

    /**
     * Convert a joint rotation from the Domain server to a local `Quaternion` joint rotation.
     * @param rotation The Domain joint rotation.
     * @returns A local joint rotation.
     */
    public static mapToLocalJointRotation(rotation: quat): Quaternion {
        return new Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);
    }
}
