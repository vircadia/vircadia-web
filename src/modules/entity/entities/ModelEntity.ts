//
//  ModelEntity.ts
//
//  Created by Nolan Huang on 3 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { IEntity, IModelEntity } from "../EntityInterfaces";
import { Observable } from "@babylonjs/core";
import { Entity, EntityPropertyChangeObservable } from "./Entity";
import { EntityProperties, ModelEntityProperties } from "@vircadia/web-sdk";

export class ModelEntity extends Entity implements IModelEntity {
    protected _modelURL = "";
    protected _shapeType: string | undefined;
    protected _onModelURLChanged : EntityPropertyChangeObservable<IEntity>;

    constructor(id : string) {
        super(id, "Model");
        this._onModelURLChanged = this.createPropertyChangeObservable();
    }

    public get modelURL(): string | undefined {
        return this._modelURL;
    }

    public set modelURL(value: string | undefined) {
        if (value && value !== this._modelURL) {
            this._modelURL = value;
            this._onModelURLChanged.isDirty = true;
        }
    }

    public get shapeType(): string | undefined {
        return this._shapeType;
    }

    public set shapeType(value: string | undefined) {
        this._shapeType = value;
    }

    public get onModelURLChanged() : Observable<IEntity> {
        return this._onModelURLChanged.observable;
    }

    public copyFormPacketData(props : EntityProperties) : void {
        super.copyFormPacketData(props);

        const modelProps = props as ModelEntityProperties;
        this.modelURL = modelProps.modelURL;
        // this.shapeType = modelProps.shapeType;
    }
}
