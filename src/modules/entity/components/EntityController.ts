/* eslint-disable @typescript-eslint/no-unused-vars */
//
//  EntityController.ts
//
//  Created by Nolan Huang on 4 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import {
    Node,
    Nullable,
    TransformNode
} from "@babylonjs/core";
// General Modules
import Log from "@Modules/debugging/log";
// Domain Modules
import { ScriptComponent, inspectorAccessor } from "@Modules/script";
import { IEntity } from "../Entities";
import { EntityMapper } from "../builders";

export class EntityController extends ScriptComponent {
    // domain properties
    _entity : IEntity;

    constructor(entity : IEntity) {
        super("EntityController");
        this._entity = entity;
    }

    /**
    * Gets a string identifying the type of this Component
    * @returns "EntityController" string
    */
    // eslint-disable-next-line class-methods-use-this
    public get componentType():string {
        return "EntityController";
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function, class-methods-use-this
    public onInitialize(): void {
        this._entity.onPositionAndRotationChanged?.add(this._handlePositionAndRotationChanged.bind(this));
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function, class-methods-use-this
    public onUpdate():void {

    }

    private _handlePositionAndRotationChanged(): void {
        if (this._gameObject) {
            this._gameObject.position = EntityMapper.mapToVector3(this._entity.position);
            this._gameObject.rotationQuaternion = EntityMapper.mapToQuaternion(this._entity.rotation);
        }
    }

}
