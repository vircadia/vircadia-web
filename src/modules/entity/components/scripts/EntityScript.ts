//
//  EntityScript.ts
//
//  Created by Nolan Huang on 28 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { ScriptComponent } from "@Modules/script";
import { IEntity } from "../../EntityInterfaces";

export abstract class EntityScriptComponent extends ScriptComponent {
    protected _entity: Nullable<IEntity> = null;

    public get entity(): Nullable<IEntity> {
        return this._entity;
    }

    public set entity(value: Nullable<IEntity>) {
        this._entity = value;
    }

    /**
    * Gets a string identifying the type of this Component
    * @returns "EntityController" string
    */
    // eslint-disable-next-line class-methods-use-this
    public get componentType(): string {
        return EntityScriptComponent.typeName;
    }

    static get typeName(): string {
        return "EntityScript";
    }
}
