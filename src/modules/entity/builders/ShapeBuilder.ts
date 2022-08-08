//
//  ShapeEntityBuilder.ts
//
//  Created by Nolan Huang on 26 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable new-cap */
import {
    MeshBuilder,
    AbstractMesh, Mesh,
    StandardMaterial
} from "@babylonjs/core";

/* eslint-disable @typescript-eslint/no-unused-vars */
import { IShapeEntity } from "../Entities";
import { EntityMapper } from "./EntityMapper";
import Log from "@Base/modules/debugging/log";
import { GameObject, MeshComponent } from "@Base/modules/object";

export class ShapeBuilder {
    public static createShape(props: IShapeEntity) : Mesh | undefined {
        switch (props.shape) {
            case "Cube":
                return ShapeBuilder.createBox(props);
            case "Sphere":
                return ShapeBuilder.createSphere(props);
            case "Cylinder":
                return ShapeBuilder.createCylinder(props);
            default:
                return ShapeBuilder.createBox(props);
                // Log.warn(Log.types.ENTITIES, "Shape is undefined");
                // return undefined;
        }
    }

    public static createBox(props: IShapeEntity) : Mesh {
        const dimensions = props.dimensions
            ? { width: props.dimensions.x,
                height: props.dimensions.y,
                depth: props.dimensions.z }
            : undefined;

        const mesh = MeshBuilder.CreateBox("BoxMesh", dimensions);
        this.buildColor(mesh, props);
        return mesh;
    }

    public static createSphere(props: IShapeEntity) : Mesh {
        const options = props.dimensions
            ? { diameterX: props.dimensions.x,
                diameterY: props.dimensions.y,
                diameterZ: props.dimensions.z }
            : undefined;

        const mesh = MeshBuilder.CreateSphere("SphereMesh", options);
        this.buildColor(mesh, props);
        return mesh;
    }

    public static createCylinder(props: IShapeEntity) : Mesh {
        const options = { diameter: 1, height: 1 };
        const mesh = MeshBuilder.CreateCylinder("CylinderMesh", options);
        if (props.dimensions) {
            mesh.scaling = EntityMapper.mapToVector3(props.dimensions);
        }

        this.buildColor(mesh, props);
        return mesh;
    }

    public static buildMesh(gameObject: GameObject, props: IShapeEntity) : void {
        if (props.shape) {
            const mesh = ShapeBuilder.createShape(props);
            if (!mesh) {
                return;
            }

            ShapeBuilder.buildColor(mesh, props);

            const comp = gameObject.getComponent("Mesh") as MeshComponent;
            if (comp) {
                comp.mesh.dispose(true, true);
                comp.mesh = mesh;
            } else {
                gameObject.addComponent(new MeshComponent(mesh));
            }
        }
    }

    public static buildColor(mesh: AbstractMesh, props: IShapeEntity) : void {
        if (!props.color) {
            return;
        }

        if (!mesh.material) {
            mesh.material = new StandardMaterial(mesh.name + "_" + props.id);
        }

        const mat = mesh.material as StandardMaterial;
        const color = EntityMapper.mapToColor3(props.color);
        mat.diffuseColor = color;
        mat.specularColor = color;
        mat.alpha = props.alpha ?? mat.alpha;
    }
}
