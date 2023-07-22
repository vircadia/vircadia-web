//
//  entityEvent.ts
//
//  Created by Nolan Huang on 26 Oct 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { IEntity } from "./EntityInterfaces";

export enum EntityEventType {
    NONE,
    JOIN_CONFERENCE_ROOM
}

export class EntityEvent {
    type: EntityEventType;
    entity: IEntity;
    data: unknown;

    constructor(type: EntityEventType, entity: IEntity, data: unknown = undefined) {
        this.type = type;
        this.entity = entity;
        this.data = data;
    }
}
