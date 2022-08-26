//
//  EntityBuilder.ts
//
//  Created by Nolan Huang on 26 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import {
    Scene
} from "@babylonjs/core";

import { GameObject } from "@Modules/object";
import { IEntity } from "./EntityInterfaces";
import { EntityType } from "./EntityProperties";
import { AbstractEntityBuilder, ShapeEntityBuilder, LightEntityBuilder, ZoneEntityBuilder, ModelEntityBuilder,
    ImageEntityBuilder, EntityMapper } from "./builders";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Log from "@Modules/debugging/log";

export interface IEntityBuildResult {
    gameObject: Nullable<GameObject>;
}

export interface IEntityMetaData {
    parentID?: string;
}


export class EntityBuilder {
    _gameObject: Nullable<GameObject>;
    _scene : Nullable<Scene>;
    _entity: Nullable<IEntity>;
    _builders : Map<EntityType, AbstractEntityBuilder>;

    constructor() {
        this._builders = new Map<EntityType, AbstractEntityBuilder>();
        this._builders.set("Box", new ShapeEntityBuilder());
        this._builders.set("Sphere", new ShapeEntityBuilder());
        this._builders.set("Shape", new ShapeEntityBuilder());
        this._builders.set("Light", new LightEntityBuilder());
        this._builders.set("Model", new ModelEntityBuilder());
        this._builders.set("Zone", new ZoneEntityBuilder());
        this._builders.set("Image", new ImageEntityBuilder());

    }

    public buildEntity(entity: IEntity, scene: Nullable<Scene>, gameObj ?: GameObject) : GameObject {
        const gameObject = gameObj ?? new GameObject(EntityMapper.getEntityName(entity), scene);
        gameObject.id = entity.id;

        const builder = this._builders.get(entity.type);
        if (builder) {
            builder.build(gameObject, entity);
        }

        return gameObject;
    }

}
