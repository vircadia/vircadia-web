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

import { IComponent } from "./component";
import { GameObject } from "./GameObject";
import { accessorDisplayInInspector } from "./decorators";

import {
    AbstractMesh
} from "@babylonjs/core";
/**
 *
 */
export class MeshComponent implements IComponent {
    _gameObject:Nullable<GameObject> = null;
    _mesh:AbstractMesh;

    constructor(mesh: AbstractMesh) {
        this._mesh = mesh;
    }

    @accessorDisplayInInspector()
    public get type():string {
        return this.getComponentType();
    }

    public attach(gameObject:GameObject):void {
        this._gameObject = gameObject;
        this._mesh.parent = gameObject;
    }

    public detatch():void {
        this._mesh.parent = null;
        this._gameObject = null;
    }

    /**
    * Gets a string identifying the type of this Component
    * @returns "Mesh" string
    */
    public getComponentType():string {
        return "Mesh";
    }
}
