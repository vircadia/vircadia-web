//
//  TeleportController.ts
//
//  Created by Nolan Huang on 26 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-unused-vars */
// General Modules
import {
    AbstractMesh
} from "@babylonjs/core";
import { GameObject } from "@Modules/object";
import Log from "@Modules/debugging/log";
// Domain Modules
import { ScriptComponent, inspector } from "@Modules/script";
import { Renderer, VScene } from "@Modules/scene";

export class TeleportController extends ScriptComponent {
    @inspector()
    _destination = "";

    private _vscene: VScene;

    constructor() {
        super(TeleportController.typeName);

        this._vscene = Renderer.getScene();
        this._destination = "SpaceStationt";
    }

    /**
    * Gets a string identifying the type of this Component
    * @returns "EntityController" string
    */
    // eslint-disable-next-line class-methods-use-this
    public get componentType():string {
        return TeleportController.typeName;
    }

    static get typeName(): string {
        return "TeleportController";
    }

    public onInitialize(): void {
        super.onInitialize();

        this.triggerTarget = this._vscene.getMyAvatar();
    }

    // eslint-disable-next-line class-methods-use-this
    public onTriggerEnter() : void {
        Log.debug(Log.types.ENTITIES, `onTriggerEnter:`);

        if (this._vscene && this._destination.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this._vscene.goToDomain(this._destination);
        }
    }
}
