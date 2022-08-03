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
    Mesh,
    StandardMaterial
} from "@babylonjs/core";

import { Shape } from "../EntityProperties";
import { IShapeEntity } from "../IEntity";
import { EntityMapper } from "./EntityMapper";

export class ShapeBuilder {
    public static createShape(props: IShapeEntity) : Mesh {
        switch (props.shape) {
            case Shape.CUBE:
                return ShapeBuilder.createBox(props);
            default:
                throw new Error(`Invalid shape type ${props.shape as Shape}`);
        }
    }

    public static createBox(props: IShapeEntity) : Mesh {
        const dimensions = props.dimensions
            ? { width: props.dimensions.x,
                height: props.dimensions.y,
                depth: props.dimensions.z }
            : undefined;

        const box = MeshBuilder.CreateBox(
            "Box",
            dimensions);

        if (props.color) {
            const mat = new StandardMaterial("Box_" + props.id);
            const color = EntityMapper.mapToColor3(props.color);
            mat.diffuseColor = color;
            mat.specularColor = color;
            mat.alpha = props.alpha ?? mat.alpha;
            box.material = mat;
        }

        return box;
    }
}
