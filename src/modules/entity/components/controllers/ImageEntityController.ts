//
//  ImageEntityController.ts
//
//  Created by Nolan Huang on 24 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable @typescript-eslint/no-unused-vars */
// Domain Modules
import { EntityController } from "./EntityController";
import { IImageEntity } from "../../EntityInterfaces";
import { ImageComponent } from "../components";
import Log from "@Base/modules/debugging/log";

export class ImageEntityController extends EntityController {
    // domain properties
    _imageEntity : IImageEntity;
    _imageComponent : Nullable<ImageComponent>;

    constructor(entity : IImageEntity) {
        super(entity, "ImageEntityController");
        this._imageEntity = entity;
    }

    /**
    * Gets a string identifying the type of this Component
    * @returns "EntityController" string
    */
    // eslint-disable-next-line class-methods-use-this
    public get componentType():string {
        return "ImageEntityController";
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function, class-methods-use-this
    public onInitialize(): void {
        super.onInitialize();

        this._imageComponent = new ImageComponent();
        this._gameObject?.addComponent(this._imageComponent);

        this._imageEntity.onImageURLChanged?.add(this._handleImageURLChanged.bind(this));
        this._imageEntity.onColorChanged?.add(this._handleonColorChanged.bind(this));
        this._imageEntity.onDimensionChanged?.add(this._handleonDimensionChanged.bind(this));
    }

    public onStart(): void {
        super.onStart();
        this._imageComponent?.load(this._imageEntity);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function, class-methods-use-this
    public onUpdate():void {

    }


    private _handleImageURLChanged(): void {
        this._imageComponent?.load(this._imageEntity);
    }

    private _handleonDimensionChanged(): void {
        this._imageComponent?.updateDimensions(this._imageEntity);
    }

    private _handleonColorChanged(): void {
        this._imageComponent?.updateColor(this._imageEntity);
    }
}
