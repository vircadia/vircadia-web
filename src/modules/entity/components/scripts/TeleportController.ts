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
import Log from "@Modules/debugging/log";
// Domain Modules
import { inspector } from "@Modules/script";
import { Renderer, VScene } from "@Modules/scene";
import { EntityScriptComponent } from "./EntityScript";
import { Utility } from "@Modules/utility";


type ScriptParameters = {
    destination?: string | undefined,
};


export class TeleportController extends EntityScriptComponent {
    @inspector()
    _destination = "";

    private _vscene: VScene;

    constructor() {
        super(TeleportController.typeName);

        this._vscene = Renderer.getScene();
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
        this.triggerTarget = this._vscene.getMyAvatar();

        if (this.entity && this.entity.userData) {
            const param = JSON.parse(this.entity.userData) as ScriptParameters;
            if (param.destination) {
                this._destination = param.destination;
            } else {
                Log.error(Log.types.ENTITIES, "No Teleport destination of TeleportController");
            }
        }
    }

    // eslint-disable-next-line class-methods-use-this
    public onTriggerEnter() : void {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        Utility.connectionSetup(this._destination);
        /*
        if (this._vscene && this._destination.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this._vscene.goToDomain(this._destination);
        } */
    }
}
