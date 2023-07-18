//
//  component.ts
//
//  Created by Nolan Huang on 20 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { Observable } from "@babylonjs/core";
import type { Node, Nullable } from "@babylonjs/core";
import { GameObject } from "./GameObject";

/**
 * Base interface for everything attached to game objects.
 */
export interface IComponent {
    /**
     * Attach this component to a particular game object.
     * @param gameObject The object to attach to.
     */
    attach(gameObject: GameObject): void;
    /**
     * Detach this component from its game object.
     */
    detach(): void;
    /**
     * Dispose of this component, freeing its associated resources.
     */
    dispose(): void;
    /**
     * A string identifying the type of this component.
     */
    get componentType(): string;
    /**
     * The GameObject this component is attached to.
     */
    get gameObject(): Nullable<GameObject>;
}

/**
 * Base class for everything attached to game objects.
 */
export abstract class AbstractComponent implements IComponent {
    protected _gameObject: Nullable<GameObject> = null;

    public attach(gameObject: GameObject):void {
        this._gameObject = gameObject;
    }

    public detach(): void {
        this._gameObject = null;
    }

    public abstract dispose(): void;

    public abstract get componentType(): string;

    public abstract get gameObject(): Nullable<GameObject>;
}

export abstract class GenericNodeComponent<T extends Node> extends AbstractComponent {
    protected _node: Nullable<T> = null;

    protected _onNodeAttachedObservable: Observable<T> = new Observable<T>();

    public get node(): Nullable<T> {
        return this._node;
    }

    public set node(node: Nullable<T>) {
        this._node = node;
        if (this._gameObject) {
            this.attach(this._gameObject);
        }
    }

    public get onNodeAttachedObservable(): Observable<T> {
        return this._onNodeAttachedObservable;
    }

    public get enable(): boolean {
        return this._node ? this._node.isEnabled() : false;
    }

    public set enable(value: boolean) {
        this._node?.setEnabled(value);
    }

    public attach(gameObject: GameObject): void {
        super.attach(gameObject);
        if (this._node) {
            this._node.parent = gameObject;
            this._onNodeAttachedObservable.notifyObservers(this._node);
        }
    }

    public detach(): void {
        if (this._node) {
            this._node.parent = null;
        }
        super.detach();
    }

    public dispose(): void {
        this._node?.dispose();
    }

    public get gameObject(): Nullable<GameObject> {
        return this._gameObject;
    }
}
