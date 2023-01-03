/* eslint-disable class-methods-use-this */
//
//  ligth.ts
//
//  Created by Nolan Huang on 27 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { GenericNodeComponent } from "../component";
import {
    DirectionalLight, Light, Nullable
} from "@babylonjs/core";

/**
 * A light component.
 */
export class LightComponent extends GenericNodeComponent<Light> {
    // private _light: Light;
    protected _light: Nullable<Light> = null;

    public get light(): Nullable<Light> {
        return this._light;
    }

    public set light(value: Nullable<Light>) {
        this.node = value;
    }

    public set node(value: Nullable<Light>) {
        this._light = value;
        super.node = value;
    }

    /**
    * Gets a string identifying the type of this Component
    * @returns "Light" string
    */
    public get componentType():string {
        return LightComponent.typeName;
    }

    static get typeName(): string {
        return "Light";
    }
}

export class AmbientLightComponent extends LightComponent {
    public get componentType():string {
        return AmbientLightComponent.typeName;
    }

    static get typeName(): string {
        return "AmbientLight";
    }
}

export class DirectionalLightComponent extends GenericNodeComponent<DirectionalLight> {
    public get componentType():string {
        return DirectionalLightComponent.typeName;
    }

    static get typeName(): string {
        return "DirectionalLight";
    }
}
