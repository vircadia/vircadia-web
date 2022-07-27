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

import { AbstractComponent } from "../component";
import { GameObject } from "../GameObject";

import {
    Light
} from "@babylonjs/core";

/**
 * A light component.
 */
export class LightComponent extends AbstractComponent {
    private _light: Light;

    constructor(light: Light) {
        super();
        this._light = light;
    }

    public get light(): Light {
        return this._light;
    }

    public set light(value: Light) {
        this._light = value;
    }

    public attach(gameObject:GameObject):void {
        super.attach(gameObject);
        this._light.parent = gameObject;
    }

    public detatch():void {
        this._light.parent = null;
        super.detatch();
    }

    public dispose():void {
        this._light.dispose();
    }

    /**
    * Gets a string identifying the type of this Component
    * @returns "Mesh" string
    */
    public get componentType():string {
        return "Light";
    }
}
