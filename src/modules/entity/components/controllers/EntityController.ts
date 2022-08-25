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

// General Modules
import Log from "@Modules/debugging/log";
// Domain Modules
import { ScriptComponent } from "@Modules/script";
import { IEntity } from "../../EntityInterfaces";
import { EntityMapper } from "../../builders";
import { GameObject, MeshComponent } from "@Modules/object";
import { NFTSpinController } from "../scripts";


export class EntityController extends ScriptComponent {
    // domain properties
    _entity : IEntity;

    constructor(entity : IEntity, name: string) {
        super(name);
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
        this._entity.onCommonPropertiesChanged?.add(this._updateCommonProperties.bind(this));
        this._entity.onPositionAndRotationChanged?.add(this._updatePositionAndRotation.bind(this));
    }

    public onStart(): void {
        this._updateCommonProperties();
        this._updatePositionAndRotation();
        this._updateScript();
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function, class-methods-use-this
    public onUpdate():void {

    }

    protected _updatePositionAndRotation(): void {
        if (this._gameObject) {
            this._gameObject.position = EntityMapper.mapToVector3(this._entity.position);
            this._gameObject.rotationQuaternion = EntityMapper.mapToQuaternion(this._entity.rotation);
        }
    }

    protected _updateCommonProperties(): void {
        if (this._gameObject) {
            this._gameObject.id = this._entity.id;

            if (this._entity.name) {
                this._gameObject.name = this._entity.name;
            }

            if (this._entity.visible !== undefined) {
                this._gameObject.isVisible = this._entity.visible;

                const comp = this._gameObject.getComponent(MeshComponent.typeName);
                if (comp && comp instanceof MeshComponent) {
                    comp.visible = this._entity.visible;
                }
            }

            if (this._entity.parentID && this._entity.parentID !== this._gameObject.parent?.id) {
                const parent = GameObject.getGameObjectByID(this._entity.parentID);
                if (parent) {
                    this._gameObject.parent = parent;
                }
            }
        }
    }

    protected _updateScript(): void {
        if (this._gameObject && this._entity.script && this._entity.script.length > 0) {
            Log.debug(Log.types.ENTITIES, `Load script ${this._entity.script}`);

            if (this._entity.script === NFTSpinController.typeName) {
                const comp = new NFTSpinController();
                this._gameObject.addComponent(comp);
            }
        }
    }
}
