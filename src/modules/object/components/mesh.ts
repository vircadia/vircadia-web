/* eslint-disable class-methods-use-this */
//
//  mesh.ts
//
//  Created by Nolan Huang on 19 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { AbstractComponent } from "../component";
import { GameObject } from "../GameObject";

import {
    AbstractMesh
} from "@babylonjs/core";

/**
 * A mesh component.
 */
export class MeshComponent extends AbstractComponent {
    private _mesh: AbstractMesh;

    constructor(mesh: AbstractMesh) {
        super();
        this._mesh = mesh;
    }

    public get mesh(): AbstractMesh {
        return this._mesh;
    }

    public set mesh(value: AbstractMesh) {
        this._mesh = value;
    }

    public attach(gameObject:GameObject):void {
        super.attach(gameObject);
        this._mesh.parent = gameObject;
    }

    public detatch():void {
        this._mesh.parent = null;
        super.detatch();
    }

    public dispose():void {
        this._mesh.dispose();
    }

    /**
    * Gets a string identifying the type of this Component
    * @returns "Mesh" string
    */
    public get componentType():string {
        return "Mesh";
    }
}
