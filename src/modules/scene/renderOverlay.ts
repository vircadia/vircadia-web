//
//  renderOverlay.ts
//
//  Created by Giga on 21 Feb 2023.
//  Copyright 2023 Vircadia contributors.
//  Copyright 2023 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable new-cap */

import type { Scene } from "@babylonjs/core";
import { AbstractMesh, Mesh, MeshBuilder, PostProcess, PostProcessRenderEffect,
    PostProcessRenderPipeline, RenderTargetTexture, StandardMaterial, Vector3 } from "@babylonjs/core";
import { DEFAULT_MESH_RENDER_GROUP_ID } from "@Modules/object";

/**
 * Render a post process effect over top of the scene without interfering with other post processes.
 */
export class RenderOverlay {
    private scene: Scene;
    private postProcess: PostProcess | PostProcessRenderEffect | PostProcessRenderPipeline | undefined;
    private texture: RenderTargetTexture;
    private material: StandardMaterial;
    private mesh: Mesh;
    private enabled = true;
    private hasCameraTrack = false;
    private meshFilter;
    private renderSize = {
        width: 1,
        height: 1,
        ratio: 1
    };

    constructor(
        scene: Scene,
        postProcess?: PostProcess | PostProcessRenderEffect | PostProcessRenderPipeline,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        meshFilter = (mesh: AbstractMesh) => true
    ) {
        this.scene = scene;
        this.postProcess = postProcess;
        this.meshFilter = meshFilter;

        // Set the render size.
        this.setRenderSize();

        // Create the RenderOverlay's texture.
        this.texture = new RenderTargetTexture("RenderOverlayTexture", {
            width: this.renderSize.width,
            height: this.renderSize.height
        }, this.scene);
        this.texture.useCameraPostProcesses = false;
        this.texture.hasAlpha = true;
        this.texture.getAlphaFromRGB = true;

        // Add the postprocess to the texture.
        if (this.postProcess instanceof PostProcessRenderEffect) {
            this.postProcess.getPostProcesses()?.forEach((process) => {
                this.texture.addPostProcess(process);
            });
        } else if (this.postProcess instanceof PostProcess) {
            this.texture.addPostProcess(this.postProcess);
        } else if (this.postProcess instanceof PostProcessRenderPipeline) {
            // TODO.
        }

        // Create the RenderOverlay's material.
        this.material = new StandardMaterial("bloomMaterial", this.scene);
        this.material.diffuseTexture = this.texture;
        this.material.emissiveTexture = this.texture;
        this.material.useAlphaFromDiffuseTexture = true;
        this.material.backFaceCulling = false;

        // Create the RenderOverlay's mesh.
        this.mesh = MeshBuilder.CreateGround("bloomMesh", {
            width: 1,
            height: this.renderSize.ratio,
            updatable: true
        }, this.scene);
        this.mesh.material = this.material;
        this.mesh.billboardMode = Mesh.BILLBOARDMODE_ALL;
        this.mesh.rotate(Vector3.Left(), Math.PI / 2);
        this.mesh.position.y = 0.2;
        this.mesh.isPickable = false;
        this.mesh.renderingGroupId = DEFAULT_MESH_RENDER_GROUP_ID;

        // Register the RenderOverlay with the scene.
        this.scene.customRenderTargets.push(this.texture);
        this.scene.registerBeforeRender(() => {
            this.setRenderSize();
            this.hasCameraTrack = this.followActiveCamera();
            if (this.enabled && this.hasCameraTrack) {
                this.texture.renderList = this.scene.meshes.filter(meshFilter);
                this.mesh.visibility = 1;
            } else {
                this.mesh.visibility = 0;
            }
        });
    }

    private setRenderSize(): void {
        this.renderSize.width = this.scene.getEngine().getRenderWidth();
        this.renderSize.height = this.scene.getEngine().getRenderHeight();
        this.renderSize.ratio = this.renderSize.height / (this.renderSize.width || 1);
    }

    private followActiveCamera(): boolean {
        if (this.scene.activeCamera) {
            const cameraDirection = this.scene.activeCamera.getDirection(Vector3.Forward());
            const cameraPosition = this.scene.activeCamera.position;
            const planeDistance = this.renderSize.ratio;
            this.mesh.position = cameraPosition.subtract(cameraDirection.scale(planeDistance));
            return true;
        }
        return false;
    }

    /**
     * Enable the RenderOverlay.
     */
    enable(): void {
        this.enabled = true;
    }

    /**
     * Disable the RenderOverlay.
     */
    disable(): void {
        this.enabled = false;
    }

    /**
     * Dispose of the RenderOverlay, releasing resources associated with it.
     * (This cannot be undone.)
     */
    dispose(): void {
        this.mesh.dispose(false, true);
    }
}
