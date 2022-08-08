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

    static _gameObjects : Array<GameObject> = new Array<GameObject>();
    static _dontDestroyOnLoadList : Array<GameObject> = new Array<GameObject>();

    constructor(name: string, scene?: Nullable<Scene>) {
        super(name, scene);
        this._components = new Map<string, IComponent>();

        GameObject._addGameObject(this);
    }

    public get type():string {
        return "GameObject";
    }

    public get components() : Map<string, IComponent> {
        return this._components;
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

    /**
     * Releases resources associated with this node.
     * @param doNotRecurse Set to true to not recurse into each children (recurse into each children by default)
     * @param disposeMaterialAndTextures Set to true to also dispose referenced materials and textures (false by default)
     */
    public dispose(doNotRecurse?: boolean, disposeMaterialAndTextures = false): void {
        super.dispose(doNotRecurse, disposeMaterialAndTextures);
        GameObject._removeGameObject(this);
    }

    public static getGameObjectByID(id:string) : GameObject | undefined {
        return this._gameObjects.find((value) => value.id === id);
    }

    public static get gameObjects() : GameObject[] {
        return this._gameObjects;
    }

    public static get dontDestroyOnLoadList() : GameObject[] {
        return this._dontDestroyOnLoadList;
    }

    public static dontDestroyOnLoad(target: GameObject) : void {
        this._dontDestroyOnLoadList.push(target);
    }

    private static _addGameObject(target: GameObject) {
        this._gameObjects.push(target);
    }

    private static _removeGameObject(target: GameObject) {
        const index = this._gameObjects.indexOf(target);
        if (index !== -1) {
            // Remove from the scene if mesh found
            this._gameObjects[index] = this._gameObjects[this._gameObjects.length - 1];
            this._gameObjects.pop();
        }
    }
}
