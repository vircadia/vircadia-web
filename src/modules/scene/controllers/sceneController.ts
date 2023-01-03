//
//  sceneController.ts
//
//  Created by Nolan Huang on 1 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable new-cap */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { ScriptComponent } from "@Modules/script";

// Domain Modules
import { VScene } from "../vscene";
import { Vector3, Ray } from "@babylonjs/core";
import Log from "@Modules/debugging/log";

const DEFAULT_GRAVITY = 9.81;
const GROUND_DETECTION_LENGTH = 5; // FIXME: This is not a good system for detecting the ground.

export class SceneController extends ScriptComponent {
    _vscene : VScene;
    isGravityApplied = false;

    constructor(vscene : VScene) {
        super(SceneController.typeName);
        this._vscene = vscene;
    }

    public get componentType():string {
        return SceneController.typeName;
    }

    public applyGravity() : void {
        const physicsEngine = this._scene.getPhysicsEngine();
        if (physicsEngine) {
            Log.info(Log.types.OTHER, `Apply gravity: ${DEFAULT_GRAVITY}`);
            physicsEngine.setGravity(new Vector3(0, -DEFAULT_GRAVITY, 0));
            const avatar = this._vscene.getMyAvatar();
            if (avatar) {
                avatar.physicsImpostor?.physicsBody.setDamping(0, 0);
            }

            this.isGravityApplied = true;
        }
    }

    static get typeName(): string {
        return "SceneController";
    }

    public onInitialize(): void {

    }

    public onUpdate():void {
        if (!this.isGravityApplied && this._scene.isReady()) {
            if (this._detectGround()) {
                this.applyGravity();
            }
        }
    }

    public onSceneReady():void {
        this.isGravityApplied = false;
        const avatar = this._vscene.getMyAvatar();
        if (avatar) {
            // prevent avatar bounce or float
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            avatar.physicsImpostor?.physicsBody.setDamping(1, 1);
        }
    }

    private _detectGround() : boolean {
        const avatar = this._vscene.getMyAvatar();
        if (avatar) {
            // position the raycast from bottom center of mesh
            const raycastPosition = avatar.position.clone();

            const ray = new Ray(raycastPosition, Vector3.Down(), GROUND_DETECTION_LENGTH);

            const pick = this._scene.pickWithRay(ray,
                (mesh) => mesh.isPickable);

            if (pick && pick.hit && pick.pickedPoint && pick.pickedMesh) { // grounded
                Log.info(Log.types.OTHER, `Ground detected. Ground: ${pick.pickedMesh.name}`);
                return true;
            }
        }
        return false;
    }
}
