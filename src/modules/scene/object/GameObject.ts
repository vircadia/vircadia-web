/* eslint-disable class-methods-use-this */
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

// This is disabled because TS complains about BABYLON's use of cap'ed function names
/* eslint-disable new-cap */

import {
    TransformNode,
    Scene
} from "@babylonjs/core";

import { IComponent } from "./component";
import { accessorDisplayInInspector } from "./decorators";

/**
 *
 */
export class GameObject extends TransformNode {
    _components : Map<string, IComponent>;

    constructor(name: string, scene?: Nullable<Scene>) {
        super(name, scene);
        this._components = new Map<string, IComponent>();
    }

    @accessorDisplayInInspector()
    public get type():string {
        return "GameObject";
    }

    public addComponent(component : IComponent) : void {
        this._components.set(component.getComponentType(), component);
        component.attach(this);
    }

    public getComponent(componentType : string) : IComponent | undefined {
        return this._components.get(componentType);
    }

    public removeComponent(componentType : string) : boolean {
        const component = this._components.get(componentType);
        if (component) {
            component.detatch();
            // eslint-disable-next-line @typescript-eslint/dot-notation
            return this._components.delete(componentType);
        }
        return false;
    }
}
