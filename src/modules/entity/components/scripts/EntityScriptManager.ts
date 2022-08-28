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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Log from "@Modules/debugging/log";

type EntityScriptFactory = () => ScriptComponent;

class EntityScriptManagerImpl {
    _factories : Map<string, EntityScriptFactory>;

    constructor() {
        this._factories = new Map<string, EntityScriptFactory>();

        this.register(NFTIconController.typeName, () => new NFTIconController());
        this.register(TeleportController.typeName, () => new TeleportController());
    }

    public register(script: string, factroy: EntityScriptFactory) {
        this._factories.set(script, factroy);
    }

    public createScript(script: string) : Nullable<ScriptComponent> {
        const factory = this._factories.get(script);

        if (!factory) {
            Log.error(Log.types.ENTITIES, `Fail to create entity script. Unknow Script: ${script}`);
            return undefined;
        }

        return factory();
    }
}

export const EntityScriptManager = new EntityScriptManagerImpl();
