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
import { EntityMapper } from "../../package";
import { GameObject, MeshComponent } from "@Modules/object";
import { EntityScriptManager } from "../scripts";
import { Nullable, Observer } from "@babylonjs/core";

export abstract class EntityController extends ScriptComponent {
    // domain properties
    _entity: IEntity;
    _parentObserver: Nullable<Observer<GameObject>> = null;

    constructor(entity: IEntity, name: string) {
        super(name);
        this._entity = entity;
    }

    public onInitialize(): void {
        this._entity.onCommonPropertiesChanged?.add(this._updateCommonProperties.bind(this));
        this._entity.onRenderModeChanged?.add(this._updateRenderModeProperties.bind(this));
        this._entity.onPositionAndRotationChanged?.add(this._updatePositionAndRotation.bind(this));
        this._entity.onScriptChanged?.add(this._updateScript.bind(this));
        this._entity.onParentChanged?.add(this._updateParent.bind(this));
    }

    public onStart(): void {
        this._updateParent();
        this._updateCommonProperties();
        this._updateRenderModeProperties();
        this._updatePositionAndRotation();
        this._updateScript();

    }

    public onStop(): void {
        GameObject.onGameObjectAddedObservable.remove(this._parentObserver);
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

                this._gameObject.components.forEach((comp) => {
                    if (comp instanceof MeshComponent) {
                        comp.visible = this._entity.visible as boolean;
                    }
                });
            }
        }
    }

    protected _updateRenderModeProperties(): void {
        if (this._gameObject) {
            this._gameObject.components.forEach((comp) => {
                if (comp instanceof MeshComponent && comp.mesh) {
                    if (this._entity.billboardMode !== undefined) {
                        comp.mesh.billboardMode = EntityMapper.mapToMeshBillboardMode(this._entity.billboardMode);
                    }
                }
            });
        }
    }

    protected _updateScript(): void {
        if (this._gameObject && this._entity.script && this._entity.script.length > 0
            && !this._gameObject.hasComponent(this._entity.script)) {
            Log.debug(Log.types.ENTITIES, `Load script ${this._entity.script}`);

            const script = EntityScriptManager.createScript(this._entity.script, this._entity);
            if (script) {
                this._gameObject.addComponent(script);
            }
        }
    }

    protected _updateParent(): void {
        if (this._gameObject) {
            // remove entity form previous parent
            const parent = this._gameObject.getParent();
            if (parent && parent.id !== this._entity.parentID) {
                parent.removeChildGameObject(this._gameObject);
                GameObject.onGameObjectAddedObservable.remove(this._parentObserver);
            }

            // set parent if parent GameObject exists
            const newParent = this._entity.parentID
                ? GameObject.getGameObjectByID(this._entity.parentID)
                : undefined;
            if (newParent) {
                newParent.addChildGameObject(this._gameObject);
            }

            // set parent when parent GameObject added
            if (!this._parentObserver && this._entity.parentID) {
                this._parentObserver = GameObject.onGameObjectAddedObservable.add((gameObject) => {
                    if (gameObject.id === this._entity.parentID && this._gameObject) {
                        gameObject.addChildGameObject(this._gameObject);
                    }
                });
            }
        }
    }

    protected _getSubItemName(): string {
        return this._entity.name ? this._entity.name + "_" + this._entity.id : this._entity.id;
    }
}
