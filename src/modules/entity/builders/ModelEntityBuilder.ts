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
    AbstractMesh,
    SceneLoader
} from "@babylonjs/core";

/* eslint-disable @typescript-eslint/no-unused-vars */
import { IEntity, IModelEntity } from "../Entities";
import { CollisionMask } from "../EntityProperties";
import { AbstractEntityBuilder } from "./AbstractEntityBuilder";

import Log from "@Base/modules/debugging/log";
import { GameObject, MeshComponent } from "@Base/modules/object";
import { ModelEntityController } from "../components";

export class ModelEntityBuilder extends AbstractEntityBuilder {

    // eslint-disable-next-line class-methods-use-this
    public build(gameObject: GameObject, entity: IEntity) : void {
        const modelEntity = entity as IModelEntity;

        ModelEntityBuilder.buildModel(gameObject, modelEntity);

        if (!gameObject.getComponent("ModelEntityController")) {
            gameObject.addComponent(new ModelEntityController(modelEntity));
        }
    }

    public static buildModel(gameObject: GameObject, entity: IModelEntity) : void {
        gameObject.removeComponent(MeshComponent.typeName);

        if (!entity.modelURL || entity.modelURL === "") {
            return;
        }

        Log.debug(Log.types.ENTITIES,
            `Load model: ${entity.modelURL}`);

        SceneLoader.ImportMesh("",
            entity.modelURL, undefined, gameObject.getScene(), (meshes) => {

                const comp = new MeshComponent(meshes[0]);
                if (entity.visible !== undefined) {
                    comp.visible = entity.visible;
                }
                gameObject.addComponent(comp);

                ModelEntityBuilder.buildCollision(meshes, entity);
            });
    }

    public static buildCollision(meshes: AbstractMesh[], entity: IModelEntity):void {
        meshes.forEach((mesh) => {
            mesh.isPickable = false;
            mesh.checkCollisions = false;

            if (entity.collisionMask
                && entity.collisionMask & CollisionMask.MyAvatar) {

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
    }
}
