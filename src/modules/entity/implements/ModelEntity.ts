//
//  Entity.ts
//
//  Created by Nolan Huang on 3 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { EntityType, IModelEntityProperties } from "../EntityProperties";
import { Observable } from "@babylonjs/core";
import { Entity } from "./Entity";
import { EntityProperties, ModelEntityProperties } from "@vircadia/web-sdk";

export class ModelEntity extends Entity implements IModelEntityProperties {
    protected _modelURL = "";
    protected _shapeType: string | undefined;
    protected _onModelURLChanged : Observable<IModelEntityProperties>;
    _isModelURLChanged = false;

    constructor(id : string) {
        super(id, EntityType.Model);
        this._onModelURLChanged = new Observable<IModelEntityProperties>();
    }

    public get modelURL(): string | undefined {
        return this._modelURL;
    }

    public set modelURL(value: string | undefined) {
        if (value && value !== this._modelURL) {
            this._modelURL = value;
            this._isModelURLChanged = true;
        }
    }

    public get shapeType(): string | undefined {
        return this._shapeType;
    }

    public set shapeType(value: string | undefined) {
        this._shapeType = value;
    }

    public copyFormPacketData(props : EntityProperties) : void {
        super.copyFormPacketData(props);

        const modelProps = props as ModelEntityProperties;
        this.modelURL = modelProps.modelURL;
        // this.shapeType = modelProps.shapeType;
    }

    // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-empty-function
    public update() : void {
        super.update();

        if (this._isModelURLChanged) {
            this._onModelURLChanged.notifyObservers(this);
            this._isModelURLChanged = false;
        }
    }
}
