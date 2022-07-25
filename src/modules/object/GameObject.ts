//
//  gameobj.ts
//
//  Created by Nolan Huang on 20 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */
// This is disabled because TS complains about BABYLON's use of cap'ed function names
/* eslint-disable new-cap */

import {
    TransformNode,
    Node,
    Scene,
    Mesh
} from "@babylonjs/core";

import { IComponent } from "./component";

import Log from "@Modules/debugging/log";

/**
 * Base class for all objects in scenes.
 */
export class GameObject extends Mesh {
    _components : Map<string, IComponent>;

    constructor(name: string, scene?: Nullable<Scene>) {
        super(name, scene);
        this._components = new Map<string, IComponent>();
    }

    public get type():string {
        return "GameObject";
    }

    /**
    * Adds a component to this game object.
    */
    public addComponent(component : IComponent) : void {
        this._components.set(component.componentType, component);
        component.attach(this);
    }

    /**
    * Gets the component of specific type from this game object.
    */
    public getComponent(componentType : string) : IComponent | undefined {
        return this._components.get(componentType);
    }

    /**
    * Removes the component of specific type from this game object.
    * @param dispose true will also dispose the componet when remove it.
    */
    public removeComponent(componentType : string, dispose = true) : boolean {
        const component = this._components.get(componentType);
        if (component) {
            component.detatch();
            if (dispose) {
                component.dispose();
            }
            return this._components["delete"](componentType);
        }
        return false;
    }
}
