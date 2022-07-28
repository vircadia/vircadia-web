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
import { IEntityProperties, IShapeEntityProperties, ILightEntityProperties,
    IModelEntityProperties, IZoneEntityProperties } from "./EntityProperties";
import { ShapeBuilder } from "./ShapeBuilder";
import { LightBuilder } from "./LightBuilder";
import { EntityMapper } from "./EntityMapper";
import { EnvironmentBuilder } from "./EnvironmentBuilder";
import Log from "@Modules/debugging/log";

export interface IEntityBuildResult {
    gameObject: Nullable<GameObject>;
}

export class EntityBuilder {
    _gameObject: Nullable<GameObject>;
    _scene : Nullable<Scene>;
    _props: Nullable<IEntityProperties>;

    public createEntity(props: IEntityProperties, scene: Nullable<Scene>) : IEntityBuildResult {
        console.debug("ENTITIES props", props);
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

    public createBoxEntity(props: IEntityProperties, scene: Nullable<Scene>) : IEntityBuildResult {
        Log.debug(Log.types.ENTITIES,
            `Create Box Entity ${EntityMapper.getEntityName(props)}`);

        return this.beginBuildEntity(props, scene)
            .buildShape()
            .endBuildEntity();
    }

    public createLightEntity(props: IEntityProperties, scene: Nullable<Scene>) : IEntityBuildResult {
        Log.debug(Log.types.ENTITIES,
            `Create Light Entity ${EntityMapper.getEntityName(props)}`);

        return this.beginBuildEntity(props, scene)
            .buildLight()
            .endBuildEntity();
    }

    public createModelEntity(props: IEntityProperties, scene: Nullable<Scene>) : IEntityBuildResult {
        Log.debug(Log.types.ENTITIES,
            `Create Model Entity ${EntityMapper.getEntityName(props)}`);

        return this.beginBuildEntity(props, scene)
            .buildModel()
            .endBuildEntity();
    }

    public createZoneEntity(props: IEntityProperties, scene: Nullable<Scene>) : IEntityBuildResult {
        Log.debug(Log.types.ENTITIES,
            `Create Zone Entity ${EntityMapper.getEntityName(props)}`);
        return this.beginBuildEntity(props, scene)
            .buildEnviroment()
            .endBuildEntity();
    }

    public beginBuildEntity(props: IEntityProperties, scene: Nullable<Scene>) : EntityBuilder {
        this._props = props;
        this._scene = scene;
        this._gameObject = new GameObject(EntityMapper.getEntityName(props), scene);

        this._gameObject.id = props.id;

        this._gameObject.position = EntityMapper.mapToVector3(props.position);
        this._gameObject.rotationQuaternion = EntityMapper.mapToQuaternion(props.rotation);
        return this;
    }

    private endBuildEntity() : IEntityBuildResult {
        const result = {
            gameObject: this._gameObject
        };

        this._gameObject = null;
        this._props = null;
        this._scene = null;

        return result;
    }

    public buildShape() : EntityBuilder {
        if (!this._props || !this._gameObject) {
            throw new Error(`null props or gameObject. 
            please call _beginBuildEntity before call this function.`);
        }

        const mesh = ShapeBuilder.createShape(this._props as IShapeEntityProperties);
        const meshComponent = new MeshComponent(mesh);
        this._gameObject.addComponent(meshComponent);

        return this;
    }

    public buildModel() : EntityBuilder {
        if (!this._props || !this._gameObject) {
            throw new Error(`null props or gameObject. 
            please call _beginBuildEntity before call this function.`);
        }

        const props = this._props as IModelEntityProperties;

        const gameObject = this._gameObject;
        SceneLoader.ImportMesh("",
            props.modelURL, undefined, this._scene, (meshes) => {
                const mesh = meshes[0];
                const meshComponent = new MeshComponent(mesh);
                gameObject?.addComponent(meshComponent);
            });
        return this;
    }

    public buildLight() : EntityBuilder {
        if (!this._props || !this._gameObject || !this._scene) {
            throw new Error(`null props or gameObject. 
            please call _beginBuildEntity before call this function.`);
        }

        const light = LightBuilder.createPointLight(this._props as ILightEntityProperties,
            this._scene);
        const comp = new LightComponent(light);
        this._gameObject.addComponent(comp);

        return this;
    }

    public buildEnviroment() : EntityBuilder {
        if (!this._props || !this._gameObject || !this._scene) {
            throw new Error(`null props or gameObject. 
            please call _beginBuildEntity before call this function.`);
        }

        const props = this._props as IZoneEntityProperties;

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
