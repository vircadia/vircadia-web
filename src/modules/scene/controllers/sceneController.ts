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

/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Vector3, Ray } from "@babylonjs/core";
import { ScriptComponent } from "@Modules/script";
import type { VScene } from "@Modules/scene/vscene";
import Log from "@Modules/debugging/log";
import { ZoneManager } from "../ZoneManager";

// Character controller handles gravity automatically
// The Havok physics character controller manages gravity, collision detection,
// and ground detection internally. No manual physics body manipulation is needed.

export class SceneController extends ScriptComponent {
    private _vscene: VScene;
    private _zoneManager: ZoneManager;

    constructor(vscene: VScene) {
        super(SceneController.typeName);
        this._vscene = vscene;
        this._zoneManager = new ZoneManager(this._scene);
    }

    public get componentType(): string {
        return SceneController.typeName;
    }

    // Character controller manages its own gravity
    // These methods are kept for compatibility but do nothing
    public applyGravity(): void {
        Log.debug(Log.types.OTHER, "Gravity is managed by character controller");
    }

    public removeGravity(): void {
        Log.debug(Log.types.OTHER, "Gravity is managed by character controller");
    }

    /**
     * A string identifying the type of this component.
     * @returns `"SceneController"`
     */
    public static get typeName(): string {
        return "SceneController";
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public onInitialize(): void { }

    public onUpdate(): void {
        // Update zone detection
        this._zoneManager.update();
    }

    public onSceneReady(): void {
        // Character controller handles physics properties
    }

    // Ground detection is handled by character controller

    private _checkZones(): void {
        const avatar = this._vscene.getMyAvatar();
        if (avatar) {
            const avatarPosition = avatar.position;
            console.log(`Checking zones for avatar at position: ${avatarPosition.toString()}`);
            this._scene.meshes.forEach(mesh => {
                const zoneController = (mesh as any).zoneEntityController;
                if (zoneController && zoneController.isInside(avatarPosition)) {
                    console.log(`Avatar is inside zone: ${zoneController.zoneEntity.id}`);
                    // Apply zone properties
                    this._applyZoneProperties(zoneController.zoneEntity);
                }
            });
        }
    }

    private _applyZoneProperties(zoneEntity: any): void {
        // Implement zone properties application logic here
    }
}
