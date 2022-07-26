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

/* eslint-disable new-cap */
import {
    Scene,
    MeshBuilder,
    Vector3,
    Quaternion,
    Mesh,
    Color4
} from "@babylonjs/core";

import { GameObject, MeshComponent } from "@Modules/object";
import { IEntityProperties, IShapeEntityProperties } from "./EntityProperties";
import { ShapeBuilder } from "./ShapeBuilder";
import Log from "@Modules/debugging/log";

export class EntityBuilder {
    _gameObject: Nullable<GameObject>;
    _scene : Nullable<Scene>;
    _props: Nullable<IEntityProperties>;

    public createEntity(props: IEntityProperties, scene: Nullable<Scene>) : Nullable<GameObject> {
        switch (props.type) {
            case "Box":
                return this.createBoxEntity(props as IShapeEntityProperties, scene);
            default:
                return undefined;
        }
    }

    public createBoxEntity(props: IShapeEntityProperties, scene: Nullable<Scene>) : Nullable<GameObject> {
        Log.debug(Log.types.ENTITIES,
            `Create Box Entity ${props.name}`);

        return this._beginBuildEntity(props, scene)
            ._buildShape()
            ._endBuildEntity();
    }

    private _beginBuildEntity(props: IEntityProperties, scene: Nullable<Scene>) : EntityBuilder {
        this._props = props;
        this._scene = scene;
        this._gameObject = new GameObject(props.name, scene);

        this._gameObject.id = props.id;

        this._gameObject.position = new Vector3(props.position.x, props.position.y, props.position.z);
        this._gameObject.rotationQuaternion
            = new Quaternion(props.rotation.x, props.rotation.y, props.rotation.z, props.rotation.w);
        return this;
    }

    private _endBuildEntity() : Nullable<GameObject> {
        const gameObject = this._gameObject;
        this._gameObject = null;
        this._props = null;
        this._scene = null;

        return gameObject;
    }

    private _buildShape() : EntityBuilder {
        if (!this._props || !this._gameObject) {
            throw new Error(`null props or gameObject. 
            please call _beginBuildEntity before call this function.`);
        }

        const mesh = ShapeBuilder.createShape(this._props as IShapeEntityProperties);
        const meshComponent = new MeshComponent(mesh);
        this._gameObject.addComponent(meshComponent);

        return this;
    }
}
