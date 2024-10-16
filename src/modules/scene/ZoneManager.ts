import { Scene, Vector3, AbstractMesh } from "@babylonjs/core";
import { ZoneEntityController } from "../entity/components/controllers/ZoneEntityController";
import Log from "@Modules/debugging/log";

export class ZoneManager {
    private _scene: Scene;
    private _currentZone: ZoneEntityController | null = null;
    private _lastUpdateTime: number = 0;
    private _updateInterval: number = 200; // Update every 200ms

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
        if (!camera) return;

        const cameraPosition = camera.position;
        let newZone: ZoneEntityController | null = null;

        this._scene.meshes.forEach(mesh => {
            const zoneController = mesh.metadata?.zoneController as ZoneEntityController | undefined;
            if (zoneController && this.isPointInside(cameraPosition, zoneController)) {
                newZone = zoneController;
            }
        });

        if (newZone !== this._currentZone) {
            if (this._currentZone) {
                Log.debug(Log.types.ENTITIES, `Exiting zone: ${this._currentZone.id}`);
                this._currentZone.deactivateZoneSettings();
            }
            if (newZone) {
                Log.debug(Log.types.ENTITIES, `Entering zone: ${newZone.id}`);
                newZone.activateZoneSettings();
            } else {
                Log.debug(Log.types.ENTITIES, "Not in any zone");
                // Optionally, activate default scene settings here
            }
            this._currentZone = newZone;
        }
    }

    private isPointInside(point: Vector3, zoneController: ZoneEntityController): boolean {
        const zoneMesh = zoneController.zoneMesh;
        if (!zoneMesh) return false;

        // Check if the zoneMesh is a compound shape (has child meshes)
        if (zoneMesh.getChildMeshes().length > 0) {
            // For compound shapes, check if the point is inside any child mesh
            return zoneMesh.getChildMeshes().some(childMesh => {
                if (childMesh instanceof AbstractMesh) {
                    return childMesh.intersectsPoint(point);
                }
                return false;
            });
        } else {
            // For simple shapes or single mesh compounds, use intersectsPoint
            return zoneMesh.intersectsPoint(point);
        }
    }
}
