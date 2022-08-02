//
//  DomainAdaptor.ts
//
//  Created by Nolan Huang on 2 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


/* eslint-disable @typescript-eslint/no-unused-vars */
import { IVector3Property, IQuaternionProperty } from "./Properties";
import { Shape, EntityType,
    IEntityProperties, IShapeEntityProperties, IModelEntityProperties } from "./EntityProperties";
import { EntityProperties, ShapeEntityProperties, ModelEntityProperties } from "@vircadia/web-sdk";
import { DomainEntityType } from "./DomainProperties";

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function updateObjectProperties(dest: any, src: any) : void {
    const proertyNames = Object.getOwnPropertyNames(src);
    proertyNames.forEach((name) => {
        if (src[name]) {
            dest[name] = src[name];
        }
    });
}


export class DomainEntityPropertiesAdaptor implements IEntityProperties {
    _data : EntityProperties;

    constructor(data : EntityProperties) {
        this._data = data;
    }

    public get data() : EntityProperties {
        return this._data;
    }

    public copy(source : EntityProperties) : void {
        Object.assign(this._data, source);
    }

    public update(source : EntityProperties) : void {
        updateObjectProperties(this._data, source);
    }

    public get id() : string {
        return this._data.entityItemID.stringify();
    }

    public get type() : EntityType {
        switch (this._data.entityType) {
            case DomainEntityType.Box as number:
                return EntityType.Box;
            default:
                return EntityType.Unknown;
        }

    }

    public get name(): string | undefined {
        return this._data.name;
    }

    public get parentID(): string | undefined {
        return this._data.parentID ? this._data.parentID.stringify() : undefined;
    }

    public get visible(): boolean | undefined {
        return this._data.visible;
    }

    public get position() : IVector3Property | undefined {
        return this._data.position;
    }

    public get rotation() : IQuaternionProperty | undefined {
        return this._data.rotation;
    }

    public get dimensions() : IVector3Property | undefined {
        return this._data.dimensions;
    }
}

export class DomainShapeEntityPropertiesAdaptor
    extends DomainEntityPropertiesAdaptor
    implements IShapeEntityProperties {
    public get shape(): Shape | undefined {
        const props = this._data as ShapeEntityProperties;
        return props.shape;
    }

}

export class DomainModelEntityPropertiesAdaptor
    extends DomainEntityPropertiesAdaptor
    implements IModelEntityProperties {
    public get modelURL(): string | undefined {
        const props = this._data as ModelEntityProperties;
        return props.modelURL;
    }

    public get shapeType(): string | undefined {
        const props = this._data as ModelEntityProperties;
        return "";
    }

}

export function createDomainEntityAdaptor(data : EntityProperties) : DomainEntityPropertiesAdaptor {
    switch (data.entityType) {
        case DomainEntityType.Box as number:
            return new DomainShapeEntityPropertiesAdaptor(data);
        case DomainEntityType.Model as number:
            return new DomainModelEntityPropertiesAdaptor(data);
        default:
            throw new Error(`Invalid entity type ${data.entityType}`);
    }

}
