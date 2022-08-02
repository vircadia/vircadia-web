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
import { EntityMapper } from "./EntityMapper";
import { Shape } from "@vircadia/web-sdk";

export class ShapeBuilder {
    public static createShape(props: IShapeEntityProperties) : Mesh {
        switch (props.shape) {
            case "Cube":
                return ShapeBuilder.createBox(props);
            default:
                throw new Error(`Invalid shape type ${props.shape as Shape}`);
        }
    }

    public static createBox(props: IShapeEntityProperties) : Mesh {
        const colors: Color4[] = [];
        if (props.color) {
            const color = new Color4(
                props.color.red,
                props.color.green,
                props.color.blue,
                props.alpha);
                // props.color.alpha ?? 1);

            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            for (let i = 0; i < 6; i++) {
                colors.push(color);
            }

        }

        if (props.dimensions) {
            return MeshBuilder.CreateBox(
                "Box",
                { width: props.dimensions.x,
                    height: props.dimensions.y,
                    depth: props.dimensions.z,
                    faceColors: colors });
        }

        return MeshBuilder.CreateBox(
            EntityMapper.getEntityName(props),
            { faceColors: colors });
    }
}
