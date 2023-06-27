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
import { IAnimationProperties } from "../EntityProperties";
import { EntityMapper } from "../package";
import { EntityProperties, ModelEntityProperties } from "@vircadia/web-sdk";

class AnimationProperties implements IAnimationProperties {
    private _running = true;
    private _loop = true;
    private _onPropertyChanged: EntityPropertyChangeObservable<IEntity>;

    constructor(onPropertyChanged: EntityPropertyChangeObservable<IEntity>) {
        this._onPropertyChanged = onPropertyChanged;
    }

    public get running(): boolean | undefined {
        return this._running;
    }

    public set running(value: boolean | undefined) {
        if (value !== undefined && value !== this._running) {
            this._running = value;
            this._onPropertyChanged.isDirty = true;
        }
    }

    public get loop(): boolean {
        return this._loop;
    }

    public set loop(value: boolean | undefined) {
        if (value !== undefined && value !== this._loop) {
            this._loop = value;
            this._onPropertyChanged.isDirty = true;
        }
    }

}

export class ModelEntity extends Entity implements IModelEntity {
    protected _modelURL = "";
    protected _shapeType: string | undefined;
    protected _animation: AnimationProperties;
    protected _onModelURLChanged: EntityPropertyChangeObservable<IEntity>;
    protected _onAnimationChanged: EntityPropertyChangeObservable<IEntity>;

    constructor(id: string) {
        super(id, "Model");
        this._onModelURLChanged = this.createPropertyChangeObservable();
        this._onAnimationChanged = this.createPropertyChangeObservable();

        this._animation = new AnimationProperties(this._onAnimationChanged);
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
        if (value && value !== this._shapeType) {
            this._shapeType = value;
            this._onCollisionPropertiesChanged.isDirty = true;
        }
    }

    public get onModelURLChanged(): Observable<IEntity> {
        return this._onModelURLChanged.observable;
    }

    public get onAnimationChanged(): Observable<IEntity> {
        return this._onAnimationChanged.observable;
    }

    public get animation(): IAnimationProperties {
        return this._animation;
    }

    public copyFormPacketData(props: EntityProperties): void {
        super.copyFormPacketData(props);

        const modelProps = props as ModelEntityProperties;
        this.modelURL = modelProps.modelURL;

        if (modelProps.animation) {
            this._animation.running = modelProps.animation.animationPlaying;
            this._animation.loop = modelProps.animation.animationLoop;
        }

        this.shapeType = EntityMapper.mapToShapeType(modelProps.shapeType);
    }
}
