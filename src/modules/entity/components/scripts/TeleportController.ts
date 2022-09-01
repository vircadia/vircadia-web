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
/* eslint-disable @typescript-eslint/no-magic-numbers */
import Log from "@Modules/debugging/log";
// Domain Modules
import { inspector } from "@Modules/script";
import { Renderer, VScene } from "@Modules/scene";
import { EntityScriptComponent } from "./EntityScript";
import { Utility } from "@Modules/utility";

import { Vector3, Quaternion } from "@babylonjs/core";
import { GameObject } from "@Modules/object";
import { AvatarController } from "@Modules/avatar";


type ScriptParameters = {
    destination?: string | undefined
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
        this._vscene.myAvatarModelChangedObservable.add((myAvatar) => {
            this.triggerTarget = myAvatar;
        });
    }

    // eslint-disable-next-line class-methods-use-this
    public onTriggerEnter() : void {
        Log.debug(Log.types.ENTITIES, "onTriggerEnter");

        const avatar = this.triggerTarget as GameObject;
        if (!avatar) {
            return;
        }

        const controller = avatar.getComponent(AvatarController.typeName) as AvatarController;

        if (controller && !controller.isTeleported) {
            if (this._destination.includes("wss://") || this._destination.includes("ws://")) {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                Utility.connectionSetup(this._destination);
            } else {
                const index1 = this._destination.indexOf("/");
                let index2 = this._destination.lastIndexOf("/");
                // prevent no quaternion string
                index2 = index2 === index1 ? this._destination.length : index2;

                let position = undefined;
                let rotationQuat = undefined;
                const posStr = this._destination.substring(index1 + 1, index2);
                const vec3 = posStr.split(",").map((value) => Number(value));
                if (vec3.length >= 3) {
                    position = new Vector3(...vec3);
                }

                const orientStr = this._destination.substring(index2 + 1);
                const vec4 = orientStr.split(",").map((value) => Number(value));
                if (vec4.length >= 4) {
                    rotationQuat = new Quaternion(...vec4);
                }

                // const avatar = this.triggerTarget;
                /*
                if (avatar) {
                if (position) {
                    avatar.position = position;
                }
                if (rotationQuat) {
                    avatar.rotationQuaternion = rotationQuat;
                }
                }
                */
                this._vscene.teleportMyAvatar(position, rotationQuat);
            }

            // controller.isTeleported = true;
        }
    }

}
