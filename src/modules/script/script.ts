//
//  script.ts
//
//  Created by Nolan Huang on 19 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { IComponent, GameObject } from "@Modules/object";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { inspectorAccessor } from "./decorators";

import {
    // Scene,
    TransformNode
} from "@babylonjs/core";

/* eslint-disable class-methods-use-this */
/**
 * The base class from which every script derives
 */
export abstract class ScriptComponent extends TransformNode implements IComponent {
    _gameObject:Nullable<GameObject> = null;

    public attach(gameObject:GameObject):void {
        this._gameObject = gameObject;
        this.parent = gameObject;
    }

    public detatch():void {
        this.parent = null;
        this._gameObject = null;
    }

    /**
    * Gets a string identifying the type of this Component
    * @returns "Script" string
    */
    @inspectorAccessor()
    public get componentType():string {
        return "Script";
    }

    /**
     * Called on the node is being initialized.
     */
    public onInitialize(): void {
    // ...
    }

    /**
     * Called on the scene starts.
     */
    public onStart(): void {
    // ...
    }

    /**
     * Called each frame.
     */
    public onUpdate(): void {
    // ...
    }

    /**
     * Called on the object has been disposed.
     * Object can be disposed manually or when the editor stops running the scene.
     */
    public onStop(): void {
    // ...
    }
}
