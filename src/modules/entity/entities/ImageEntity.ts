//
//  ImageEntity.ts
//
//  Created by Nolan Huang on 24 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { IEntity, IImageEntity } from "../EntityInterfaces";
import { IRectProperty, IColorProperty } from "../EntityProperties";
import { Observable } from "@babylonjs/core";
import { Entity, EntityPropertyChangeObservable } from "./Entity";
import { EntityProperties, ImageEntityProperties } from "@vircadia/web-sdk";

export class ImageEntity extends Entity implements IImageEntity {

    protected _imageURL = "";
    protected _emissive: boolean | undefined;
    protected _keepAspectRatio: boolean | undefined;
    protected _subImage: IRectProperty | undefined;
    protected _color: IColorProperty | undefined;
    protected _alpha: number | undefined;
    protected _onImageURLChanged: EntityPropertyChangeObservable<IEntity>;
    protected _onColorChanged: EntityPropertyChangeObservable<IEntity>;

    constructor(id: string) {
        super(id, "Image");
        this._onImageURLChanged = this.createPropertyChangeObservable();
        this._onColorChanged = this.createPropertyChangeObservable();
    }

    public get imageURL(): string | undefined {
        return this._imageURL;
    }

    public set imageURL(value: string | undefined) {
        if (value && value !== this._imageURL) {
            this._imageURL = value;
            this._onImageURLChanged.isDirty = true;
        }
    }

    public get keepAspectRatio(): boolean | undefined {
        return this._keepAspectRatio;
    }

    public set keepAspectRatio(value: boolean | undefined) {
        this._keepAspectRatio = value;
        if (value && this._keepAspectRatio !== value) {
            this._keepAspectRatio = value;
            this._onDimensionChanged.isDirty = true;
        }
    }

    public get subImage(): IRectProperty | undefined {
        return this._subImage;
    }

    public set subImage(value: IRectProperty | undefined) {
        this._subImage = value;
        if (value) {
            this._subImage = value;
            this._onDimensionChanged.isDirty = true;
        }
    }

    public get color(): IColorProperty | undefined {
        return this._color;
    }

    public set color(value: IColorProperty | undefined) {
        if (value) {
            this._color = value;
            this._onColorChanged.isDirty = true;
        }
    }

    public get alpha(): number | undefined {
        return this._alpha;
    }

    public set alpha(value: number | undefined) {
        if (typeof value === "number") {
            this._alpha = value;
            this._onColorChanged.isDirty = true;
        }
    }

    public get emissive(): boolean | undefined {
        return this._emissive;
    }

    public set emissive(value: boolean | undefined) {
        if (value) {
            this._emissive = value;
            this._onColorChanged.isDirty = true;
        }
    }

    public get onColorChanged(): Observable<IEntity> {
        return this._onColorChanged.observable;
    }

    public get onImageURLChanged(): Observable<IEntity> {
        return this._onImageURLChanged.observable;
    }

    public copyFromPacketData(props: EntityProperties): void {
        super.copyFromPacketData(props);

        const imageProps = props as ImageEntityProperties;
        this.imageURL = imageProps.imageURL;
        this.subImage = imageProps.subImage;
        this.keepAspectRatio = imageProps.keepAspectRatio;
        this.emissive = imageProps.emissive;
        this.color = imageProps.color;
        this.alpha = imageProps.alpha;
    }
}
