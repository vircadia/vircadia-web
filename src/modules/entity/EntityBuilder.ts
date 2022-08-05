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
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    Scene, SceneLoader, Vector3
} from "@babylonjs/core";

import { GameObject, MeshComponent, LightComponent } from "@Modules/object";
import { IEntity, IShapeEntity, ILightEntity,
    IModelEntity, IZoneEntity } from "./Entities";
import { ShapeBuilder, LightBuilder, EntityMapper, EnvironmentBuilder } from "./builders";
import { EntityController } from "./components";
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

    public createEntity(props: IEntity, scene: Nullable<Scene>) : IEntityBuildResult {
        switch (props.type) {
            case "Box":
                return this.createBoxEntity(props, scene);
            case "Light":
                return this.createLightEntity(props, scene);
            case "Model":
                return this.createModelEntity(props, scene);
            case "Zone":
                return this.createZoneEntity(props, scene);
            default:
                Log.error(Log.types.ENTITIES, `Indvalid entity type: ${props.type}`);
                return { gameObject: undefined };
        }
    }

    public createBoxEntity(props: IEntity, scene: Nullable<Scene>) : IEntityBuildResult {
        Log.debug(Log.types.ENTITIES,
            `Create Box Entity ${EntityMapper.getEntityName(props)}`);

        return this.beginBuildEntity(props, scene)
            .buildEntityCommon()
            .buildShape()
            .endBuildEntity();
    }

    public createLightEntity(props: IEntity, scene: Nullable<Scene>) : IEntityBuildResult {
        Log.debug(Log.types.ENTITIES,
            `Create Light Entity ${EntityMapper.getEntityName(props)}`);

        return this.beginBuildEntity(props, scene)
            .buildEntityCommon()
            .buildLight()
            .endBuildEntity();
    }

    public createModelEntity(props: IEntity, scene: Nullable<Scene>) : IEntityBuildResult {
        Log.debug(Log.types.ENTITIES,
            `Create Model Entity ${EntityMapper.getEntityName(props)}`);

        return this.beginBuildEntity(props, scene)
            .buildEntityCommon()
            .buildModel()
            .endBuildEntity();
    }

    public createZoneEntity(props: IEntity, scene: Nullable<Scene>) : IEntityBuildResult {
        Log.debug(Log.types.ENTITIES,
            `Create Zone Entity ${EntityMapper.getEntityName(props)}`);

        return this.beginBuildEntity(props, scene)
            .buildEntityCommon()
            .buildEnviroment()
            .endBuildEntity();
    }

    public beginBuildEntity(entity: IEntity, scene: Nullable<Scene>, gameObj = undefined) : EntityBuilder {
        this._entity = entity;
        this._scene = scene;
        this._gameObject = gameObj ?? new GameObject(EntityMapper.getEntityName(entity), scene);

        return this;
    }

    private endBuildEntity() : IEntityBuildResult {
        const result = {
            gameObject: this._gameObject
        };

        this._gameObject = null;
        this._entity = null;
        this._scene = null;

        return result;
    }

    public buildEntityCommon() : EntityBuilder {
        if (!this._entity || !this._gameObject) {
            throw new Error(`null props or gameObject. 
            please call _beginBuildEntity before call this function.`);
        }

        this._gameObject.id = this._entity.id;
        this._gameObject.position = EntityMapper.mapToVector3(this._entity.position);
        this._gameObject.rotationQuaternion = EntityMapper.mapToQuaternion(this._entity.rotation);

        if (this._entity.visible !== undefined) {
            this._gameObject.isVisible = this._entity.visible;
        }

        if (this._entity.parentID) {
            this._gameObject.metadata = {
                parentID: this._entity.parentID
            };
        }

        if (!this._gameObject.getComponent("EntityController")) {
            this._gameObject.addComponent(new EntityController(this._entity));
        }

        return this;
    }

    public buildShape() : EntityBuilder {
        if (!this._entity || !this._gameObject) {
            throw new Error(`null props or gameObject. 
            please call _beginBuildEntity before call this function.`);
        }

        const mesh = ShapeBuilder.createShape(this._entity as IShapeEntity);
        const meshComponent = new MeshComponent(mesh);
        this._gameObject.addComponent(meshComponent);

        return this;
    }

    public buildModel() : EntityBuilder {
        if (!this._entity || !this._gameObject) {
            throw new Error(`null props or gameObject. 
            please call _beginBuildEntity before call this function.`);
        }

        const props = this._entity as IModelEntity;
        if (!props.modelURL) {
            throw new Error(`undefined model url of Model Entity.`);
        }

        Log.debug(Log.types.ENTITIES,
            `Load model: ${props.modelURL}`);

        const gameObject = this._gameObject;
        SceneLoader.ImportMesh("",
            props.modelURL, undefined, this._scene, (meshes) => {

                gameObject?.addComponent(new MeshComponent(meshes[0]));

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
        return this;
    }

    public buildLight() : EntityBuilder {
        if (!this._entity || !this._gameObject || !this._scene) {
            throw new Error(`null props or gameObject. 
            please call _beginBuildEntity before call this function.`);
        }

        const light = LightBuilder.createPointLight(this._entity as ILightEntity,
            this._scene);
        const comp = new LightComponent(light);
        this._gameObject.addComponent(comp);

        return this;
    }

    public buildEnviroment() : EntityBuilder {
        if (!this._entity || !this._gameObject || !this._scene) {
            throw new Error(`null props or gameObject. 
            please call _beginBuildEntity before call this function.`);
        }

        const props = this._entity as IZoneEntity;

        if (props.keyLight) {
            const light = LightBuilder.createKeyLight(props.keyLight, this._scene);
            const comp = new LightComponent(light);
            this._gameObject.addComponent(comp);
        }

        if (props.ambientLight) {
            const light = EnvironmentBuilder.createAmbientLight(props.ambientLight, this._scene);
            const comp = new LightComponent(light);
            this._gameObject.addComponent(comp);
        }

        if (props.skybox) {
            const skyBox = EnvironmentBuilder.createSkybox(props.skybox, this._scene);
            const comp = new MeshComponent(skyBox);
            this._gameObject.addComponent(comp);
        }

        if (props.haze) {
            EnvironmentBuilder.createHaze(props.haze, this._scene);
        }

        return this;
    }
}
