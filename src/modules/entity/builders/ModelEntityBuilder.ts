//
//  ModelEntityBuilder.ts
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
    SceneLoader
} from "@babylonjs/core";

/* eslint-disable @typescript-eslint/no-unused-vars */
import { IEntity, IModelEntity } from "../Entities";
import { AbstractEntityBuilder } from "./AbstractEntityBuilder";

import Log from "@Base/modules/debugging/log";
import { GameObject, MeshComponent } from "@Base/modules/object";

export class ModelEntityBuilder extends AbstractEntityBuilder {

    // eslint-disable-next-line class-methods-use-this
    public build(gameObject: GameObject, entity: IEntity) : void {
        const props = entity as IModelEntity;
        if (!props.modelURL) {
            Log.debug(Log.types.ENTITIES,
                `Load model: model url of Model Entity is undefined.`);
            return;
        }

        Log.debug(Log.types.ENTITIES,
            `Load model: ${props.modelURL}`);

        SceneLoader.ImportMesh("",
            props.modelURL, undefined, gameObject.getScene(), (meshes) => {

                gameObject.addComponent(new MeshComponent(meshes[0]));

                meshes.forEach((mesh) => {
                    if (props.visible !== undefined) {
                        mesh.isVisible = props.visible;
                    }

                    if (props.collidesWith && (
                        props.collidesWith.includes("myAvatar") || props.collidesWith.includes("otherAvatar"))) {
                        // TODO:
                        // fix collide rule
                        if (mesh.name.includes("Collision")) {
                            if (mesh.name.includes("Floor")) {
                                mesh.isPickable = true;
                            } else {
                                mesh.checkCollisions = true;
                            }
                        } else {
                            mesh.checkCollisions = true;
                        }
                    }
                });
            });
    }
}
