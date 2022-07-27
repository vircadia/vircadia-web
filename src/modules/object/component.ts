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
