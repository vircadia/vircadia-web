/* eslint-disable class-methods-use-this */
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

import { GameObject } from "./GameObject";
import {
    Node
} from "@babylonjs/core";

/**
 * Base interfance for everything attached to GameObjects
 */
export interface IComponent {
    attach(gameObject:GameObject):void;
    detatch():void;
    dispose():void;
    get componentType():string;
}

export abstract class AbstractComponent implements IComponent {
    protected _gameObject:Nullable<GameObject> = null;

    public attach(gameObject:GameObject):void {
        this._gameObject = gameObject;
    }

    public detatch():void {
        this._gameObject = null;
    }

    public abstract dispose():void;

    public abstract get componentType():string;
}

export abstract class GenericNodeComponent<T extends Node> extends AbstractComponent {
    protected _node:Nullable<T> = undefined;

    public get node() : Nullable<T> {
        return this._node;
    }

    public set node(n: Nullable<T>) {
        this._node = n;
        if (this._gameObject) {
            this.attach(this._gameObject);
        }
    }

    public get enable() : boolean {
        return this._node ? this._node.isEnabled() : false;
    }

    public set enable(value : boolean) {
        this._node?.setEnabled(value);
    }

    public attach(gameObject:GameObject):void {
        super.attach(gameObject);
        if (this._node) {
            this._node.parent = gameObject;
        }
    }

    public detatch():void {
        if (this._node) {
            this._node.parent = null;
        }
        super.detatch();
    }

    public dispose():void {
        this._node?.dispose();
    }

}
