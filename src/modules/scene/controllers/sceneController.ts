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
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Vector3, Ray } from "@babylonjs/core";
import { ScriptComponent } from "@Modules/script";
import type { VScene } from "@Modules/scene/vscene";
import Log from "@Modules/debugging/log";

const DEFAULT_GRAVITY = 9.81;
const GROUND_DETECTION_LENGTH = 5; // FIXME: This is not a good system for detecting the ground.

export class SceneController extends ScriptComponent {
    private _vscene: VScene;
    public isGravityApplied = false;

    constructor(vscene: VScene) {
        super(SceneController.typeName);
        this._vscene = vscene;
    }

    public get componentType(): string {
        return SceneController.typeName;
    }

    public applyGravity(): void {
        const physicsEngine = this._scene.getPhysicsEngine();
        if (physicsEngine) {
            Log.info(Log.types.OTHER, `Apply gravity: ${DEFAULT_GRAVITY}`);
            physicsEngine.setGravity(new Vector3(0, -DEFAULT_GRAVITY, 0));
            const avatar = this._vscene.getMyAvatar();
            // TODO: Update to the V2 (Havok) physics engine, which provides improved methods for updating physics properties.
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-magic-numbers
            avatar?.physicsImpostor?.physicsBody?.setDamping(0.3, 0.3);
            this.isGravityApplied = true;
        }
    }

    public removeGravity(): void {
        const physicsEngine = this._scene.getPhysicsEngine();
        if (physicsEngine) {
            Log.info(Log.types.OTHER, "Remove gravity");
            physicsEngine.setGravity(new Vector3(0, 0, 0));
            const avatar = this._vscene.getMyAvatar();
            // TODO: Update to the V2 (Havok) physics engine, which provides improved methods for updating physics properties.
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            avatar?.physicsImpostor?.physicsBody?.setDamping(1, 1);
            this.isGravityApplied = true;
        }
    }

    /**
     * A string identifying the type of this component.
     * @returns `"SceneController"`
     */
    public static get typeName(): string {
        return "SceneController";
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public onInitialize(): void {
    }

    public onUpdate(): void {
        if (this._scene.isReady() && !this.isGravityApplied && this._detectGround()) {
            this.applyGravity();
        }
    }

    public onSceneReady(): void {
        this.isGravityApplied = false;
        const avatar = this._vscene.getMyAvatar();
        // Stop the avatar bouncing or floating.
        // TODO: Update to the V2 (Havok) physics engine, which provides improved methods for updating physics properties.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        avatar?.physicsImpostor?.physicsBody?.setDamping(1, 1);
    }

    private _detectGround(): boolean {
        const avatar = this._vscene.getMyAvatar();
        if (avatar) {
            // Position the raycast from the bottom center of the mesh.
            const raycastPosition = avatar.position.clone();
            const ray = new Ray(raycastPosition, Vector3.Down(), GROUND_DETECTION_LENGTH);
            const pick = this._scene.pickWithRay(ray, (mesh) => mesh.isPickable);

            if (pick && pick.hit && pick.pickedPoint && pick.pickedMesh) { // Grounded.
                Log.info(Log.types.OTHER, `Ground detected. Ground: ${pick.pickedMesh.name}.`);
                return true;
            }
        }
        return false;
    }
}
