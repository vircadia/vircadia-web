//
//  EntityBuilder.ts
//
//  Created by Nolan Huang on 26 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { ScriptComponent } from "@Modules/script";
import { NFTIconController, TeleportController } from ".";
import { EntityScriptComponent } from "./EntityScript";
import { IEntity } from "../../EntityInterfaces";
import Log from "@Modules/debugging/log";

type EntityScriptFactory = () => EntityScriptComponent;

class EntityScriptManagerImpl {
    _factories: Map<string, EntityScriptFactory>;

    constructor() {
        this._factories = new Map<string, EntityScriptFactory>();

        this.register(NFTIconController.typeName, () => new NFTIconController());
        this.register(TeleportController.typeName, () => new TeleportController());
    }

    public register(script: string, factory: EntityScriptFactory) {
        this._factories.set(script, factory);
    }

    public createScript(script: string, entity: IEntity): Nullable<ScriptComponent> {
        const factory = this._factories.get(script);

        if (!factory) {
            Log.error(Log.types.ENTITIES, `Fail to create entity script. Unknown Script: ${script}`);
            return undefined;
        }

        const entityScript = factory();
        entityScript.entity = entity;

        return entityScript;
    }
}

export const EntityScriptManager = new EntityScriptManagerImpl();
