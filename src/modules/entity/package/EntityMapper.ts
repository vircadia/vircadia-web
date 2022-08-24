//
//  EntityMapper.ts
//
//  Created by Nolan Huang on 16 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import {
    Color3,
    Quaternion,
    Vector3
} from "@babylonjs/core";

import { IVector3Property, IQuaternionProperty, IColorProperty,
    ShapeType, IAmbientLightProperty, IHazeProperty, IBloomProperty,
    ComponentMode } from "../EntityProperties";
import { IEntity } from "../EntityInterfaces";

import { ShapeType as PackageShapeType,
    ComponentMode as PackageComponentMode } from "./DomainProperties";
import { HazeProperties, BloomProperties, AmbientLightProperties } from "@vircadia/web-sdk";


/* eslint-disable new-cap */
export class EntityMapper {

    // NOTE:
    // Vercadia is right hand side coordinate system
    // babylon.js is left hand side
    public static mapToVector3(vec? : IVector3Property) : Vector3 {
        return vec ? new Vector3(-vec.x, vec.y, vec.z) : Vector3.Zero();
    }

    public static mapToQuaternion(q? : IQuaternionProperty) : Quaternion {
        return q ? new Quaternion(q.x, -q.y, -q.z, q.w) : Quaternion.Identity();
    }

    public static mapToColor3(c?: IColorProperty) : Color3 {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        return c ? new Color3(c.red / 255, c.green / 255, c.blue / 255) : Color3.White();
    }

    public static getEntityName(props: IEntity) : string {
        return props.name ?? props.type + "_" + props.id;
    }

    public static toRadians(degree:number) : number {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        return degree * Math.PI / 180;
    }

    public static toDegree(radians:number) : number {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        return radians * 180 / Math.PI;
    }

    public static mapToHazeProperty(props: HazeProperties | undefined) : IHazeProperty | undefined {
        return props
            ? {
                hazeRange: props.range,
                hazeColor: props.color,
                hazeEnableGlare: props.enableGlare,
                hazeGlareColor: props.color,
                hazeGlareAngle: props.glareAngle,
                hazeAltitudeEffect: props.altitudeEffect,
                hazeBaseRef: props.base,
                hazeCeiling: props.ceiling,
                hazeBackgroundBlend: props.backgroundBlend,
                hazeAttenuateKeyLight: props.attenuateKeyLight,
                hazeKeyLightRange: props.keyLightRange,
                hazeKeyLightAltitude: props.keyLightAltitude
            }
            : undefined;
    }

    public static mapToBloomProperty(props: BloomProperties | undefined) : IBloomProperty | undefined {
        return props
            ? {
                bloomIntensity: props.intensity,
                bloomThreshold: props.threshold,
                bloomSize: props.size
            }
            : undefined;
    }

    public static mapToAmbientLightProperty(props: AmbientLightProperties | undefined) : IAmbientLightProperty | undefined {
        return props
            ? {
                ambientIntensity: props.intensity,
                ambientURL: props.url
            }
            : undefined;
    }

    public static mapToComponentMode(mode : number | undefined) : ComponentMode | undefined {
        if (mode) {
            switch (mode) {
                case PackageComponentMode.INHERIT:
                    return "inherit";
                case PackageComponentMode.ENABLED:
                    return "enabled";
                default:
                    return "disabled";
            }
        }
        return undefined;
    }


    public static mapToShapeType(shape: number | undefined) : ShapeType {
        switch (shape) {
            case PackageShapeType.BOX:
                return "box";
            case PackageShapeType.CAPSULE_X:
                return "capsule-x";
            case PackageShapeType.CAPSULE_Y:
                return "capsule-y";
            case PackageShapeType.CAPSULE_Z:
                return "capsule-z";
            case PackageShapeType.CIRCLE:
                return "circle";
            case PackageShapeType.COMPOUND:
                return "compound";
            case PackageShapeType.CYLINDER_X:
                return "cylinder-x";
            case PackageShapeType.CYLINDER_Y:
                return "cylinder-y";
            case PackageShapeType.CYLINDER_Z:
                return "cylinder-z";
            case PackageShapeType.ELLIPSOID:
                return "ellipsoid";
            case PackageShapeType.HULL:
                return "hull";
            case PackageShapeType.MULTISPHERE:
                return "multisphere";
            case PackageShapeType.PLANE:
                return "plane";
            case PackageShapeType.SIMPLE_COMPOUND:
                return "simple-compound";
            case PackageShapeType.SIMPLE_HULL:
                return "simple-hull";
            case PackageShapeType.SPHERE:
                return "sphere";
            case PackageShapeType.STATIC_MESH:
                return "static-mesh";
            default:
                return "none";
        }
    }
}
