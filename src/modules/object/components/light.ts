//
//  light.ts
//
//  Created by Nolan Huang on 27 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable class-methods-use-this */

import type { DirectionalLight, Light, Nullable } from "@babylonjs/core";
import { GenericNodeComponent } from "../component";

/**
 * A light component.
 */
export class LightComponent extends GenericNodeComponent<Light> {
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
     * A string identifying the type of this component.
     * @returns `"Light"`
     */
    public get componentType(): string {
        return LightComponent.typeName;
    }

    /**
     * A string identifying the type of this component.
     * @returns `"Light"`
     */
    static get typeName(): string {
        return "Light";
    }
}

export class AmbientLightComponent extends LightComponent {
    /**
     * A string identifying the type of this component.
     * @returns `"AmbientLight"`
     */
    public get componentType(): string {
        return AmbientLightComponent.typeName;
    }

    /**
     * A string identifying the type of this component.
     * @returns `"AmbientLight"`
     */
    static get typeName(): string {
        return "AmbientLight";
    }
}

export class DirectionalLightComponent extends GenericNodeComponent<DirectionalLight> {
    /**
     * A string identifying the type of this component.
     * @returns `"DirectionalLight"`
     */
    public get componentType(): string {
        return DirectionalLightComponent.typeName;
    }

    /**
     * A string identifying the type of this component.
     * @returns `"DirectionalLight"`
     */
    static get typeName(): string {
        return "DirectionalLight";
    }
}
