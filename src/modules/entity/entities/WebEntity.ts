//
//  ShapeEntity.ts
//
//  Created by Nolan Huang on 3 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { IColorProperty } from "../EntityProperties";
import { IEntity, IWebEntity } from "../EntityInterfaces";
import { Entity, EntityPropertyChangeObservable } from "./Entity";
import { EntityProperties, WebEntityProperties, WebInputMode } from "@vircadia/web-sdk";
import { Observable } from "@babylonjs/core";

export class WebEntity extends Entity implements IWebEntity {
    protected _sourceUrl: string | undefined;

    protected _color: IColorProperty | undefined;

    protected _alpha: number | undefined;

    protected _dpi: number | undefined;

    protected _scriptUrl: string | undefined;

    protected _maxFps: number | undefined;

    protected _inputMode: WebInputMode | undefined;

    protected _showKeyboardFocusHighlight: boolean | undefined;

    protected _useBackground: boolean | undefined;

    protected _userAgent: string | undefined;

    protected _onColorChanged: EntityPropertyChangeObservable<IEntity>;
    protected _onSourceURLChanged: EntityPropertyChangeObservable<IEntity>;
    protected _onWebPropertiesChanged: EntityPropertyChangeObservable<IEntity>;

    constructor(id: string) {
        super(id, "Web");

        this._onColorChanged = this.createPropertyChangeObservable();
        this._onSourceURLChanged = this.createPropertyChangeObservable();
        this._onWebPropertiesChanged = this.createPropertyChangeObservable();
    }

    public get sourceUrl(): string | undefined {
        return this._sourceUrl;
    }

    public set sourceUrl(value: string | undefined) {
        if (undefined !== value && this._scriptUrl !== value) {
            this._sourceUrl = value;
            this._onSourceURLChanged.isDirty = true;
        }
    }

    public get color(): IColorProperty | undefined {
        return this._color;
    }

    public set color(value: IColorProperty | undefined) {
        if (undefined !== value && this._color !== value) {
            this._color = value;
            this._onColorChanged.isDirty = true;
        }
    }

    public get alpha(): number | undefined {
        return this._alpha;
    }

    public set alpha(value: number | undefined) {
        if (typeof value === "number" && this._alpha !== value) {
            this._alpha = value;
            this._onColorChanged.isDirty = true;
        }
    }

    public get dpi(): number | undefined {
        return this._dpi;
    }

    public set dpi(value: number | undefined) {
        if (typeof value === "number" && this._dpi !== value) {
            this._dpi = value;
            this._onWebPropertiesChanged.isDirty = true;
        }
    }

    public get scriptURL(): string | undefined {
        return this._scriptUrl;
    }

    public set scriptURL(value: string | undefined) {
        if (undefined !== value && this._scriptUrl !== value) {
            this._scriptUrl = value;
            this._onSourceURLChanged.isDirty = true;
        }
    }

    public get maxFPS(): number | undefined {
        return this._maxFps;
    }

    public set maxFPS(value: number | undefined) {
        if (typeof value === "number" && this._maxFps !== value) {
            this._maxFps = value;
            this._onWebPropertiesChanged.isDirty = true;
        }
    }

    public get inputMode(): WebInputMode | undefined {
        return this._inputMode;
    }

    public set inputMode(value: WebInputMode | undefined) {
        if (value !== undefined && this._inputMode !== value) {
            this._inputMode = value;
            this._onWebPropertiesChanged.isDirty = true;
        }
    }

    public get showKeyboardFocusHighlight(): boolean | undefined {
        return this._showKeyboardFocusHighlight;
    }

    public set showKeyboardFocusHighlight(value: boolean | undefined) {
        if (undefined !== value && this._showKeyboardFocusHighlight !== value) {
            this._showKeyboardFocusHighlight = value;
            this._onWebPropertiesChanged.isDirty = true;
        }
    }

    public get useBackground(): boolean | undefined {
        return this._useBackground;
    }

    public set useBackground(value: boolean | undefined) {
        if (undefined !== value && this._useBackground !== value) {
            this._useBackground = value;
            this._onWebPropertiesChanged.isDirty = true;
        }
    }

    public get userAgent(): string | undefined {
        return this._userAgent;
    }

    public set userAgent(value: string | undefined) {
        if (undefined !== value && this._userAgent !== value) {
            this._userAgent = value;
            this._onWebPropertiesChanged.isDirty = true;
        }
    }

    public get onColorChanged(): Observable<IEntity> {
        return this._onColorChanged.observable;
    }

    public get onSourceURLChanged(): Observable<IEntity> {
        return this._onSourceURLChanged.observable;
    }

    public get onWebPropertiesChanged(): Observable<IEntity> {
        return this._onWebPropertiesChanged.observable;
    }

    public copyFromPacketData(props: EntityProperties): void {
        super.copyFromPacketData(props);

        const webProps = props as WebEntityProperties;
        this.sourceUrl = webProps.sourceURL;
        this.scriptURL = webProps.scriptURL;
        this.color = webProps.color;
        this.alpha = webProps.alpha;
        this.dpi = webProps.dpi;
        this.inputMode = webProps.inputMode;
        this.showKeyboardFocusHighlight = webProps.showKeyboardFocusHighlight;
        this.useBackground = webProps.useBackground;
        this.userAgent = webProps.userAgent;
    }
}
