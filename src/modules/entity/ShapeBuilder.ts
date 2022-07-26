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
    Color4
} from "@babylonjs/core";

import { IShapeEntityProperties } from "./EntityProperties";

export class ShapeBuilder {
    public static createShape(props: IShapeEntityProperties) : Mesh {
        switch (props.shape) {
            case "Cube":
                return ShapeBuilder.createBox(props);
            default:
                throw new Error(`Invalid shape type ${props.shape}`);
        }
    }

    public static createBox(props: IShapeEntityProperties) : Mesh {
        const colors: Color4[] = [];
        if (props.color) {
            const color = new Color4(
                props.color.red,
                props.color.green,
                props.color.blue,
                props.color.alpha ?? 1);

            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            for (let i = 0; i < 6; i++) {
                colors.push(color);
            }

        }

        const mesh = MeshBuilder.CreateBox(props.name,
            { width: props.dimensions.x,
                height: props.dimensions.y,
                depth: props.dimensions.z,
                faceColors: colors });
        return mesh;
    }
}
