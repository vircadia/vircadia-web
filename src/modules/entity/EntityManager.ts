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

import { IEntityProperties, EntityType } from "./EntityProperties";
import { Observable } from "@babylonjs/core";
import { EntityProperties } from "@vircadia/web-sdk";
import { DomainEntityType } from "./DomainProperties";
import { Entity, ShapeEntity, ModelEntity } from "./implements";

export class EntityManager {
    _entities : Map<string, Entity>;
    _onEntityAdded : Observable<IEntityProperties>;
    _onEntityRemoved : Observable<IEntityProperties>;

    constructor() {
        this._entities = new Map<string, Entity>();
        this._onEntityAdded = new Observable<IEntityProperties>();
        this._onEntityRemoved = new Observable<IEntityProperties>();
    }

    public hasEntity(id : string) : boolean {
        return this._entities.has(id);
    }

    public getEntity(id : string) : IEntityProperties | undefined {
        return this._entities.get(id);
    }

    public removeEntity(id : string) : boolean {
        const entity = this._entities.get(id);
        if (entity) {
            // eslint-disable-next-line @typescript-eslint/dot-notation
            this._entities.delete(id);
            this._onEntityRemoved.notifyObservers(entity);
            return true;
        }
        return false;
    }

    public clear() : void {
        this.clear();
    }

    public createEntity(props : EntityProperties) : IEntityProperties {
        let entity = undefined;
        switch (props.entityType) {
            case DomainEntityType.Box as number:
                entity = new ShapeEntity(props.entityItemID.stringify(), EntityType.Box);
                break;
            case DomainEntityType.Model as number:
                entity = new ModelEntity(props.entityItemID.stringify());
                break;
            default:
                throw new Error(`Invalid entity type ${props.entityType}`);
        }

        entity.copyFormPacketData(props);

        this._addEntity(entity);

        return entity;
    }

    public updateEntity(props : EntityProperties) : void {
        const entity = this._entities.get(props.entityItemID.stringify());
        if (entity) {
            entity.copyFormPacketData(props);
        }
    }

    public update() : void {
        this._entities.forEach((entity) => {
            entity.update();
        });
    }

    private _addEntity(entity : Entity) : void {
        if (this._entities.get(entity.id)) {
            throw new Error(`Entity ${entity.id} already exists.`);
        }
        this._entities.set(entity.id, entity);
        this._onEntityAdded.notifyObservers(entity);
    }

}
