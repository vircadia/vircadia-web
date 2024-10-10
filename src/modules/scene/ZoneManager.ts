import { Scene, Vector3, AbstractMesh } from "@babylonjs/core";
import { ZoneEntityController } from "../entity/components/controllers/ZoneEntityController";
import Log from "@Modules/debugging/log";

interface ZoneMeshMetadata {
    zoneController?: ZoneEntityController;
}

export class ZoneManager {
    private _scene: Scene;
    private _currentZone: ZoneEntityController | null = null;
    private _lastUpdateTime = 0;
    private _updateInterval = 200; // Update every 200ms

    constructor(scene: Scene) {
        this._scene = scene;
    }

    public update(): void {
        const currentTime = Date.now();
        // Only update if enough time has passed
        if (currentTime - this._lastUpdateTime < this._updateInterval) {
            return;
        }

        this._lastUpdateTime = currentTime;

        const camera = this._scene.activeCamera;
        if (!camera) {
            return;
        }

        const cameraPosition = camera.position;
        let newZone: ZoneEntityController | null = null;

        this._scene.meshes.forEach((mesh: AbstractMesh) => {
            const metadata = mesh.metadata as ZoneMeshMetadata | undefined;
            const zoneController = metadata?.zoneController;
            if (zoneController && this.isPointInside(cameraPosition, zoneController)) {
                newZone = zoneController;
            }
        });

        if (newZone !== this._currentZone) {
            if (this._currentZone) {
                Log.debug(Log.types.ENTITIES, `Exiting zone: ${this._currentZone.id}`);
            }
            if (newZone) {
                Log.debug(Log.types.ENTITIES, `Entering zone: ${newZone.id}`);
            } else {
                Log.debug(Log.types.ENTITIES, "Not in any zone");
            }
            this._currentZone = newZone;
        }
    }

    private isPointInside(point: Vector3, zoneController: ZoneEntityController): boolean {
        const zoneMesh = zoneController.zoneMesh;
        if (!zoneMesh) {
            return false;
        }
        return zoneMesh.intersectsPoint(point);
    }
}
