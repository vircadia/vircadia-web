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
    Mesh,
    Observable,
    Nullable
} from "@babylonjs/core";

import { IComponent } from "./component";

import Log from "@Modules/debugging/log";


/**
 * Base class for all objects in scenes.
 */
export class GameObject extends Mesh {
    _components : Map<string, IComponent>;
    protected _childGameObjects: Array<GameObject> = new Array<GameObject>();
    protected _onComponentAddedObservable: Observable<IComponent> = new Observable<IComponent>();

    private static _gameObjects : Array<GameObject> = new Array<GameObject>();
    private static _dontDestroyOnLoadList : Array<GameObject> = new Array<GameObject>();
    private static _onGameObjectAddedObservable: Observable<GameObject> = new Observable<GameObject>();

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

    public get onComponentAddedObservable(): Observable<IComponent> {
        return this._onComponentAddedObservable;
    }

    /**
    * Adds a component to this game object.
    */
    public addComponent(component : IComponent) : void {
        this._components.set(component.componentType, component);
        component.attach(this);
        this._onComponentAddedObservable.notifyObservers(component);
    }

    /**
    * Gets the component of specific type from this game object.
    */
    public getComponent(componentType : string) : IComponent | undefined {
        return this._components.get(componentType);
    }

    public hasComponent(componentType : string) : boolean {
        return this._components.has(componentType);
    }

    public addChildGameObject(gameObject: GameObject) : void {
        if (gameObject.parent !== this) {
            gameObject.parent = this;
            this._childGameObjects.push(gameObject);
        }
    }

    public getChildGameObjectByName(name: string) : GameObject | undefined {
        return this._childGameObjects.find((gameObject) => gameObject.name === name);
    }

    public removeChildGameObject(gameObject: GameObject) : void {
        if (gameObject.parent !== this) {
            Log.warn(Log.types.ENTITIES, `GameObject ${this.name} does not has child ${gameObject.name}`);
            return;
        }

        const index = this._childGameObjects.indexOf(gameObject);
        if (index !== -1) {
            this._childGameObjects.splice(index, 1);
        }

        gameObject.parent = null;
    }

    public getChildGameObjects() : GameObject[] {
        return this._childGameObjects;
    }

    public getParent() : GameObject {
        return this.parent as GameObject;
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
        this._components.forEach((comp) => {
            comp.dispose();
        });

        this._components.clear();

        GameObject._removeGameObject(this);

        super.dispose(doNotRecurse, disposeMaterialAndTextures);
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

    public static get onGameObjectAddedObservable(): Observable<GameObject> {
        return this._onGameObjectAddedObservable;
    }

    public static dontDestroyOnLoad(target: GameObject) : void {
        this._dontDestroyOnLoadList.push(target);
    }

    private static _addGameObject(target: GameObject) {
        this._gameObjects.push(target);
        this._onGameObjectAddedObservable.notifyObservers(target);
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
