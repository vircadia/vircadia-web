//
//  ZoneEntityController.ts
//
//  Created by Nolan Huang on 18 Aug 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* eslint-disable @typescript-eslint/no-magic-numbers */


import { watch } from "vue";
import { EntityController } from "./EntityController";
import { IZoneEntity } from "../../EntityInterfaces";
import { SkyboxComponent, KeyLightComponent, HazeComponent } from "../components";
import { AmbientLightComponent } from "@Modules/object";
import { AssetUrl } from "../../builders";
import {
    HemisphericLight, Vector3, DefaultRenderingPipeline, CubeTexture, HDRCubeTexture,
    VolumetricLightScatteringPostProcess, Nullable,
    Camera, Texture, StandardMaterial, SceneLoader, MeshBuilder, Mesh, Color3, Quaternion, AbstractMesh
} from "@babylonjs/core";
import { IVector3Property } from "../../EntityProperties";
import { EntityMapper } from "../../package";
import { userStore } from "@Stores/index";
import { ShapeType } from "../../EntityProperties";

type EnvironmentSettings = {
    environmentTexture?: string | undefined,
};

type GlowLayerSettings = {
    blurKernelSize?: number | undefined,
    intensity?: number | undefined
};

type VolumetricLightSettings = {
    textureURL: string | undefined,
    position: IVector3Property | undefined,
    dimensions: IVector3Property | undefined,
    samples: number | undefined
};

type RenderingPipelineSettings = {
    fxaaEnabled?: boolean | undefined,
    glowLayerEnabled?: boolean | undefined,
    glowLayer?: GlowLayerSettings | undefined
};

type PostProcessingSettings = {
    volumetricLightEnabled?: boolean | undefined,
    volumetricLight?: VolumetricLightSettings | undefined
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type SkyBoxSettings = {
    fxaaEnabled?: boolean | undefined,
    glowLayerEnabled?: boolean | undefined,
    glowLayer?: GlowLayerSettings | undefined
};

type ZoneExtensions = {
    environment?: EnvironmentSettings | undefined,
    renderingPipeline?: RenderingPipelineSettings | undefined,
    postProcessing?: PostProcessingSettings | undefined,
};

export class ZoneEntityController extends EntityController {
    private _zoneEntity: IZoneEntity;
    private _skybox: Nullable<SkyboxComponent> = null;
    private _ambientLight: Nullable<AmbientLightComponent> = null;
    private _keyLight: Nullable<KeyLightComponent> = null;
    private _haze: Nullable<HazeComponent> = null;
    private _vls: Nullable<VolumetricLightScatteringPostProcess> = null;
    private _watchingGraphicsSettings = false;
    private _zoneMesh: AbstractMesh | null = null;

    constructor(entity: IZoneEntity) {
        // Extract a unique identifier from the zone's ID
        let uniqueId = "unknown";
        if (entity.id) {
            const parts = entity.id.split('_');
            uniqueId = parts.length > 1 ? parts[1] : entity.id;
        }

        // Create a unique ID for this controller
        const controllerId = `ZoneEntityController_${uniqueId}`;

        super(entity, controllerId);
        this._zoneEntity = entity;
    }

    /**
    * Gets a string identifying the type of this Component
    * @returns "EntityController" string
    */
    // eslint-disable-next-line class-methods-use-this
    public get componentType(): string {
        return this.id; // This will now return the unique "ZoneEntityController_XXX" ID
    }

    static get typeName(): string {
        return "ZoneEntityController"; // This remains the same for the class type
    }

    public onInitialize(): void {
        super.onInitialize();

        this._zoneEntity.onShapeTypeChanged?.add(this._handleShapeTypeChanged.bind(this));
        this._zoneEntity.onCompoundShapeURLChanged?.add(this._handleCompoundShapeURLChanged.bind(this));
        this._zoneEntity.onSkyboxPropertiesChanged?.add(this._updateSkybox.bind(this));
        this._zoneEntity.onAmbientLightPropertiesChanged?.add(this.updateAmbientLight.bind(this));
        this._zoneEntity.onKeyLightPropertiesChanged?.add(this.updateKeyLight.bind(this));
        this._zoneEntity.onHazePropertiesChanged?.add(this.updateHaze.bind(this));
        this._zoneEntity.onUserDataChanged?.add(this._updateUserData.bind(this));

        this._zoneEntity.onDimensionChanged?.add(this._updateDimensions.bind(this));
        this._zoneEntity.onPositionAndRotationChanged?.add(this._updatePositionAndRotation.bind(this));
    }

    public onStart(): void {
        super.onStart();
        this._updateSkybox();
        this.updateAmbientLight();
        this.updateKeyLight();
        this.updateHaze();
        this._updateUserData();
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function, class-methods-use-this
    public onUpdate(): void {
    }

    public dispose(): void {
        if (this._scene.activeCamera && this._vls) {
            this._vls.dispose(this._scene.activeCamera);
        }
        super.dispose();
    }

    protected _handleShapeTypeChanged(): void {
        console.log(`Zone shape type changed to: ${this._zoneEntity.shapeType}`);
        // Here you could implement logic to change the zone's visual representation
        // or behavior based on the new shape type, if needed in the future.
    }

    protected _handleCompoundShapeURLChanged(): void {
        console.log(`Zone compound shape URL changed to: ${this._zoneEntity.compoundShapeURL}`);
        // Here you could implement logic to load and apply the compound shape
        // from the URL, if needed in the future.
    }

    protected _updateSkybox(): Promise<void> {
        return new Promise((resolve) => {
            if (this._zoneEntity.skyboxMode === "enabled" && this._zoneEntity.skybox && this._scene.activeCamera) {
                if (!this._skybox) {
                    this._skybox = new SkyboxComponent();
                    // Create the skybox mesh and add it to the scene
                    this._skybox.load(this._zoneEntity.skybox, this._zoneEntity.id, this._scene.activeCamera);
                    // The mesh is now added to the scene in the load method
                }
                this._skybox.update(this._zoneEntity.skybox);
                this._skybox.enable = true;
            } else if (this._skybox) {
                this._skybox.enable = false;
            }
            resolve();
        });
    }

    protected updateAmbientLight(): Promise<void> {
        return new Promise((resolve) => {
            if (this._zoneEntity.ambientLightMode === "enabled" && this._zoneEntity.ambientLight && this._gameObject) {
                if (!this._ambientLight) {
                    this._ambientLight = new AmbientLightComponent();
                    this._ambientLight.light = new HemisphericLight("AmbientLight", Vector3.Up(), this._gameObject.getScene());
                    this._gameObject.addComponent(this._ambientLight);
                }

                if (this._ambientLight.light) {
                    this._ambientLight.light.setEnabled(true);
                    if (typeof this._zoneEntity.ambientLight.ambientIntensity === "number") {
                        this._ambientLight.light.intensity = this._zoneEntity.ambientLight.ambientIntensity;
                        this._scene.environmentIntensity = this._zoneEntity.ambientLight.ambientIntensity;
                    }
                }

            } else if (this._ambientLight) {
                this._ambientLight.light?.setEnabled(false);
            }
            resolve();
        });
    }

    protected updateKeyLight(): Promise<void> {
        return new Promise((resolve) => {
            if (this._zoneEntity.keyLightMode === "enabled" && this._zoneEntity.keyLight && this._gameObject) {
                if (!this._keyLight) {
                    this._keyLight = new KeyLightComponent(this._zoneEntity.keyLight, this._gameObject.getScene());
                    this._gameObject.addComponent(this._keyLight);
                }
                this._keyLight.update(this._zoneEntity.keyLight);
                this._keyLight.enable = true;
            } else if (this._keyLight) {
                this._keyLight.enable = false;
            }
            resolve();
        });
    }

    protected updateHaze(): Promise<void> {
        return new Promise((resolve) => {
            if (this._zoneEntity.hazeMode === "enabled" && this._zoneEntity.haze && this._gameObject) {
                if (!this._haze) {
                    this._haze = new HazeComponent(this._zoneEntity.haze, this._gameObject.getScene());
                    this._gameObject.addComponent(this._haze);
                }
                this._haze.update(this._zoneEntity.haze);
                this._haze.enable = true;
            } else if (this._haze) {
                this._haze.enable = false;
            }
            resolve();
        });
    }

    protected _updateUserData(): Promise<void> {
        return new Promise((resolve) => {
            const userData = this._zoneEntity.userData
                ? JSON.parse(this._zoneEntity.userData) as ZoneExtensions
                : undefined;
            this._updateEnvironment(userData);
            this._updateDefaultRenderingPipeline(userData);
            this._updateVolumetricLight(userData);
            resolve();
        });
    }

    protected _updateEnvironment(userData: ZoneExtensions | undefined): void {
        if (userData && userData.environment && userData.environment.environmentTexture) {
            const newEnvUrl = userData.environment.environmentTexture;
            const url = new AssetUrl(newEnvUrl);

            const oldEnv = (this._scene.environmentTexture && this._scene.environmentTexture.name !== newEnvUrl)
                ? this._scene.environmentTexture
                : undefined;

            if (url.fileExtension === "hdr") {
                // Reduce cube size to lower memory, configurable via graphics settings.
                const configuredSize = Number(userStore.graphics.envHdrCubeSize) || 256;
                const size = configuredSize;
                this._scene.environmentTexture = new HDRCubeTexture(newEnvUrl, this._scene, size, false, true, false, true);
            } else if (url.fileExtension === "env") {
                this._scene.environmentTexture = new CubeTexture(newEnvUrl, this._scene);
            }

            if (oldEnv) {
                if (userStore.graphics.deferTextureDisposal) {
                    this._scene.onAfterRenderObservable.addOnce(() => {
                        try { oldEnv.dispose(); } catch { /* ignore */ }
                    });
                } else {
                    try { oldEnv.dispose(); } catch { /* ignore */ }
                }
            }
        }
    }

    protected _updateDefaultRenderingPipeline(userData: ZoneExtensions | undefined): void {
        if (!userData || !userData.renderingPipeline) {
            return;
        }
        let defaultPipeline = this._scene.postProcessRenderPipelineManager.supportedPipelines
            .find((value) => value.name === "default") as DefaultRenderingPipeline;
        if (!defaultPipeline) {
            defaultPipeline = new DefaultRenderingPipeline("default", true, this._scene, this._scene.cameras);
        }

        const glowLayer = userData.renderingPipeline.glowLayer;
        if (glowLayer && defaultPipeline.glowLayer) {
            if (typeof glowLayer.blurKernelSize === "number") {
                defaultPipeline.glowLayer.blurKernelSize = glowLayer.blurKernelSize;
            }
            if (typeof glowLayer.intensity === "number") {
                defaultPipeline.glowLayer.intensity = glowLayer.intensity;
            }
        }

        const updatePipelineSettings = (): void => {
            const enableBloomAndGlow = userStore.graphics.bloom && (userData?.renderingPipeline?.glowLayerEnabled ?? true);
            defaultPipeline.bloomEnabled = enableBloomAndGlow;
            defaultPipeline.fxaaEnabled = userStore.graphics.fxaaEnabled && (userData?.renderingPipeline?.fxaaEnabled ?? true);
            defaultPipeline.glowLayerEnabled = enableBloomAndGlow;
            defaultPipeline.samples = Number(userStore.graphics.msaa);
            defaultPipeline.sharpenEnabled = Boolean(userStore.graphics.sharpen);
        };

        // Update the rendering pipeline when the user changes their graphics settings.
        const watchGraphicsSettings = (): void => {
            // Ensure only one watcher is created.
            if (!this._watchingGraphicsSettings) {
                watch(() => userStore.graphics, updatePipelineSettings.bind(this), { deep: true });
                this._watchingGraphicsSettings = true;
            }
        };

        updatePipelineSettings();
        watchGraphicsSettings();
    }

    protected _updateVolumetricLight(userData: ZoneExtensions | undefined): void {
        const volumetricLightEnabled = userData?.postProcessing?.volumetricLightEnabled;
        const volumetricLightSettings = userData?.postProcessing?.volumetricLight;
        if (volumetricLightEnabled && volumetricLightSettings) {
            if (!this._vls) {
                this._vls = new VolumetricLightScatteringPostProcess(
                    "vls", 1.0, this._scene._activeCamera as Camera,
                    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                    undefined, volumetricLightSettings.samples && 100,
                    Texture.BILINEAR_SAMPLINGMODE,
                    this._scene.getEngine(), false);
                this._vls.mesh.parent = this._gameObject;
            }

            const material = this._vls.mesh.material as StandardMaterial;
            if (material) {
                if (volumetricLightSettings.textureURL) {
                    material.diffuseTexture = new Texture(
                        volumetricLightSettings.textureURL,
                        this._scene, true, false, Texture.BILINEAR_SAMPLINGMODE);
                    material.diffuseTexture.hasAlpha = true;
                } else {
                    this._vls.useDiffuseColor = true;
                }
            }

            if (volumetricLightSettings.position) {
                this._vls.mesh.position = EntityMapper.mapToVector3(volumetricLightSettings.position);
            }

            if (volumetricLightSettings.dimensions) {
                this._vls.mesh.scaling = EntityMapper.mapToScale(volumetricLightSettings.dimensions);
            }

        } else if (this._vls) {
            this._vls.mesh.isVisible = false;
        }
    }

    public createZoneMesh(): void {
        if (this._zoneMesh) {
            console.warn(`Zone mesh already exists for zone ${this._zoneEntity.id}`);
            return;
        }

        if (this._zoneEntity.compoundShapeURL) {
            this._createCompoundShapeMesh();
        } else if (this._zoneEntity.shapeType) {
            this._createShapeTypeMesh();
        } else {
            console.warn(`No shape type or compound shape URL specified for zone ${this._zoneEntity.id}`);
        }
    }

    private _createShapeTypeMesh(): void {
        if (!this._zoneEntity.shapeType) {
            console.warn(`No shape type specified for zone entity ${this._zoneEntity.id}`);
            return;
        }

        const meshName = `zoneMesh_${this._zoneEntity.id}`;

        switch (this._zoneEntity.shapeType) {
            case ShapeType.Box:
                this._zoneMesh = MeshBuilder.CreateBox(meshName, { size: 1 }, this._scene);
                break;
            case ShapeType.Sphere:
                this._zoneMesh = MeshBuilder.CreateSphere(meshName, { diameter: 1 }, this._scene);
                break;
            // Add other shape types as needed
            default:
                console.warn(`Unsupported shape type: ${this._zoneEntity.shapeType} for zone ${this._zoneEntity.id}`);
                return;
        }

        this._setupZoneMesh();
    }

    private _createCompoundShapeMesh(): void {
        const zoneId = this._zoneEntity.id;
        const meshName = `zoneMesh_${zoneId}`;
        const shapeURL = this._zoneEntity.compoundShapeURL || '';
        SceneLoader.ImportMesh("", shapeURL, "", this._scene, (meshes) => {
            if (meshes.length > 0) {
                // Find the mesh that represents the compound shape
                const compoundMesh = meshes.find(mesh => mesh.name !== "__root__") || meshes[0];

                if (compoundMesh instanceof AbstractMesh) {
                    this._zoneMesh = compoundMesh;
                    this._zoneMesh.name = meshName;
                    this._zoneMesh.id = meshName;  // Set the ID to match the name

                    // Remove any parent-child relationships
                    this._zoneMesh.parent = null;
                    this._zoneMesh.getChildMeshes().forEach(child => {
                        if (child instanceof AbstractMesh) {
                            child.parent = this._zoneMesh;
                        }
                    });
                } else {
                    console.warn(`Compound mesh for zone ${zoneId} is not an AbstractMesh instance`);
                    return;
                }

                // Dispose of all other imported meshes
                meshes.forEach(mesh => {
                    if (mesh !== this._zoneMesh && this._zoneMesh && !mesh.isDescendantOf(this._zoneMesh)) {
                        mesh.dispose();
                    }
                });

                this._setupZoneMesh();
            } else {
                console.error(`No meshes imported for zone ${zoneId}`);
            }
        });
    }

    private _setupZoneMesh(): void {
        if (this._zoneMesh && this._zoneEntity && this._gameObject) {
            this._zoneMesh.parent = this._gameObject;
            this._zoneMesh.position = Vector3.Zero();
            this._zoneMesh.rotationQuaternion = Quaternion.Identity();

            if (this._zoneEntity.dimensions) {
                this._zoneMesh.scaling = new Vector3(
                    this._zoneEntity.dimensions.x,
                    this._zoneEntity.dimensions.y,
                    this._zoneEntity.dimensions.z
                );
            }

            const material = new StandardMaterial(`zoneMaterial_${this._zoneEntity.id}`, this._scene);
            material.alpha = 0.3;
            material.diffuseColor = new Color3(1, 0, 0);
            this._zoneMesh.material = material;
            this._zoneMesh.isPickable = true;

            // Set metadata for the mesh
            this._zoneMesh.metadata = { zoneController: this };

            console.log(`Zone mesh setup complete for zone ${this._zoneEntity.id}.`);
            console.log(`Zone mesh name: ${this._zoneMesh.name}`);
            console.log(`Zone mesh ID: ${this._zoneMesh.id}`);
            console.log(`Zone mesh parent: ${this._zoneMesh.parent?.name}`);
            console.log(`Zone position: ${this._gameObject.position.toString()}`);
            console.log(`Zone mesh local scaling: ${this._zoneMesh.scaling.toString()}`);
        } else {
            console.warn(`Zone mesh or zone entity is undefined in _setupZoneMesh for zone ${this._zoneEntity.id}`);
        }
    }

    // Remove or modify this method as it's no longer needed for skybox dimensions
    protected _updateDimensions(): void {
        // This method may still be needed for other zone-related updates,
        // but remove any skybox-specific code
    }

    public get zoneMesh(): AbstractMesh | null {
        return this._zoneMesh;
    }

    public activateZoneSettings(): void {
        Promise.all([
            this._updateSkybox(),
            this.updateAmbientLight(),
            this.updateKeyLight(),
            this.updateHaze(),
            this._updateUserData()
        ]).then(() => {
            console.log(`Activated settings for zone ${this._zoneEntity.id}`);
        });
    }

    public deactivateZoneSettings(): void {
        if (this._skybox) {
            this._skybox.enable = false;
        }
        if (this._ambientLight) {
            this._ambientLight.light?.setEnabled(false);
        }
        if (this._keyLight) {
            this._keyLight.enable = false;
        }
        if (this._haze) {
            this._haze.enable = false;
        }
        // Revert any user data changes if necessary
        console.log(`Deactivated settings for zone ${this._zoneEntity.id}`);
    }
}