//
//  EntityManager.ts
//
//  Created by Nolan Huang on 3 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { IEntity } from "./EntityInterfaces";
import { Observable } from "@babylonjs/core";
import { EntityServer, EntityProperties } from "@vircadia/web-sdk";
import { EntityType as PackageEntityType } from "./package/DomainProperties";
import { Entity, ShapeEntity, ModelEntity, LightEntity, ZoneEntity, ImageEntity, MaterialEntity, WebEntity } from "./entities";
import Log from "@Modules/debugging/log";

type EntityFactory = (id:string) => Entity;

export class EntityManager {
    _entityServer: EntityServer;
    _entities: Map<string, Entity>;
    _onEntityAdded: Observable<IEntity>;
    _onEntityRemoved: Observable<IEntity>;
    _entityPropertiesArray = new Array<EntityProperties>();
    _entityFactories = new Map<PackageEntityType, EntityFactory>();

    constructor(entityServer: EntityServer) {
        this._entityServer = entityServer;
        this._entityServer.entityData.connect(this._handleOnEntityData.bind(this));

        this._entities = new Map<string, Entity>();
        this._onEntityAdded = new Observable<IEntity>();
        this._onEntityRemoved = new Observable<IEntity>();

        // register EntityFactories
        this._entityFactories.set(PackageEntityType.Box, (id) => new ShapeEntity(id, "Box"));
        this._entityFactories.set(PackageEntityType.Sphere, (id) => new ShapeEntity(id, "Sphere"));
        this._entityFactories.set(PackageEntityType.Shape, (id) => new ShapeEntity(id, "Shape"));

        this._entityFactories.set(PackageEntityType.Model, (id) => new ModelEntity(id));
        this._entityFactories.set(PackageEntityType.Light, (id) => new LightEntity(id));
        this._entityFactories.set(PackageEntityType.Zone, (id) => new ZoneEntity(id));
        this._entityFactories.set(PackageEntityType.Image, (id) => new ImageEntity(id));
        this._entityFactories.set(PackageEntityType.Material, (id) => new MaterialEntity(id));
        this._entityFactories.set(PackageEntityType.Web, (id) => new WebEntity(id));
    }

    public get onEntityAdded(): Observable<IEntity> {
        return this._onEntityAdded;
    }

    public get onEntityRemoved(): Observable<IEntity> {
        return this._onEntityRemoved;
    }

    public hasEntity(id: string): boolean {
        return this._entities.has(id);
    }

    public getEntity(id: string): IEntity | undefined {
        return this._entities.get(id);
    }

    public removeEntity(id: string): boolean {
        const entity = this._entities.get(id);
        if (entity) {
            this._entities.delete(id);
            this._onEntityRemoved.notifyObservers(entity);
            return true;
        }
        return false;
    }

    public clear(): void {
        this.clear();
    }

    public createEntity(props: EntityProperties): IEntity | undefined {
        const factory = this._entityFactories.get(props.entityType);
        if (!factory) {
            Log.warn(Log.types.ENTITIES, `Unknown entity type: ${props.entityType}`);
            return undefined;
        }
        const entity = factory(props.entityItemID.stringify());
        entity.copyFormPacketData(props);
        // prevent to emit change event
        entity.update();

        this._addEntity(entity);

        return entity;
    }

    public updateEntity(props: EntityProperties): void {
        const entity = this._entities.get(props.entityItemID.stringify());
        if (entity) {
            entity.copyFormPacketData(props);
        }
    }

    public update(): void {
        // NOTE:
        // update exist entities to prevent the add and change event notified in the same frame
        this._entities.forEach((entity) => {
            entity.update();
        });

        if (this._entityPropertiesArray.length > 0) {
            this._entityPropertiesArray.forEach((props) => {
                const entity = this._entities.get(props.entityItemID.stringify());
                if (entity) {
                    entity.copyFormPacketData(props);
                } else {
                    this.createEntity(props);
                }
            });
            this._entityPropertiesArray = [];
        }
    }

    private _handleOnEntityData(data: EntityProperties[]): void {
        if (data.length > 0) {
            console.log(Log.types.ENTITIES,
                `Receive entity data:`, data);

            this._entityPropertiesArray = this._entityPropertiesArray.concat(data);
        }
    }

    private _addEntity(entity: Entity): void {
        if (this._entities.get(entity.id)) {
            throw new Error(`Entity ${entity.id} already exists.`);
        }

        this._entities.set(entity.id, entity);
        this._onEntityAdded.notifyObservers(entity);
    }
}
